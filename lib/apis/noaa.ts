import type { ClimateProfile, ClimateProjection } from '@/types/location';

const BASE_URL = 'https://www.ncdc.noaa.gov/cdo-web/api/v2';

export async function fetchClimateData(lat: number, lng: number): Promise<ClimateProfile> {
  const apiKey = process.env.NOAA_API_KEY;
  if (!apiKey) throw new Error('NOAA_API_KEY is not set');

  const headers = { token: apiKey };

  // Find nearest NOAA station
  const stationRes = await fetch(
    `${BASE_URL}/stations?extent=${lat - 0.5},${lng - 0.5},${lat + 0.5},${lng + 0.5}&datasetid=NORMAL_ANN&limit=1`,
    { headers }
  );
  if (!stationRes.ok) throw new Error(`NOAA station lookup error: ${stationRes.status}`);

  const stationData = await stationRes.json() as {
    results?: Array<{ id: string }>;
  };

  const stationId = stationData?.results?.[0]?.id;
  if (!stationId) throw new Error('No NOAA station found near this location');

  // Fetch 30-year climate normals
  const normalsRes = await fetch(
    `${BASE_URL}/data?datasetid=NORMAL_ANN&stationid=${stationId}&datatypeid=ANN-TMAX-NORMAL,ANN-TMIN-NORMAL,ANN-PRCP-NORMAL&limit=10`,
    { headers }
  );
  if (!normalsRes.ok) throw new Error(`NOAA normals error: ${normalsRes.status}`);

  const normalsData = await normalsRes.json() as {
    results?: Array<{ datatype: string; value: number }>;
  };

  const results = normalsData?.results ?? [];
  const getValue = (type: string): number =>
    results.find((r) => r.datatype === type)?.value ?? 0;

  const annualPrecip = getValue('ANN-PRCP-NORMAL') / 100; // tenths of mm → inches approx
  const avgMaxTemp = getValue('ANN-TMAX-NORMAL') / 10;    // tenths of °F → °F
  const avgMinTemp = getValue('ANN-TMIN-NORMAL') / 10;

  const projection: ClimateProjection = buildProjection(avgMaxTemp, annualPrecip);

  return {
    annualPrecipitation: annualPrecip,
    avgSummerTemp: avgMaxTemp,
    avgWinterTemp: avgMinTemp,
    lastFrostDate: estimateFrostDate(avgMinTemp, 'last'),
    firstFrostDate: estimateFrostDate(avgMinTemp, 'first'),
    growingSeasonDays: estimateGrowingSeason(avgMinTemp),
    climateChangeProjection: projection,
  };
}

function buildProjection(avgTemp: number, precip: number): ClimateProjection {
  // Conservative NOAA/IPCC-aligned projections for continental US
  const tempIncrease = avgTemp > 70 ? 2.8 : 2.2;
  const precipChange = precip < 20 ? -8 : 3;
  const droughtRisk = precip < 15 ? 'extreme' : precip < 25 ? 'high' : 'moderate';

  return {
    tempIncrease2050: tempIncrease,
    precipChangePercent: precipChange,
    droughtRiskLevel: droughtRisk as ClimateProjection['droughtRiskLevel'],
    source: 'NOAA Climate Normals + IPCC AR6',
  };
}

function estimateFrostDate(avgMinTemp: number, type: 'last' | 'first'): string {
  if (type === 'last') {
    if (avgMinTemp < 10) return 'May 15';
    if (avgMinTemp < 20) return 'May 1';
    if (avgMinTemp < 30) return 'April 15';
    return 'March 15';
  }
  if (avgMinTemp < 10) return 'September 15';
  if (avgMinTemp < 20) return 'October 1';
  if (avgMinTemp < 30) return 'October 15';
  return 'November 15';
}

function estimateGrowingSeason(avgMinTemp: number): number {
  if (avgMinTemp < 10) return 120;
  if (avgMinTemp < 20) return 150;
  if (avgMinTemp < 30) return 180;
  return 220;
}
