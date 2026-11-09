// Display helper for a recommendation's reason line.
//
// The rule-based fallback (api/src/stylist/fallback.ts) writes "<Garment name>: <why>",
// which repeats the title the card already shows. For display only, drop that exact
// prefix; stored and saved looks keep the full server text.
export function reasonWithoutName(reason: string, garmentName: string): string {
  const prefix = `${garmentName}:`;
  if (!reason.toLowerCase().startsWith(prefix.toLowerCase())) return reason;
  const rest = reason.slice(prefix.length).trim();
  return rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : reason;
}
