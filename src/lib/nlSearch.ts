import { communes } from "../data/communes";

export interface Criteria {
  unitsMin?: number;
  unitsMax?: number;
  minSiteArea?: number;
  communeId?: string;
  excludeHighFloodRisk?: boolean;
  underusedOnly?: boolean;
}

export interface Chip {
  key: string;
  label: string;
}

const numberWord = "(\\d[\\d.,]*)";

export function parseQuery(raw: string): { criteria: Criteria; chips: Chip[] } {
  const q = raw.toLowerCase().trim();
  const criteria: Criteria = {};
  const chips: Chip[] = [];

  if (!q) return { criteria, chips };

  // Units range: "20-40", "20 à 50", "environ 30"
  const rangeMatch = q.match(new RegExp(`${numberWord}\\s*(?:-|–|à)\\s*${numberWord}\\s*(?:unit[ées]?s?|appartements?|logements?)`));
  const singleMatch = q.match(new RegExp(`(?:environ|~)?\\s*${numberWord}\\s*(?:unit[ées]?s?|appartements?|logements?)`));
  if (rangeMatch) {
    criteria.unitsMin = parseInt(rangeMatch[1].replace(/[.,]/g, ""), 10);
    criteria.unitsMax = parseInt(rangeMatch[2].replace(/[.,]/g, ""), 10);
    chips.push({ key: "units", label: `${criteria.unitsMin}–${criteria.unitsMax} unités` });
  } else if (singleMatch) {
    const n = parseInt(singleMatch[1].replace(/[.,]/g, ""), 10);
    criteria.unitsMin = Math.round(n * 0.75);
    criteria.unitsMax = Math.round(n * 1.25);
    chips.push({ key: "units", label: `~${n} unités` });
  }

  // Minimum surface: "2 000 m²", "2000 m2", "1500 m²", "plus de 2000 m²"
  const areaMatch = q.match(new RegExp(`${numberWord}\\s*m[²2]`));
  if (areaMatch) {
    criteria.minSiteArea = parseInt(areaMatch[1].replace(/[.,\s]/g, ""), 10);
    chips.push({ key: "area", label: `≥ ${criteria.minSiteArea.toLocaleString("fr-BE")} m²` });
  }

  // Commune / area mention. "Bruxelles" doubles as the whole metro area, so a
  // radius-style phrase ("autour de/près de Bruxelles", "dans un rayon de 15km")
  // should widen the search rather than restrict it to the Brussels commune alone.
  const isRegionalPhrase = /autour|pr[eè]s|rayon|minutes?|\bkm\b|kilom[eè]tre/.test(q);
  const matchedCommune = communes.find(
    (c) => q.includes(c.name.toLowerCase()) && !(c.id === "brussels-centre" && isRegionalPhrase)
  );
  if (matchedCommune) {
    criteria.communeId = matchedCommune.id;
    chips.push({ key: "commune", label: matchedCommune.name });
  } else if (/bruxelles|brussel/.test(q)) {
    chips.push({ key: "region", label: "Bruxelles + périphérie" });
  }

  // Flood risk exclusion
  if (/(sans|faible|pas de).{0,20}(risque.{0,10})?inondation/.test(q)) {
    criteria.excludeHighFloodRisk = true;
    chips.push({ key: "flood", label: "Faible risque d'inondation" });
  }

  // Underused
  if (/sous.?exploit|sous.?utilis/.test(q)) {
    criteria.underusedOnly = true;
    chips.push({ key: "underused", label: "Sites sous-exploités" });
  }

  // Residential is implicit for this MVP persona — surface it as a chip for legibility.
  chips.unshift({ key: "type", label: "Résidentiel" });

  return { criteria, chips };
}

export const exampleQueries = [
  "20 à 40 appartements autour de Bruxelles",
  "Sites sous-exploités de plus de 2 000 m²",
  "Meilleures opportunités résidentielles à Uccle",
  "~30 appartements, faible risque d'inondation, près de Bruxelles",
];
