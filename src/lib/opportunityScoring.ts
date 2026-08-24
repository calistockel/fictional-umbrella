import type { PermitStatus, RiskLevel } from "../types";

/**
 * Opportunity Score methodology
 * ==============================
 * This module is the single place where the Opportunity Score and its three
 * sub-scores (Development, Planning, Constraints) are computed. Nothing else
 * in the codebase invents a score — every number here is derived from
 * underlying site, zoning, commune, and comparable-permit data.
 *
 * The mock data feeding this engine today (see src/data/*.ts) is fictional,
 * but the shape of the inputs mirrors what a real pipeline would provide:
 * a parcel's site/built area, a feasibility-derived buildable envelope, its
 * zoning text, environmental/heritage flags, transit distance, the host
 * commune's historical planning statistics, and the outcomes of nearby
 * comparable permits. Swapping mock inputs for real ones does not require
 * touching this file — see docs/scoring-methodology.md for the full
 * rationale, worked examples, and known limitations.
 */

export interface ScoringCommuneInputs {
  approvalRate: number; // 0-100, historical share of permits approved
  approvalRateTrendPts: number; // change in approval rate over the last 24 months, in points
  medianDecisionDays: number; // median time to a decision
  incompleteFileRate: number; // 0-100, share of filings returned as incomplete
  developmentFriendliness: number; // 0-10 qualitative composite (precedent, political will) not captured by the hard stats above
}

export interface ScoringComparablePermit {
  status: PermitStatus;
  distanceM: number;
}

export interface ScoringInputs {
  siteAreaM2: number;
  builtAreaM2: number;
  buildableM2: [number, number]; // feasibility-estimated constructible range, independent of this engine
  zoning: string;
  floodRisk: RiskLevel;
  heritageConstraint: boolean;
  transitWalkMin: number;
  commune: ScoringCommuneInputs;
  comparablePermits: ScoringComparablePermit[];
}

