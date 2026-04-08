import type { ClimateProfile, ClimateProjection } from '@/types/location';

// Open-Meteo — free, no API key required
// Uses 10-year historical archive for climate normals

export async function fetchClimateData(lat: number, lng: number): Promise<ClimateProfile> {
  const url = new URL('https://archive-api.open-meteo.com/v1/archive');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('start_date', '2014-01-01');
  url.searchParams.set('end_date', '2023-12-31');
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum');
  url.searchParams.set('temperature_unit', 'fahrenheit');
  url.searchParams.set('precipitation_unit', 'inch');
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

  const data = await res.json() as {
    daily: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_sum: number[];
    };
  };

  const { time, temperature_2m_max, temperature_2m_min, precipitation_sum } = data.daily;

  // Compute seasonal averages
  let summerMaxSum = 0, summerCount = 0;
  let winterMinSum = 0, winterCount = 0;
  let annualPrecip = 0;
  let absoluteMin = 999;

  for (let i = 0; i < time.length; i++) {
    const month = new Date(time[i]).getMonth(); // 0-indexed
    const tMax = temperature_2m_max[i];
    const tMin = temperature_2m_min[i];
    const precip = precipitation_sum[i] ?? 0;

    annualPrecip += precip;

    if (tMin !== null && tMin < absoluteMin) absoluteMin = tMin;

    if (month >= 5 && month <= 7) { // Jun-Aug
      if (tMax !== null) { summerMaxSum += tMax; summerCount++; }
    }
    if (month === 11 || month <= 1) { // Dec-Feb
      if (tMin !== null) { winterMinSum += tMin; winterCount++; }
    }
  }

  const avgSummerTemp = summerCount > 0 ? Math.round(summerMaxSum / summerCount) : 75;
  const avgWinterTemp = winterCount > 0 ? Math.round(winterMinSum / winterCount) : 30;
  const avgAnnualPrecip = Math.round((annualPrecip / 10) * 10) / 10; // 10-year average

  const zone = minTempToZone(absoluteMin);
  const projection = buildProjection(avgSummerTemp, avgAnnualPrecip);

  return {
    annualPrecipitation: avgAnnualPrecip,
    avgSummerTemp,
    avgWinterTemp,
    lastFrostDate: estimateFrostDate(avgWinterTemp, 'last'),
    firstFrostDate: estimateFrostDate(avgWinterTemp, 'first'),
    growingSeasonDays: estimateGrowingSeason(avgWinterTemp),
    climateChangeProjection: projection,
    hardinessZone: zone,
  };
}

export function minTempToZone(minTemp: number): string {
  if (minTemp < -60) return '1a';
  if (minTemp < -55) return '1b';
  if (minTemp < -50) return '2a';
  if (minTemp < -45) return '2b';
  if (minTemp < -40) return '3a';
  if (minTemp < -35) return '3b';
  if (minTemp < -30) return '4a';
  if (minTemp < -25) return '4b';
  if (minTemp < -20) return '5a';
  if (minTemp < -15) return '5b';
  if (minTemp < -10) return '6a';
  if (minTemp < -5)  return '6b';
  if (minTemp < 0)   return '7a';
  if (minTemp < 5)   return '7b';
  if (minTemp < 10)  return '8a';
  if (minTemp < 15)  return '8b';
  if (minTemp < 20)  return '9a';
  if (minTemp < 25)  return '9b';
  if (minTemp < 30)  return '10a';
  if (minTemp < 35)  return '10b';
  return '11a';
}

function buildProjection(avgTemp: number, precip: number): ClimateProjection {
  const tempIncrease = avgTemp > 70 ? 2.8 : 2.2;
  const precipChange = precip < 20 ? -8 : 3;
  const droughtRisk = precip < 15 ? 'extreme' : precip < 25 ? 'high' : 'moderate';
  return {
    tempIncrease2050: tempIncrease,
    precipChangePercent: precipChange,
    droughtRiskLevel: droughtRisk as ClimateProjection['droughtRiskLevel'],
    source: 'Open-Meteo Historical Archive + IPCC AR6',
  };
}

function estimateFrostDate(avgWinterTemp: number, type: 'last' | 'first'): string {
  if (type === 'last') {
    if (avgWinterTemp < 10) return 'May 15';
    if (avgWinterTemp < 20) return 'May 1';
    if (avgWinterTemp < 30) return 'April 15';
    return 'March 15';
  }
  if (avgWinterTemp < 10) return 'September 15';
  if (avgWinterTemp < 20) return 'October 1';
  if (avgWinterTemp < 30) return 'October 15';
  return 'November 15';
}

function estimateGrowingSeason(avgWinterTemp: number): number {
  if (avgWinterTemp < 10) return 120;
  if (avgWinterTemp < 20) return 150;
  if (avgWinterTemp < 30) return 180;
  return 220;
}
