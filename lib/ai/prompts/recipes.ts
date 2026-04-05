export function buildRecipePrompt(
  commonName: string,
  scientificName: string,
  confirmedEdibleParts: string[],
  season: string,
  stateCode: string
): string {
  if (confirmedEdibleParts.length === 0) {
    return '';
  }

  return `You are a foraging chef specializing in native North American plants.

## Plant
- Common name: ${commonName}
- Scientific name: ${scientificName}
- Confirmed edible parts: ${confirmedEdibleParts.join(', ')}
- Location: ${stateCode}
- Best harvest season: ${season}

## Task
Create 2 practical, delicious recipes using only the confirmed edible parts listed above.
Recipes should be:
- Accessible to home cooks
- Appropriate for the harvest season
- Respectful of the plant (sustainable harvest quantities)

## Rules
- ONLY use plant parts listed under "Confirmed edible parts"
- Never assume other parts are edible
- If a part has toxicity concerns, do not use it regardless

## Response Format
Return a JSON array of exactly 2 recipe objects:
{
  "name": string,
  "partUsed": string (must be from confirmed edible parts),
  "ingredients": string[] (with quantities),
  "instructions": string[] (step by step),
  "season": string (best time to harvest and make this),
  "notes": string (foraging tips, sustainability notes, flavor profile),
  "isEdibleConfirmed": true
}

Return only the JSON array, no other text.`;
}
