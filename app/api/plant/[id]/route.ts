export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { fetchPlantPhotos } from '@/lib/apis/inaturalist';
import { fetchWikimediaPhotos } from '@/lib/apis/wikimedia';
import { fetchConservationStatus } from '@/lib/apis/natureserve';
import { fetchIUCNStatus } from '@/lib/apis/iucn';
import { fetchEdibleUses } from '@/lib/apis/trefle';
import { buildMedicinalPrompt } from '@/lib/ai/prompts/medicinal';
import { buildRecipePrompt } from '@/lib/ai/prompts/recipes';
import { prisma } from '@/lib/utils/prisma';
import type { PlantProfile, ConservationStatus } from '@/types/plant-profile';

const client = new Anthropic();
const MODEL = 'claude-sonnet-4-6';
const CACHE_TTL_DAYS = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const url = new URL(request.url);
  const commonName = url.searchParams.get('commonName') ?? '';
  const scientificName = url.searchParams.get('scientificName') ?? '';
  const stateCode = url.searchParams.get('stateCode') ?? '';

  // Check cache
  const cached = await prisma.plantProfileCache.findUnique({ where: { plantId: id } });
  if (cached && cached.expiresAt > new Date()) {
    return NextResponse.json(JSON.parse(cached.profileJson));
  }

  // Fetch all profile data in parallel
  const [photos, iNatPhotos, natureServeData, iucnData, edibleParts] = await Promise.all([
    fetchWikimediaPhotos(scientificName).catch(() => []),
    fetchPlantPhotos(scientificName).catch(() => []),
    fetchConservationStatus(scientificName).catch(() => null),
    fetchIUCNStatus(scientificName).catch(() => null),
    fetchEdibleUses(scientificName).catch(() => []),
  ]);

  // Prefer iNaturalist photos, fall back to Wikimedia
  const allPhotos = iNatPhotos.length > 0 ? iNatPhotos : photos;

  const conservationStatus: ConservationStatus = {
    natureServeRank: natureServeData?.natureServeRank ?? 'GNR',
    natureServeLabel: natureServeData?.natureServeLabel ?? 'Not Ranked',
    iucnCategory: iucnData?.category ?? 'NE',
    iucnLabel: iucnData?.label ?? 'Not Evaluated',
    isEndemicToRegion: false,
    populationTrend: 'unknown',
    threats: natureServeData?.threats ?? [],
    source: 'NatureServe',
    sourceUrl: `https://explorer.natureserve.org/Taxon/ELEMENT_GLOBAL/${scientificName}`,
  };

  // Call Claude for medicinal uses and recipes
  const [medicinalText, recipeText, uniqueText] = await Promise.all([
    callClaude(buildMedicinalPrompt(commonName, scientificName)),
    edibleParts.length > 0
      ? callClaude(buildRecipePrompt(commonName, scientificName, edibleParts, 'summer', stateCode))
      : Promise.resolve('[]'),
    callClaude(
      `In 2-3 vivid sentences, describe what makes ${commonName} (${scientificName}) ecologically unique and special. Focus on adaptations, relationships with wildlife, and what sets it apart from non-native alternatives. Return only the description text, no JSON.`
    ),
  ]);

  const profile: PlantProfile = {
    plantId: id,
    whatMakesItUnique: uniqueText,
    conservationStatus,
    photos: allPhotos,
    edibleUses: edibleParts,
    medicinalUses: JSON.parse(medicinalText),
    recipes: recipeText !== '[]' ? JSON.parse(recipeText) : [],
  };

  // Cache profile
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.plantProfileCache.upsert({
    where: { plantId: id },
    update: { profileJson: JSON.stringify(profile), fetchedAt: now, expiresAt },
    create: { plantId: id, profileJson: JSON.stringify(profile), fetchedAt: now, expiresAt },
  });

  return NextResponse.json(profile);
}

async function callClaude(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });
  const raw = message.content[0].type === 'text' ? message.content[0].text : '[]';
  return raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
}