export interface ScoringResult {
  development: number;
  planning: number;
  constraints: number;
  overall: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Zoning text carries a regulatory signal (an explicit density bonus, a
 * recent rezoning, transit-oriented language) that both the generator and
 * the scoring engine need to read the same way. Centralising the detection
 * here means a real integration only has to replace this function with a
 * lookup against structured zoning codes — every caller keeps working.
 */
export function classifyZoningTailwind(zoning: string): "strong" | "mild" | "none" {
  const z = zoning.toLowerCase();
  if (/bonus|rezon[ée]/.test(z)) return "strong";
  if (/mixte|transport|transit/.test(z)) return "mild";
  return "none";
}

// --- Development: how much of the site's capacity is left on the table ---
// Higher when the buildable envelope is large relative to the plot (uplift),
// when today's building leaves most of that envelope untouched (underuse),
// when the zoning text signals a regulatory tailwind, and when transit is
// close enough to support the density being proposed.
const DEV_UPLIFT_WEIGHT = 75; // an uplift ratio of 1.0 (buildable ~= full plot) maps to a base of 75/100, leaving room for the bonuses below
const DEV_UNDERUSE_MAX_BONUS = 15;
const DEV_ZONING_BONUS: Record<ReturnType<typeof classifyZoningTailwind>, number> = {
  strong: 10,
  mild: 4,
  none: 0,
};
const DEV_TRANSIT_MAX_BONUS = 10;
const DEV_TRANSIT_WALK_FLOOR_MIN = 12; // beyond this walk time, proximity to transit stops moving the needle

function computeDevelopmentScore(inputs: ScoringInputs): number {
  const buildableMid = (inputs.buildableM2[0] + inputs.buildableM2[1]) / 2;
  const upliftRatio = clamp((buildableMid - inputs.builtAreaM2) / inputs.siteAreaM2, 0, 1.2);
  const underuseRatio = clamp(1 - inputs.builtAreaM2 / inputs.siteAreaM2, 0, 1);

  const base = upliftRatio * DEV_UPLIFT_WEIGHT;
  const underuseBonus = underuseRatio * DEV_UNDERUSE_MAX_BONUS;
  const zoningBonus = DEV_ZONING_BONUS[classifyZoningTailwind(inputs.zoning)];
  const transitBonus =
    (clamp(DEV_TRANSIT_WALK_FLOOR_MIN - inputs.transitWalkMin, 0, DEV_TRANSIT_WALK_FLOOR_MIN) / DEV_TRANSIT_WALK_FLOOR_MIN) *
    DEV_TRANSIT_MAX_BONUS;

  return Math.round(clamp(base + underuseBonus + zoningBonus + transitBonus, 0, 100));
}

// --- Planning: how likely a permit is to clear review ---
// Blends the commune's hard historical stats with the actual outcomes of
// nearby comparable permits (closer ones count for more), a momentum
// adjustment for communes trending more or less permissive, a small
// qualitative allowance for signals the hard stats don't capture, and a
// penalty for administrative fragility (a high incomplete-file rate)
// that has nothing to do with the merits of the project itself.
const PLANNING_WEIGHT_COMMUNE_HISTORY = 0.45;
const PLANNING_WEIGHT_COMPARABLES = 0.45;
const PLANNING_WEIGHT_QUALITATIVE = 0.1;
const PLANNING_TREND_MULTIPLIER = 0.8;
const PLANNING_INCOMPLETE_FILE_PENALTY_PER_PT = 0.25;
// A comparable permit's influence decays with distance; one 250m away
// carries half the weight of one immediately adjacent.
const COMPARABLE_DISTANCE_HALFLIFE_M = 250;

function comparableApprovalRate(permits: ScoringComparablePermit[], fallback: number): number {
  // Pending and withdrawn filings never reached a decision, so they are
  // excluded rather than counted as either a pass or a fail.
  const decided = permits.filter((p) => p.status === "approved" || p.status === "refused");
  if (decided.length === 0) return fallback;

  let weightedApprovals = 0;
  let totalWeight = 0;
  for (const permit of decided) {
    const weight = 1 / (1 + permit.distanceM / COMPARABLE_DISTANCE_HALFLIFE_M);
    totalWeight += weight;
    if (permit.status === "approved") weightedApprovals += weight;
  }
  return (weightedApprovals / totalWeight) * 100;
}

function computePlanningScore(inputs: ScoringInputs): number {
  const commune = inputs.commune;
  const comparableRate = comparableApprovalRate(inputs.comparablePermits, commune.approvalRate);

  const base =
    PLANNING_WEIGHT_COMMUNE_HISTORY * commune.approvalRate +
    PLANNING_WEIGHT_COMPARABLES * comparableRate +
    PLANNING_WEIGHT_QUALITATIVE * (commune.developmentFriendliness * 10);

  const trendAdjustment = commune.approvalRateTrendPts * PLANNING_TREND_MULTIPLIER;
  const incompleteFilePenalty = commune.incompleteFileRate * PLANNING_INCOMPLETE_FILE_PENALTY_PER_PT;

  return Math.round(clamp(base + trendAdjustment - incompleteFilePenalty, 0, 100));
}

// --- Constraints: durable, hard-to-mitigate risk (higher = fewer constraints) ---
// Starts at 100 and subtracts fixed penalties for flood exposure and
// heritage review, a scaled penalty for communes that are simply slow to
// decide (procedural drag, independent of any one project), and a modest
// penalty for very large sites, which more often draw a public inquiry.
const FLOOD_PENALTY: Record<RiskLevel, number> = { low: 0, medium: 18, high: 40 };
const HERITAGE_PENALTY = 15;
const DECISION_TIME_BASELINE_DAYS = 220; // the fastest commune observed in the sample — the reference point below which there is no penalty
const DECISION_TIME_PENALTY_PER_DAY = 0.12;
const LARGE_SITE_SCRUTINY_THRESHOLD_M2 = 3500;
const LARGE_SITE_PENALTY = 5;

function computeConstraintsScore(inputs: ScoringInputs): number {
  const floodPenalty = FLOOD_PENALTY[inputs.floodRisk];
  const heritagePenalty = inputs.heritageConstraint ? HERITAGE_PENALTY : 0;
  const decisionTimePenalty =
    Math.max(0, inputs.commune.medianDecisionDays - DECISION_TIME_BASELINE_DAYS) * DECISION_TIME_PENALTY_PER_DAY;
  const scalePenalty = inputs.siteAreaM2 > LARGE_SITE_SCRUTINY_THRESHOLD_M2 ? LARGE_SITE_PENALTY : 0;

  return Math.round(clamp(100 - floodPenalty - heritagePenalty - decisionTimePenalty - scalePenalty, 0, 100));
}

// --- Overall: a weighted composite of the three pillars above ---
// Planning carries the most weight because approval risk is the single
// biggest gate to realising any value from a site. Development comes next
// because it drives the economic upside. Constraints carries the least
// weight, both because its effects partly echo through Planning already
// (e.g. decision time) and because it is here specifically to capture
// durable physical/legal risk that process speed does not fix.
export const OPPORTUNITY_SCORE_WEIGHTS = {
  development: 0.35,
  planning: 0.4,
  constraints: 0.25,
} as const;

export function scoreOpportunity(inputs: ScoringInputs): ScoringResult {
  const development = computeDevelopmentScore(inputs);
  const planning = computePlanningScore(inputs);
  const constraints = computeConstraintsScore(inputs);
  const overall = Math.round(
    clamp(
      development * OPPORTUNITY_SCORE_WEIGHTS.development +
        planning * OPPORTUNITY_SCORE_WEIGHTS.planning +
        constraints * OPPORTUNITY_SCORE_WEIGHTS.constraints,
      0,
      100
    )
  );
  return { development, planning, constraints, overall };
}
