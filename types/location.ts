export interface ZipLocation {
  zipCode: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  stateCode: string;
}

export interface HardinessZone {
  zone: string;        // e.g. "7b"
  tMin: number;        // minimum temperature °F
  tMax: number;        // maximum temperature °F
}

export interface SoilProfile {
  mapUnitName: string;
  texture: string;
  pH: number;
  organicMatter: number;  // percentage
  drainageClass: string;
  components: SoilComponent[];
}

export interface SoilComponent {
  name: string;
  percentage: number;
  texture: string;
  pH: number;
}

export interface ClimateProfile {
  annualPrecipitation: number;   // inches
  avgSummerTemp: number;         // °F
  avgWinterTemp: number;         // °F
  lastFrostDate: string;         // e.g. "March 15"
  firstFrostDate: string;        // e.g. "November 10"
  growingSeasonDays: number;
  climateChangeProjection: ClimateProjection;
}

export interface ClimateProjection {
  tempIncrease2050: number;      // °F projected increase by 2050
  precipChangePercent: number;   // % change in annual precipitation
  droughtRiskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  source: string;
}

export interface LocationReport {
  location: ZipLocation;
  hardinessZone: HardinessZone;
  soil: SoilProfile;
  climate: ClimateProfile;
}
