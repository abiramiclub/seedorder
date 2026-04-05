export function buildMedicinalPrompt(
  commonName: string,
  scientificName: string
): string {
  return `You are an ethnobotanist with expertise in North American native plants.

## Plant
- Common name: ${commonName}
- Scientific name: ${scientificName}

## Task
Provide verified medicinal and traditional uses of this plant as documented in
ethnobotanical literature. Only include uses that are well-documented in traditional
indigenous or historical herbalism contexts.

## Response Format
Return a JSON array of medicinal use objects (0-4 items, only if genuinely documented):
{
  "partUsed": string (e.g. "leaves", "roots", "bark", "seeds"),
  "traditionalUse": string (the documented use),
  "preparationMethod": string (how it was traditionally prepared),
  "disclaimer": "This is for informational purposes only. Consult a healthcare professional before using any plant medicinally.",
  "source": string (e.g. "USDA Ethnobotany Database", "Moerman's Native American Ethnobotany")
}

If no well-documented medicinal uses exist, return an empty array [].
Return only the JSON array, no other text.`;
}
