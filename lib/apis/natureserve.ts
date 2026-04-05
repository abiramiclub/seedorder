import type { ConservationStatus, NatureServeRank } from '@/types/plant-profile';

const BASE_URL = 'https://explorer.natureserve.org/api/data/taxon';

export async function fetchConservationStatus(
  scientificName: string
): Promise<Pick<ConservationStatus, 'natureServeRank' | 'natureServeLabel' | 'threats'> | null> {
  const apiKey = process.env.NATURESERVE_API_KEY;
  if (!apiKey) throw new Error('NATURESERVE_API_KEY is not set');

  const res = await fetch(
    `${BASE_URL}?q=${encodeURIComponent(scientificName)}&fields=conservationStatus`,
    { headers: { 'Authorization': `Bearer ${apiKey}` } }
  );

  if (!res.ok) return null;

  const data = await res.json() as {
    results?: Array<{
      conservationStatus?: {
        roundedGRank?: string;
        gRankReviewDate?: string;
        threats?: Array<{ description: string }>;
      };
    }>;
  };

  const status = data?.results?.[0]?.conservationStatus;
  if (!status) return null;

  const rank = (status.roundedGRank ?? 'GNR') as NatureServeRank;

  return {
    natureServeRank: rank,
    natureServeLabel: rankToLabel(rank),
    threats: (status.threats ?? []).map((t) => t.description),
  };
}

function rankToLabel(rank: NatureServeRank): string {
  const labels: Record<NatureServeRank, string> = {
    G1: 'Critically Imperiled',
    G2: 'Imperiled',
    G3: 'Vulnerable',
    G4: 'Apparently Secure',
    G5: 'Secure',
    GX: 'Presumed Extinct',
    GH: 'Possibly Extinct',
    GNR: 'Not Ranked',
    GNA: 'Not Applicable',
  };
  return labels[rank] ?? 'Unknown';
}
