import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { GardenPlan, PlantRecommendation } from '@/types/plants';
import type { LocationReport } from '@/types/location';

interface PlanPageProps {
  params: Promise<{ zipCode: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  vegetables: 'Vegetables',
  herbs: 'Herbs',
  flowers: 'Flowers & Decorative Grass',
  bushesAndTrees: 'Bushes & Trees',
};

async function fetchPlan(zip: string): Promise<GardenPlan & { id: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  const reportRes = await fetch(`${baseUrl}/api/location?zip=${zip}`, { cache: 'force-cache' });
  if (!reportRes.ok) notFound();
  const report = await reportRes.json() as LocationReport;

  const planRes = await fetch(`${baseUrl}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report }),
    cache: 'no-store',
  });
  if (!planRes.ok) notFound();
  return planRes.json() as Promise<GardenPlan & { id: string }>;
}

export default async function PlanPage({ params }: PlanPageProps): Promise<React.JSX.Element> {
  const { zipCode } = await params;
  if (!/^\d{5}$/.test(zipCode)) notFound();

  const plan = await fetchPlan(zipCode);

  const sections = [
    { key: 'vegetables', plants: plan.vegetables },
    { key: 'herbs', plants: plan.herbs },
    { key: 'flowers', plants: plan.flowers },
    { key: 'bushesAndTrees', plants: plan.bushesAndTrees },
  ];

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 max-w-3xl mx-auto space-y-10">
      <div>
        <p className="text-green-700 font-medium text-sm uppercase tracking-widest">Your Garden Plan</p>
        <h1 className="text-3xl font-bold text-stone-900 mt-1">Native Plants for {zipCode}</h1>
        <p className="text-stone-500 mt-1">All plants verified native to your region via USDA PLANTS</p>
      </div>

      {sections.map(({ key, plants }) => (
        <section key={key} className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-800 border-b border-stone-200 pb-2">
            {CATEGORY_LABELS[key]}
          </h2>
          <div className="grid gap-4">
            {plants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} zipCode={zipCode} />
            ))}
          </div>
        </section>
      ))}

      {plan.designCombinations.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-800 border-b border-stone-200 pb-2">
            Garden Design Combinations
          </h2>
          {plan.designCombinations.map((combo, i) => (
            <div key={i} className="bg-green-50 rounded-2xl border border-green-200 p-5 space-y-2">
              <h3 className="font-semibold text-green-900">{combo.title}</h3>
              <p className="text-green-800 text-sm">{combo.visualDescription}</p>
              <p className="text-green-700 text-sm">{combo.companionBenefits}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {combo.plants.map((name) => (
                  <span key={name} className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <Link
        href={`/garden/${zipCode}/order?planId=${plan.id}`}
        className="block w-full text-center py-4 rounded-2xl bg-green-700 hover:bg-green-600 text-white font-semibold text-lg transition-colors"
      >
        Confirm Selection &amp; Order Seeds
      </Link>
    </main>
  );
}

interface PlantCardProps {
  plant: PlantRecommendation;
  zipCode: string;
}

function PlantCard({ plant, zipCode }: PlantCardProps): React.JSX.Element {
  return (
    <Link href={`/garden/${zipCode}/plan/${plant.id}?commonName=${encodeURIComponent(plant.commonName)}&scientificName=${encodeURIComponent(plant.scientificName)}`}>
      <div className="bg-white rounded-2xl border border-stone-200 p-5 hover:border-green-400 transition-colors cursor-pointer space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-stone-900">{plant.commonName}</h3>
            <p className="text-stone-400 text-sm italic">{plant.scientificName}</p>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            {plant.hasToxicParts && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                Toxic parts
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              plant.honeyBeeValue === 'exceptional' ? 'bg-amber-100 text-amber-800' :
              plant.honeyBeeValue === 'high' ? 'bg-yellow-100 text-yellow-800' :
              'bg-stone-100 text-stone-600'
            }`}>
              Bee: {plant.honeyBeeValue}
            </span>
          </div>
        </div>
        <p className="text-stone-600 text-sm">{plant.description}</p>
        <p className="text-green-700 text-sm">{plant.whyRecommended}</p>
      </div>
    </Link>
  );
}
