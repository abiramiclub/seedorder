export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const ZIP = '10516';
const LAT = 41.4215;
const LNG = -73.9582;

async function test(name: string, fn: () => Promise<unknown>): Promise<{ name: string; status: 'ok' | 'fail'; result?: unknown; error?: string }> {
  try {
    const result = await fn();
    return { name, status: 'ok', result };
  } catch (err) {
    return { name, status: 'fail', error: err instanceof Error ? err.message : String(err) };
  }
}

export async function GET(): Promise<NextResponse> {
  const results = await Promise.all([

    test('Nominatim geocoder', async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${ZIP}&country=US&format=json&limit=1`,
        { headers: { 'User-Agent': 'NativeSeed/1.0' } }
      );
      const data = await res.json();
      return data[0]?.display_name;
    }),

    test('USDA Hardiness Zone', async () => {
      const res = await fetch(`https://planthardiness.ars.usda.gov/api/index.cfm?zip=${ZIP}`);
      const text = await res.text();
      return text.slice(0, 200);
    }),

    test('phzmapi.org Hardiness', async () => {
      const res = await fetch(`https://phzmapi.org/${LAT}/${LNG}.json`);
      return await res.json();
    }),

    test('USDA Soil Survey', async () => {
      const res = await fetch('https://SDMDataAccess.nrcs.usda.gov/Tabular/SDMTabularService/post.rest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `SELECT mu.muname FROM mapunit mu INNER JOIN component c ON c.mukey = mu.mukey WHERE mu.mukey IN (SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('point(${LNG} ${LAT})')) ORDER BY c.comppct_r DESC`,
        }),
      });
      const data = await res.json();
      return data?.Table?.[0];
    }),

    test('NOAA API key set', async () => {
      if (!process.env.NOAA_API_KEY) throw new Error('NOAA_API_KEY is not set in environment');
      return `Key present: ${process.env.NOAA_API_KEY.slice(0, 4)}****`;
    }),

    test('NOAA station lookup', async () => {
      const key = process.env.NOAA_API_KEY;
      if (!key) throw new Error('NOAA_API_KEY missing');
      const res = await fetch(
        `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=${LAT - 0.5},${LNG - 0.5},${LAT + 0.5},${LNG + 0.5}&datasetid=NORMAL_ANN&limit=1`,
        { headers: { token: key } }
      );
      const data = await res.json();
      return data?.results?.[0]?.id ?? 'No station found';
    }),

    test('Anthropic API key set', async () => {
      if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set in environment');
      return `Key present: ${process.env.ANTHROPIC_API_KEY.slice(0, 7)}****`;
    }),

    test('USDA PLANTS API', async () => {
      const res = await fetch(
        `https://plantsservices.sc.egov.usda.gov/api/PlantProfile?symbol=&State=NY&Growth_Habit=Forb%2FHerb&Native_Status=L48%28N%29&json=true`
      );
      const data = await res.json();
      return `${Array.isArray(data) ? data.length : 0} plants returned`;
    }),

    test('DATABASE_URL set', async () => {
      if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set in environment');
      return 'Present';
    }),

  ]);

  const failed = results.filter(r => r.status === 'fail');
  const passed = results.filter(r => r.status === 'ok');

  return NextResponse.json({ passed: passed.length, failed: failed.length, results });
}
