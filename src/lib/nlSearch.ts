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

  // Units range: "20-40", "20 to 40", "20 à 50", "environ 30"
  const rangeMatch = q.match(new RegExp(`${numberWord}\\s*(?:-|–|to|à)\\s*${numberWord}\\s*(?:units|appartements?|apartments?|logements?)`));
  const singleMatch = q.match(new RegExp(`(?:environ|about|~)?\\s*${numberWord}\\s*(?:units|appartements?|apartments?|logements?)`));
  if (rangeMatch) {
    criteria.unitsMin = parseInt(rangeMatch[1].replace(/[.,]/g, ""), 10);
    criteria.unitsMax = parseInt(rangeMatch[2].replace(/[.,]/g, ""), 10);
    chips.push({ key: "units", label: `${criteria.unitsMin}–${criteria.unitsMax} units` });
  } else if (singleMatch) {
    const n = parseInt(singleMatch[1].replace(/[.,]/g, ""), 10);
    criteria.unitsMin = Math.round(n * 0.75);
    criteria.unitsMax = Math.round(n * 1.25);
    chips.push({ key: "units", label: `~${n} units` });
  }

  // Minimum surface: "2 000 m²", "2,000 m2", "1500 m²", "> 2000 m²"
  const areaMatch = q.match(new RegExp(`${numberWord}\\s*m[²2]`));
  if (areaMatch) {
    criteria.minSiteArea = parseInt(areaMatch[1].replace(/[.,\s]/g, ""), 10);
    chips.push({ key: "area", label: `≥ ${criteria.minSiteArea.toLocaleString("en-US")} m²` });
  }

  // Commune / area mention. "Brussels" doubles as the whole metro area, so a
  // radius-style phrase ("around/near Brussels", "within 15km") should widen
  // the search rather than restrict it to the Brussels commune alone.
  const isRegionalPhrase = /around|near|autour|pr[eè]s|rayon|minutes?|\bkm\b|kilom[eè]tre/.test(q);
  const matchedCommune = communes.find(
    (c) => q.includes(c.name.toLowerCase()) && !(c.id === "brussels-centre" && isRegionalPhrase)
  );
  if (matchedCommune) {
    criteria.communeId = matchedCommune.id;
    chips.push({ key: "commune", label: matchedCommune.name });
  } else if (/brussels|bruxelles|brussel/.test(q)) {
    chips.push({ key: "region", label: "Brussels + periphery" });
  }

  // Flood risk exclusion
  if (/(sans|no|low).{0,20}(inondation|flood)/.test(q) || /flood.?risk/.test(q)) {
    criteria.excludeHighFloodRisk = true;
    chips.push({ key: "flood", label: "Low flood risk" });
  }

  // Underused
  if (/sous.?exploit|sous.?utilis|underused|under.?utili[sz]ed/.test(q)) {
    criteria.underusedOnly = true;
    chips.push({ key: "underused", label: "Underused sites" });
  }

  // Residential is implicit for this MVP persona — surface it as a chip for legibility.
  chips.unshift({ key: "type", label: "Residential" });

  return { criteria, chips };
}

export const exampleQueries = [
  "20–40 apartments around Brussels",
  "Underused sites above 2,000 m²",
  "Best residential opportunities in Uccle",
  "~30 apartments, low flood risk, near Brussels",
];
