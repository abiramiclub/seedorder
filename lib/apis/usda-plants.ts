import type { Plant, PlantCategory } from '@/types/plants';

const BASE_URL = 'https://plantsservices.sc.egov.usda.gov/api';

export async function fetchNativePlants(
  stateCode: string,
  category: PlantCategory
): Promise<Plant[]> {
  const growthHabits = categoryToGrowthHabits(category);

  const results: Plant[] = [];

  for (const habit of growthHabits) {
    const res = await fetch(
      `${BASE_URL}/PlantProfile?symbol=&State=${stateCode}&Growth_Habit=${habit}&Native_Status=L48%28N%29&Toxicity=None&json=true`
    );
    if (!res.ok) continue;

    const data = await res.json() as Array<{
      Symbol: string;
      Common_Name: string;
      Scientific_Name: string;
      Family: string;
      Duration: string;
    }>;

    const plants = data.slice(0, 20).map((item) => ({
      id: item.Symbol,
      commonName: item.Common_Name ?? 'Unknown',
      scientificName: item.Scientific_Name ?? '',
      category,
      usdaSymbol: item.Symbol,
      nativeRegions: [stateCode],
      hardinessZones: [],
      description: '',
      ecologicalRole: '',
      pollinatorValue: 'moderate' as Plant['pollinatorValue'],
      honeyBeeValue: 'moderate' as Plant['honeyBeeValue'],
      hasToxicParts: false,
    }));

    results.push(...plants);
  }

  return results;
}

function categoryToGrowthHabits(category: PlantCategory): string[] {
  switch (category) {
    case 'vegetables':
      return ['Forb%2FHerb'];
    case 'herbs':
      return ['Forb%2FHerb'];
    case 'flowers':
      return ['Forb%2FHerb', 'Graminoid'];
    case 'bushes-and-trees':
      return ['Shrub', 'Tree'];
  }
}
