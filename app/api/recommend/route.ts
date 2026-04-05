import { NextRequest, NextResponse } from 'next/server';
import { generateGardenPlan } from '@/lib/ai/recommend';
import { prisma } from '@/lib/utils/prisma';
import type { LocationReport } from '@/types/location';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json() as { report?: LocationReport };
  const { report } = body;

  if (!report?.location?.zipCode) {
    return NextResponse.json({ error: 'LocationReport is required' }, { status: 400 });
  }

  const plan = await generateGardenPlan(report);

  const saved = await prisma.gardenPlan.create({
    data: {
      zipCode: report.location.zipCode,
      planJson: JSON.stringify(plan),
    },
  });

  return NextResponse.json({ ...plan, id: saved.id });
}
