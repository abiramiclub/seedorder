import type { LocationReport } from '@/types/location';
import type { PlantCategory } from '@/types/plants';

const CATEGORY_DESCRIPTIONS: Record<PlantCategory, string> = {
  vegetables: 'edible native plants — wild greens, roots, berries, or seed crops traditionally eaten by indigenous peoples of this region',
  herbs: 'native aromatic or medicinal herbs — plants used traditionally for culinary flavoring, teas, or medicine',
  flowers: 'native flowering plants and decorative grasses — must be pollinator-friendly and excellent for honey bees',
  'bushes-and-trees': 'native shrubs and trees — woody plants that provide habitat, food for wildlife, and year-round structure',
};

export function buildPlantRecommendationPrompt(
  report: LocationReport,
  category: PlantCategory
): string {
  const { location, hardinessZone, soil, climate } = report;

  return `You are an expert native plant ecologist advising a US gardener.

## Location
- Zip code: ${location.zipCode}
- City/State: ${location.city}, ${location.stateCode}
- USDA Hardiness Zone: ${hardinessZone.zone} (min ${hardinessZone.tMin}°F, max ${hardinessZone.tMax}°F)

## Soil
- Type: ${soil.mapUnitName}
- Texture: ${soil.texture}
- pH: ${soil.pH}
- Organic matter: ${soil.organicMatter}%
- Drainage: ${soil.drainageClass}

## Climate
- Annual precipitation: ${climate.annualPrecipitation}"
- Avg summer temp: ${climate.avgSummerTemp}°F
- Avg winter temp: ${climate.avgWinterTemp}°F
- Growing season: ${climate.growingSeasonDays} days
- Last frost: ${climate.lastFrostDate} | First frost: ${climate.firstFrostDate}
- Climate projection (2050): +${climate.climateChangeProjection.tempIncrease2050}°F, precipitation ${climate.climateChangeProjection.precipChangePercent > 0 ? '+' : ''}${climate.climateChangeProjection.precipChangePercent}%, drought risk: ${climate.climateChangeProjection.droughtRiskLevel}

## Task
Recommend exactly 5 native plants for the category: **${category}**
Category definition: ${CATEGORY_DESCRIPTIONS[category]}

${category === 'flowers' ? `
IMPORTANT: All flower selections must be:
- Pollinator-friendly (high or exceptional value)
- Specifically excellent for honey bees
- Include at least one plant that blooms in each season (spring, summer, fall)
` : ''}

## Requirements
- Every plant MUST be genuinely native to ${location.stateCode} (verified in USDA PLANTS database)
- Every plant MUST be suitable for USDA hardiness zone ${hardinessZone.zone}
- Factor in the soil pH (${soil.pH}), drainage (${soil.drainageClass}), and climate change trajectory
- Never recommend a plant with toxic parts without flagging hasToxicParts: true
- Choose plants that are well-known, widely available as seeds, and practical for a home gardener
- Use the plant's USDA PLANTS symbol (e.g. "VIAM" for Viola americana)

## Response Format
Return a JSON array of exactly 5 objects. Each object:
{
  "usdaSymbol": string,
  "id": string (same as usdaSymbol, lowercase),
  "commonName": string,
  "scientificName": string,
  "category": "${category}",
  "nativeRegions": ["${location.stateCode}"],
  "hardinessZones": string[] (list of compatible zones, e.g. ["5a","5b","6a","6b"]),
  "description": string (2-3 sentences, vivid and educational),
  "ecologicalRole": string (what it does for the local ecosystem),
  "pollinatorValue": "low" | "moderate" | "high" | "exceptional",
  "honeyBeeValue": "low" | "moderate" | "high" | "exceptional",
  "hasToxicParts": boolean,
  "toxicityWarning": string | null,
  "whyRecommended": string (location-specific reasoning referencing zone, soil, or climate),
  "plantingInstructions": {
    "whenToPlant": string,
    "spacing": string,
    "depth": string,
    "sunRequirement": "full-sun" | "partial-shade" | "full-shade",
    "waterNeeds": "low" | "moderate" | "high",
    "soilPreference": string,
    "daysToGermination": string,
    "matureHeight": string,
    "careNotes": string
  }
}

Return ONLY the raw JSON array. No markdown, no code fences, no explanation — just the JSON.`;
}
