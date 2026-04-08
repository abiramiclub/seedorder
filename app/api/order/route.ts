export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { fillCarts } from '@/lib/automation/cart-filler';
import { prisma } from '@/lib/utils/prisma';
import type { PlantRecommendation } from '@/types/plants';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json() as {
    confirmedPlants?: PlantRecommendation[];
    budget?: number;
    zipCode?: string;
    gardenPlanId?: string;
  };

  const { confirmedPlants, budget, zipCode, gardenPlanId } = body;

  if (!confirmedPlants?.length || !budget || !zipCode || !gardenPlanId) {
    return NextResponse.json(
      { error: 'confirmedPlants, budget, zipCode, and gardenPlanId are required' },
      { status: 400 }
    );
  }

  if (budget <= 0) {
    return NextResponse.json({ error: 'Budget must be greater than 0' }, { status: 400 });
  }

  const order = await fillCarts(confirmedPlants, budget, zipCode, gardenPlanId);

  // Persist the order
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
