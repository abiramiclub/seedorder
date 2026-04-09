export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { fillCarts } from '@/lib/automation/cart-filler';
import { prisma } from '@/lib/utils/prisma';
import type { PlantRecommendation, GardenPlan } from '@/types/plants';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json() as {
    budget?: number;
    zipCode?: string;
    gardenPlanId?: string;
  };

  const { budget, zipCode, gardenPlanId } = body;

  if (!budget || !zipCode || !gardenPlanId) {
    return NextResponse.json(
      { error: 'budget, zipCode, and gardenPlanId are required' },
      { status: 400 }
    );
  }

  if (budget <= 0) {
    return NextResponse.json({ error: 'Budget must be greater than 0' }, { status: 400 });
  }

  // Load plants from the saved garden plan
  const gardenPlan = await prisma.gardenPlan.findUnique({ where: { id: gardenPlanId } });
  if (!gardenPlan) {
    return NextResponse.json({ error: 'Garden plan not found' }, { status: 404 });
  }

  const plan = JSON.parse(gardenPlan.planJson) as GardenPlan;
  const confirmedPlants: PlantRecommendation[] = [
    ...(plan.vegetables ?? []),
    ...(plan.herbs ?? []),
    ...(plan.flowers ?? []),
    ...(plan.bushesAndTrees ?? []),
  ];

  if (!confirmedPlants.length) {
    return NextResponse.json({ error: 'No plants found in this garden plan' }, { status: 400 });
  }

  const order = await fillCarts(confirmedPlants, budget, zipCode, gardenPlanId);

  await prisma.seedOrder.create({
    data: {
      gardenPlanId,
      zipCode,
      budget,
      orderJson: JSON.stringify(order),
    },
  });

  return NextResponse.json(order);
}
