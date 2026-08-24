export type RiskLevel = "low" | "medium" | "high";
export type Trend = "up" | "flat" | "down";
export type PermitStatus = "approved" | "refused" | "withdrawn" | "pending";
export type ActivityLevel = "low" | "medium" | "high";

export interface Commune {
  id: string;
  name: string;
  region: "Brussels" | "Flanders";
  lat: number;
  lng: number;
  approvalRate: number; // 0-100
  approvalRateTrendPts: number; // change over 24 months, in points
  medianDecisionDays: number;
  incompleteFileRate: number; // 0-100
  densityTrend: Trend;
  permitActivity: ActivityLevel;
  developmentFriendliness: number; // 0-10
  blurb: string;
}

export interface ComparablePermit {
  id: string;
  label: string;
  communeId: string;
  distanceM: number;
  units: number;
  status: PermitStatus;
  year: number;
  note?: string;
}

export interface Opportunity {
  id: string;
  communeId: string;
  address: string;
  lat: number;
  lng: number;
  score: number;
  subScores: { development: number; planning: number; constraints: number };
  siteAreaM2: number;
  builtAreaM2: number;
  currentUseRatioPct: number;
  buildableM2: [number, number];
  units: [number, number];
  planningConfidencePct: number;
  timelineMonths: [number, number];
  zoning: string;
  currentBuilding: string;
  context: string;
  whyItWorks: string[];
  watchOuts: string[];
  floodRisk: RiskLevel;
  heritageConstraint: boolean;
  transitWalkMin: number;
  detectedDaysAgo: number;
  comparablePermitIds: string[];
}

export type FeedEventType =
  | "new_opportunity"
  | "comparable_approved"
  | "score_change"
  | "regulation_change"
  | "resubmission"
  | "parcel_detected";

export interface FeedEvent {
  id: string;
  type: FeedEventType;
  bucket: "today" | "this_week" | "earlier";
  date: string; // ISO
  opportunityId: string;
  title: string;
  description: string;
  scoreFrom?: number;
  scoreTo?: number;
}
