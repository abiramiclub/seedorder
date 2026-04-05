import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { PlantProfile } from '@/types/plant-profile';

interface PlantProfilePageProps {
  params: Promise<{ zipCode: string; plantId: string }>;
  searchParams: Promise<{ commonName?: string; scientificName?: string; stateCode?: string }>;
}

async function fetchProfile(
  plantId: string,
  commonName: string,
  scientificName: string,
  stateCode: string
): Promise<PlantProfile> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const params = new URLSearchParams({ commonName, scientificName, stateCode });
  const res = await fetch(`${baseUrl}/api/plant/${plantId}?${params}`, { cache: 'force-cache' });
  if (!res.ok) notFound();
  return res.json() as Promise<PlantProfile>;
}

export default async function PlantProfilePage({
  params,
  searchParams,
}: PlantProfilePageProps): Promise<React.JSX.Element> {
  const { zipCode, plantId } = await params;
  const { commonName = '', scientificName = '', stateCode = '' } = await searchParams;

  const profile = await fetchProfile(plantId, commonName, scientificName, stateCode);
  const { conservationStatus: cs } = profile;

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 max-w-2xl mx-auto space-y-8">
      <Link href={`/garden/${zipCode}/plan`} className="text-green-700 text-sm hover:underline">
        &larr; Back to plan
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-stone-900">{commonName}</h1>
        <p className="text-stone-400 italic mt-1">{scientificName}</p>
      </div>

      {/* Photos */}
      {profile.photos.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {profile.photos.slice(0, 4).map((photo, i) => (
            <div key={i} className="flex-shrink-0">
              <Image
                src={photo.thumbnailUrl}
                alt={`${commonName} photo ${i + 1}`}
                width={200}
                height={150}
                className="rounded-xl object-cover"
              />
              <p className="text-stone-400 text-xs mt-1 max-w-[200px] truncate">{photo.attribution}</p>
            </div>
          ))}
        </div>
      )}

      {/* What makes it unique */}
      <section className="bg-white rounded-2xl border border-stone-200 p-5">
        <h2 className="font-semibold text-stone-800 mb-2">What Makes It Special</h2>
        <p className="text-stone-600 text-sm leading-relaxed">{profile.whatMakesItUnique}</p>
      </section>

      {/* Conservation status */}
      <section className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
        <h2 className="font-semibold text-stone-800">Conservation Status</h2>
        <div className="flex gap-3 flex-wrap">
          <StatusBadge label={`NatureServe: ${cs.natureServeRank}`} sublabel={cs.natureServeLabel} />
          <StatusBadge label={`IUCN: ${cs.iucnCategory}`} sublabel={cs.iucnLabel} />
        </div>
        {cs.threats.length > 0 && (
          <div>
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-1">Known Threats</p>
            <ul className="text-stone-600 text-sm space-y-0.5">
              {cs.threats.map((t, i) => <li key={i}>&bull; {t}</li>)}
            </ul>
          </div>
        )}
        <p className="text-stone-400 text-xs">Source: {cs.source}</p>
      </section>

      {/* Edible uses */}
      {profile.edibleUses.length > 0 && (
        <section className="bg-white rounded-2xl border border-stone-200 p-5 space-y-2">
          <h2 className="font-semibold text-stone-800">Edible Uses</h2>
          <ul className="text-stone-600 text-sm space-y-1">
            {profile.edibleUses.map((use, i) => <li key={i}>&bull; {use}</li>)}
          </ul>
        </section>
      )}

      {/* Medicinal uses */}
      {profile.medicinalUses.length > 0 && (
        <section className="bg-amber-50 rounded-2xl border border-amber-200 p-5 space-y-4">
          <h2 className="font-semibold text-amber-900">Medicinal Uses</h2>
          {profile.medicinalUses.map((use, i) => (
            <div key={i} className="space-y-1">
              <p className="text-amber-800 font-medium text-sm">{use.partUsed} — {use.traditionalUse}</p>
              <p className="text-amber-700 text-sm">{use.preparationMethod}</p>
              <p className="text-amber-600 text-xs italic">{use.disclaimer}</p>
            </div>
          ))}
        </section>
      )}

      {/* Recipes */}
      {profile.recipes.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-800">Recipes</h2>
          {profile.recipes.map((recipe, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
              <h3 className="font-semibold text-stone-900">{recipe.name}</h3>
              <p className="text-stone-500 text-sm">{recipe.season} &middot; Uses: {recipe.partUsed}</p>
              <div>
                <p className="text-stone-700 text-sm font-medium mb-1">Ingredients</p>
                <ul className="text-stone-600 text-sm space-y-0.5">
                  {recipe.ingredients.map((ing, j) => <li key={j}>&bull; {ing}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-stone-700 text-sm font-medium mb-1">Method</p>
                <ol className="text-stone-600 text-sm space-y-1 list-decimal list-inside">
                  {recipe.instructions.map((step, j) => <li key={j}>{step}</li>)}
                </ol>
              </div>
              {recipe.notes && <p className="text-stone-500 text-sm italic">{recipe.notes}</p>}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

interface StatusBadgeProps {
  label: string;
  sublabel: string;
}

function StatusBadge({ label, sublabel }: StatusBadgeProps): React.JSX.Element {
  return (
    <div className="px-3 py-2 rounded-xl bg-stone-100 border border-stone-200">
      <p className="text-stone-800 text-sm font-medium">{label}</p>
      <p className="text-stone-500 text-xs">{sublabel}</p>
    </div>
  );
}
