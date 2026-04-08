import type { HardinessZone } from '@/types/location';

export async function fetchHardinessZone(lat: number, lng: number, zipCode?: string): Promise<HardinessZone> {
  // Try USDA's official zip-based API first
  if (zipCode) {
    try {
      return await fetchByZip(zipCode);
    } catch {
      // fall through to coordinate-based lookup
    }
  }

  // Fallback: phzmapi.org coordinate lookup
  return await fetchByCoords(lat, lng);
}

async function fetchByZip(zip: string): Promise<HardinessZone> {
  const res = await fetch(
    `https://planthardiness.ars.usda.gov/api/index.cfm?zip=${zip}`,
    { headers: { Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error(`USDA hardiness API error: ${res.status}`);

  const data = await res.json() as {
    hardiness_zone?: string;
    zone?: string;
    trange?: string;
  };

  const zone = data.hardiness_zone ?? data.zone ?? '';
  if (!zone) throw new Error('No zone in USDA response');

  return {
    zone,
    tMin: -99,
    tMax: 99,
  };
}

async function fetchByCoords(lat: number, lng: number): Promise<HardinessZone> {
  const res = await fetch(`https://phzmapi.org/${lat}/${lng}.json`);
  if (!res.ok) throw new Error(`phzmapi error: ${res.status}`);

  const data = await res.json() as {
    zone: string;
    temperature_range: string;
  };

  const rangeParts = (data.temperature_range ?? '').split(' to ').map((s: string) => parseFloat(s));

  return {
    zone: data.zone ?? 'Unknown',
    tMin: rangeParts[0] ?? -99,
    tMax: rangeParts[1] ?? 99,
  };
}
