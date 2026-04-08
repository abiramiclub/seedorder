export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { geocodeZip } from '@/lib/apis/census';
import { fetchHardinessZone } from '@/lib/apis/hardiness';
import { fetchSoilData } from '@/lib/apis/usda-soil';
import { fetchClimateData } from '@/lib/apis/noaa';
import { prisma } from '@/lib/utils/prisma';
import type { LocationReport } from '@/types/location';

const CACHE_TTL_DAYS = 30;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const zip = request.nextUrl.searchParams.get('zip');
  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Valid 5-digit zip code required' }, { status: 400 });
  }

  // Check cache first
  const cached = await prisma.zipCache.findUnique({ where: { zipCode: zip } });
  if (cached && cached.expiresAt > new Date()) {
    const report: LocationReport = {
      location: JSON.parse(cached.locationJson),
      hardinessZone: JSON.parse(cached.hardinessJson),
      soil: JSON.parse(cached.soilJson),
      climate: JSON.parse(cached.climateJson),
    };
    return NextResponse.json(report);
  }

  // Fetch fresh data
  const location = await geocodeZip(zip);
  const [hardinessZone, soil, climate] = await Promise.all([
    fetchHardinessZone(location.lat, location.lng),
    fetchSoilData(location.lat, location.lng),
    fetchClimateData(location.lat, location.lng),
  ]);

  const report: LocationReport = { location, hardinessZone, soil, climate };

  // Cache the result
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.zipCache.upsert({
    where: { zipCode: zip },
    update: {
      locationJson: JSON.stringify(location),
      hardinessJson: JSON.stringify(hardinessZone),
      soilJson: JSON.stringify(soil),
      climateJson: JSON.stringify(climate),
      fetchedAt: now,
      expiresAt,
    },
    create: {
      zipCode: zip,
      locationJson: JSON.stringify(location),
      hardinessJson: JSON.stringify(hardinessZone),
      soilJson: JSON.stringify(soil),
      climateJson: JSON.stringify(climate),
      fetchedAt: now,
      expiresAt,
    },
  });

  return NextResponse.json(report);
}
