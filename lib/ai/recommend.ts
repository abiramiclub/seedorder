import Anthropic from '@anthropic-ai/sdk';
import type { LocationReport } from '@/types/location';
import type { PlantCategory, PlantRecommendation, GardenPlan, GardenDesignCombination } from '@/types/plants';
import { buildPlantRecommendationPrompt } from '@/lib/ai/prompts/plants';
import { buildGardenDesignPrompt } from '@/lib/ai/prompts/garden-design';

const client = new Anthropic();
const MODEL = 'claude-sonnet-4-6';

function stripJsonFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
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
  const prompt = buildPlantRecommendationPrompt(report, category);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8096,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';
  return JSON.parse(stripJsonFences(raw)) as PlantRecommendation[];
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
  return JSON.parse(stripJsonFences(raw)) as GardenDesignCombination[];
}
