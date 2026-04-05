import type { PlantRecommendation } from '@/types/plants';

export function buildGardenDesignPrompt(
  allPlants: PlantRecommendation[],
  zone: string
): string {
  const plantList = allPlants
    .map((p) => `- ${p.commonName} (${p.category}, ${p.plantingInstructions.matureHeight}, ${p.plantingInstructions.sunRequirement})`)
    .join('\n');

  return `You are a native plant garden designer.

## Selected Plants
${plantList}

## Task
Create 3 visually compelling garden design combinations using subsets of these plants.
Each combination should:
- Create visual harmony (height layering, bloom succession, color coordination)
- Maximize ecological benefit (pollinator habitat, food web support)
- Be practical for a home garden in zone ${zone}
- Group plants with compatible sun, water, and soil needs

## Response Format
Return a JSON array of exactly 3 objects:
{
  "title": string (evocative name for this combination),
  "plants": string[] (commonNames of the plants in this combo, 3-5 plants),
  "designRationale": string (why these plants work together visually),
  "visualDescription": string (what this combination looks like across seasons),
  "companionBenefits": string (ecological and companion planting benefits)
}

Return only the JSON array, no other text.`;
}
