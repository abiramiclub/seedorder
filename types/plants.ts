export type PlantCategory = 'vegetables' | 'herbs' | 'flowers' | 'bushes-and-trees';

export interface Plant {
  id: string;
  commonName: string;
  scientificName: string;
  category: PlantCategory;
  usdaSymbol: string;       // USDA PLANTS database symbol
  nativeRegions: string[];
  hardinessZones: string[]; // e.g. ["5a", "5b", "6a", "6b", "7a", "7b"]
  description: string;
  ecologicalRole: string;
  pollinatorValue: 'low' | 'moderate' | 'high' | 'exceptional';
  honeyBeeValue: 'low' | 'moderate' | 'high' | 'exceptional';
  hasToxicParts: boolean;
  toxicityWarning?: string;
}

export interface PlantRecommendation extends Plant {
  whyRecommended: string;     // location-specific reasoning
  plantingInstructions: PlantingInstructions;
}

export interface PlantingInstructions {
  whenToPlant: string;
  spacing: string;
  depth: string;
  sunRequirement: 'full-sun' | 'partial-shade' | 'full-shade';
  waterNeeds: 'low' | 'moderate' | 'high';
  soilPreference: string;
  daysToGermination: string;
  matureHeight: string;
  careNotes: string;
}

export interface GardenPlan {
  id: string;
  zipCode: string;
  createdAt: string;
  vegetables: PlantRecommendation[];
  herbs: PlantRecommendation[];
  flowers: PlantRecommendation[];
  bushesAndTrees: PlantRecommendation[];
  designCombinations: GardenDesignCombination[];
}

export interface GardenDesignCombination {
  title: string;
  plants: string[];           // plant IDs
  designRationale: string;
  visualDescription: string;
  companionBenefits: string;
}

export const MAX_PLANT_RECOMMENDATIONS = 5; // per category
