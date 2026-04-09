import Anthropic from '@anthropic-ai/sdk';
import type { LocationReport } from '@/types/location';
import type { PlantCategory, PlantRecommendation, GardenPlan, GardenDesignCombination } from '@/types/plants';
import { fetchNativePlants } from '@/lib/apis/usda-plants';
import { buildPlantRecommendationPrompt } from '@/lib/ai/prompts/plants';
import { buildGardenDesignPrompt } from '@/lib/ai/prompts/garden-design';
import { MAX_PLANT_RECOMMENDATIONS } from '@/types/plants';

const client = new Anthropic();
const MODEL = 'claude-sonnet-4-6';

function extractJsonArray(raw: string): unknown[] {
  // Strip code fences first
  const stripped = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
  // If it starts with [, parse directly
  if (stripped.startsWith('[')) return JSON.parse(stripped) as unknown[];
  // Search for a JSON array anywhere in the text (handles prose + JSON responses)
  const match = stripped.match(/(\[[\s\S]*\])/);
  if (match) return JSON.parse(match[1]) as unknown[];
  // Claude returned pure prose with no JSON — return empty array
  return [];
}

const CATEGORIES: PlantCategory[] = ['vegetables', 'herbs', 'flowers', 'bushes-and-trees'];

export async function generateGardenPlan(report: LocationReport): Promise<Omit<GardenPlan, 'id' | 'createdAt'>> {
  const allRecommendations = await Promise.all(
    CATEGORIES.map((category) => getRecommendationsForCategory(report, category))
  );

  const [vegetables, herbs, flowers, bushesAndTrees] = allRecommendations;

  const allPlants = [...vegetables, ...herbs, ...flowers, ...bushesAndTrees];
  const designCombinations = await generateDesignCombinations(allPlants, report.hardinessZone.zone);

  return {
    zipCode: report.location.zipCode,
    vegetables,
    herbs,
    flowers,
    bushesAndTrees,
    designCombinations,
  };
}

async function getRecommendationsForCategory(
  report: LocationReport,
  category: PlantCategory
): Promise<PlantRecommendation[]> {
  const candidates = await fetchNativePlants(report.location.stateCode, category);
  const topCandidates = candidates.slice(0, MAX_PLANT_RECOMMENDATIONS * 4);

  if (topCandidates.length === 0) return [];

  const prompt = buildPlantRecommendationPrompt(report, category, topCandidates);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';
  return extractJsonArray(raw) as PlantRecommendation[];
}

async function generateDesignCombinations(
  plants: PlantRecommendation[],
  zone: string
): Promise<GardenDesignCombination[]> {
  const prompt = buildGardenDesignPrompt(plants, zone);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';
  return extractJsonArray(raw) as GardenDesignCombination[];
}
