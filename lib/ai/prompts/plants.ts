import type { LocationReport } from '@/types/location';
import type { PlantCategory } from '@/types/plants';

export function buildPlantRecommendationPrompt(
  report: LocationReport,
  category: PlantCategory,
  candidatePlants: Array<{ commonName: string; scientificName: string; usdaSymbol: string }>
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
- Climate projection (2050): +${climate.climateChangeProjection.tempIncrease2050}°F,
  precipitation ${climate.climateChangeProjection.precipChangePercent > 0 ? '+' : ''}${climate.climateChangeProjection.precipChangePercent}%,
  drought risk: ${climate.climateChangeProjection.droughtRiskLevel}

## Task
From the USDA-verified native plant candidates below, select the BEST 5 plants
for the category: **${category}**.

${category === 'flowers' ? `
IMPORTANT: All flower selections must be:
- Pollinator-friendly (high or exceptional value)
- Specifically excellent for honey bees
- Include at least one plant that blooms in each season (spring, summer, fall)
` : ''}

## Candidate Plants (USDA verified native to this region)
${candidatePlants.map((p, i) => `${i + 1}. ${p.commonName} (${p.scientificName}) — USDA: ${p.usdaSymbol}`).join('\n')}

## Rules
- Only recommend plants from the candidate list above
- Every plant must be native to this region and suitable for zone ${hardinessZone.zone}
- Factor in the soil pH (${soil.pH}), drainage (${soil.drainageClass}), and climate change trajectory
- Never recommend a plant with toxic parts without flagging hasToxicParts: true

## Response Format
Return a JSON array of exactly 5 objects. Each object:
{
  "usdaSymbol": string,
  "commonName": string,
  "scientificName": string,
  "category": "${category}",
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

Return only the JSON array, no other text.`;
}
