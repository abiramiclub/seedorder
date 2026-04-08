import { notFound } from 'next/navigation';
import Link from 'next/link';
import { geocodeZip } from '@/lib/apis/census';
import { fetchHardinessZone } from '@/lib/apis/hardiness';
import { fetchSoilData } from '@/lib/apis/usda-soil';
import { fetchClimateData } from '@/lib/apis/noaa';
import type { LocationReport } from '@/types/location';

interface ReportPageProps {
  params: Promise<{ zipCode: string }>;
}

export default async function ReportPage({ params }: ReportPageProps): Promise<React.JSX.Element> {
  const { zipCode } = await params;
  if (!/^\d{5}$/.test(zipCode)) notFound();

  let report: LocationReport;
  try {
    const location = await geocodeZip(zipCode);
    const [hardinessZone, soil, climate] = await Promise.all([
      fetchHardinessZone(location.lat, location.lng),
      fetchSoilData(location.lat, location.lng),
      fetchClimateData(location.lat, location.lng),
    ]);
    report = { location, hardinessZone, soil, climate };
  } catch (err) {
    console.error('Failed to load location data:', err);
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-10 max-w-2xl mx-auto">
        <p className="text-red-600">Could not load data for zip code {zipCode}. Please try again.</p>
        <Link href="/" className="text-green-700 underline mt-4 block">Go back</Link>
      </main>
    );
  }

  const { location, hardinessZone, soil, climate } = report;

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 max-w-2xl mx-auto space-y-8">
      <div>
        <p className="text-green-700 font-medium text-sm uppercase tracking-widest">Your Location</p>
        <h1 className="text-3xl font-bold text-stone-900 mt-1">
          {location.city}, {location.stateCode} {location.zipCode}
        </h1>
        <p className="text-stone-500 mt-1">USDA Hardiness Zone {hardinessZone.zone}</p>
      </div>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
        <h2 className="font-semibold text-stone-800 text-lg">Soil</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <DataPoint label="Type" value={soil.mapUnitName} />
          <DataPoint label="Texture" value={soil.texture} />
          <DataPoint label="pH" value={String(soil.pH)} />
          <DataPoint label="Organic Matter" value={`${soil.organicMatter}%`} />
          <DataPoint label="Drainage" value={soil.drainageClass} />
        </dl>
      </section>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
        <h2 className="font-semibold text-stone-800 text-lg">Climate</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <DataPoint label="Annual Rain" value={`${climate.annualPrecipitation}"`} />
          <DataPoint label="Summer Avg" value={`${climate.avgSummerTemp}°F`} />
          <DataPoint label="Winter Avg" value={`${climate.avgWinterTemp}°F`} />
          <DataPoint label="Growing Season" value={`${climate.growingSeasonDays} days`} />
          <DataPoint label="Last Frost" value={climate.lastFrostDate} />
          <DataPoint label="First Frost" value={climate.firstFrostDate} />
        </dl>
      </section>

      <section className="bg-amber-50 rounded-2xl border border-amber-200 p-6 space-y-2">
        <h2 className="font-semibold text-amber-900 text-lg">Climate Outlook 2050</h2>
        <p className="text-amber-800 text-sm">
          Projected +{climate.climateChangeProjection.tempIncrease2050}°F warming &middot;{' '}
          {climate.climateChangeProjection.precipChangePercent > 0 ? '+' : ''}
          {climate.climateChangeProjection.precipChangePercent}% precipitation &middot;{' '}
          Drought risk:{' '}
          <span className="font-medium capitalize">
            {climate.climateChangeProjection.droughtRiskLevel}
          </span>
        </p>
        <p className="text-amber-700 text-xs">Source: {climate.climateChangeProjection.source}</p>
      </section>

      <Link
        href={`/garden/${zipCode}/plan`}
        className="block w-full text-center py-4 rounded-2xl bg-green-700 hover:bg-green-600 text-white font-semibold text-lg transition-colors"
      >
        Generate My Plant Plan
      </Link>
    </main>
  );
}

interface DataPointProps {
  label: string;
  value: string;
}

function DataPoint({ label, value }: DataPointProps): React.JSX.Element {
  return (
    <div>
      <dt className="text-stone-400 text-xs uppercase tracking-wide">{label}</dt>
      <dd className="text-stone-800 font-medium mt-0.5">{value}</dd>
    </div>
  );
}
