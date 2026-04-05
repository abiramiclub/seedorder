export interface ConservationStatus {
  natureServeRank: NatureServeRank;
  natureServeLabel: string;    // e.g. "Globally Vulnerable"
  iucnCategory: IUCNCategory;
  iucnLabel: string;
  isEndemicToRegion: boolean;
  populationTrend: 'increasing' | 'stable' | 'decreasing' | 'unknown';
  threats: string[];
  source: 'NatureServe' | 'IUCN';
  sourceUrl: string;
}

export type NatureServeRank =
  | 'G1'  // Critically imperiled
  | 'G2'  // Imperiled
  | 'G3'  // Vulnerable
  | 'G4'  // Apparently secure
  | 'G5'  // Secure
  | 'GX'  // Presumed extinct
  | 'GH'  // Possibly extinct
  | 'GNR' // Not ranked
  | 'GNA'; // Not applicable

export type IUCNCategory =
  | 'EX'  // Extinct
  | 'EW'  // Extinct in the Wild
  | 'CR'  // Critically Endangered
  | 'EN'  // Endangered
  | 'VU'  // Vulnerable
  | 'NT'  // Near Threatened
  | 'LC'  // Least Concern
  | 'DD'  // Data Deficient
  | 'NE'; // Not Evaluated

export interface PlantPhoto {
  url: string;
  thumbnailUrl: string;
  attribution: string;
  license: string;
  source: 'iNaturalist' | 'Wikimedia';
  observationDate?: string;
  location?: string;
}

export interface MedicinalUse {
  partUsed: string;           // e.g. "leaves", "roots", "bark"
  traditionalUse: string;
  preparationMethod: string;
  disclaimer: string;         // always include safety disclaimer
  source: string;
}

export interface Recipe {
  name: string;
  partUsed: string;           // confirmed edible part from Trefle/Claude
  ingredients: string[];
  instructions: string[];
  season: string;             // best season to harvest/prepare
  notes: string;
  isEdibleConfirmed: boolean; // must be true — never false
}

export interface PlantProfile {
  plantId: string;
  whatMakesItUnique: string;
  conservationStatus: ConservationStatus;
  photos: PlantPhoto[];
  edibleUses: string[];
  medicinalUses: MedicinalUse[];
  recipes: Recipe[];
}
