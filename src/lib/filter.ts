import type { Opportunity } from "../types";
import type { Criteria } from "./nlSearch";

export function applyCriteria(opportunities: Opportunity[], criteria: Criteria): Opportunity[] {
  return opportunities.filter((o) => {
    if (criteria.unitsMin != null && o.units[1] < criteria.unitsMin) return false;
    if (criteria.unitsMax != null && o.units[0] > criteria.unitsMax) return false;
    if (criteria.minSiteArea != null && o.siteAreaM2 < criteria.minSiteArea) return false;
    if (criteria.communeId != null && o.communeId !== criteria.communeId) return false;
    if (criteria.excludeHighFloodRisk && o.floodRisk === "high") return false;
    if (criteria.underusedOnly && o.currentUseRatioPct > 30) return false;
    return true;
  });
}
