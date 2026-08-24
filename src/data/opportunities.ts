import type { Opportunity } from "../types";
import { permitsForCommune, streetPool } from "./permits";
import { communes } from "./communes";

type Seed = {
  id: string;
  communeId: string;
  address: string;
  dLat: number;
  dLng: number;
  score: number;
  siteAreaM2: number;
  builtAreaM2: number;
  buildable: [number, number];
  units: [number, number];
  timelineMonths: [number, number];
  zoning: string;
  currentBuilding: string;
  context: string;
  whyItWorks: string[];
  watchOuts: string[];
  floodRisk: "low" | "medium" | "high";
  heritageConstraint: boolean;
  transitWalkMin: number;
  detectedDaysAgo: number;
  comparableCount: number;
};

const seeds: Seed[] = [
  {
    id: "opp-waterloo-01",
    communeId: "waterloo",
    address: "Chaussée de Bruxelles 214, Waterloo",
    dLat: 0.004,
    dLng: -0.006,
    score: 94,
    siteAreaM2: 4760,
    builtAreaM2: 620,
    buildable: [3100, 3900],
    units: [26, 34],
    timelineMonths: [7, 10],
    zoning: "Residential — mixed density",
    currentBuilding: "Vacant single-storey commercial building, largely disused since 2021",
    context: "Fronts a major arterial road, 6 min walk from Waterloo centre and the SNCB station.",
    whyItWorks: [
      "Heavily underused site relative to its zoning envelope",
      "__COMPARABLE_STAT__",
      "Recent densification accepted 320m away",
      "Favourable road access, no shared-wall constraints",
    ],
    watchOuts: ["Public inquiry likely given road-facing frontage", "Neighbouring residential plots to the rear", "Height above 4 storeys will draw scrutiny"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 6,
    detectedDaysAgo: 2,
    comparableCount: 12,
  },
  {
    id: "opp-uccle-01",
    communeId: "uccle",
    address: "Avenue Winston Churchill 88, Uccle",
    dLat: -0.006,
    dLng: 0.004,
    score: 91,
    siteAreaM2: 3820,
    builtAreaM2: 540,
    buildable: [2400, 2900],
    units: [20, 26],
    timelineMonths: [8, 12],
    zoning: "Residential — moderate density (PPAS compatible)",
    currentBuilding: "Ageing detached house on an oversized plot",
    context: "Prime Uccle avenue with strong recent turnover of comparable corner plots.",
    whyItWorks: [
      "Plot size far exceeds the footprint of the existing building",
      "Strong track record of approvals along this avenue",
      "Excellent tram and bus access",
      "No flood or heritage overlay",
    ],
    watchOuts: ["Vocal neighbourhood association in this sub-zone", "Mature trees may require a compensation plan"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 4,
    detectedDaysAgo: 6,
    comparableCount: 11,
  },
  {
    id: "opp-overijse-01",
    communeId: "overijse",
    address: "Brusselsesteenweg 142, Overijse",
    dLat: 0.003,
    dLng: 0.005,
    score: 87,
    siteAreaM2: 5220,
    builtAreaM2: 780,
    buildable: [3300, 4100],
    units: [28, 36],
    timelineMonths: [8, 11],
    zoning: "Residential — recently rezoned for higher density",
    currentBuilding: "Former horticulture site, partially cleared",
    context: "Sits inside the corridor recently opened up by Overijse's updated zoning plan.",
    whyItWorks: [
      "Rezoning in 2024 directly increased buildable envelope",
      "Municipality actively approving replacement housing here",
      "Large contiguous plot, few easement constraints",
    ],
    watchOuts: ["Access road will need widening", "Slight slope may add foundation cost"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 11,
    detectedDaysAgo: 0,
    comparableCount: 10,
  },
  {
    id: "opp-zaventem-01",
    communeId: "zaventem",
    address: "Leuvensesteenweg 310, Zaventem",
    dLat: -0.004,
    dLng: -0.003,
    score: 85,
    siteAreaM2: 3960,
    builtAreaM2: 610,
    buildable: [2600, 3200],
    units: [22, 28],
    timelineMonths: [9, 13],
    zoning: "Residential — transit-oriented density bonus",
    currentBuilding: "Disused warehouse, single tenant vacated 2023",
    context: "Within the transit-density bonus corridor near Zaventem station.",
    whyItWorks: [
      "Density bonus applies within 600m of the station",
      "Strong airport-corridor rental demand",
      "Site already cleared of prior industrial use",
    ],
    watchOuts: ["Noise contour requires acoustic study", "Soil survey pending on former industrial use"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 7,
    detectedDaysAgo: 4,
    comparableCount: 9,
  },
  {
    id: "opp-tervuren-01",
    communeId: "tervuren",
    address: "Brusselsesteenweg 76, Tervuren",
    dLat: 0.005,
    dLng: -0.004,
    score: 82,
    siteAreaM2: 3340,
    builtAreaM2: 560,
    buildable: [2000, 2500],
    units: [16, 21],
    timelineMonths: [9, 13],
    zoning: "Residential — moderate density",
    currentBuilding: "Two adjoined townhouses, structurally poor condition",
    context: "Centre of Tervuren, outside the forest-edge protected buffer.",
    whyItWorks: ["Outside the sensitive forest buffer zone", "Comparable mid-rise recently approved nearby", "Central location with strong resale demand"],
    watchOuts: ["Village-centre aesthetic guidelines apply", "Demolition permit required before build permit"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 9,
    detectedDaysAgo: 9,
    comparableCount: 9,
  },
  {
    id: "opp-brussels-01",
    communeId: "brussels-centre",
    address: "Avenue de Tervueren 412, Brussels",
    dLat: -0.003,
    dLng: 0.006,
    score: 79,
    siteAreaM2: 2960,
    builtAreaM2: 520,
    buildable: [2100, 2600],
    units: [19, 24],
    timelineMonths: [10, 14],
    zoning: "Residential — regeneration zone",
    currentBuilding: "Vacant office building, 1970s construction",
    context: "Sits within a designated regeneration perimeter along a major avenue.",
    whyItWorks: ["Regeneration zone status accelerates review", "Office-to-residential conversion precedent nearby", "Metro access under 500m"],
    watchOuts: ["Facade may be subject to a preservation recommendation", "High competition for construction slots in this zone"],
    floodRisk: "low",
    heritageConstraint: true,
    transitWalkMin: 5,
    detectedDaysAgo: 12,
    comparableCount: 10,
  },
  {
    id: "opp-wb-01",
    communeId: "watermael-boitsfort",
    address: "Chaussée de La Hulpe 178, Watermael-Boitsfort",
    dLat: 0.002,
    dLng: -0.005,
    score: 76,
    siteAreaM2: 4100,
    builtAreaM2: 700,
    buildable: [1900, 2400],
    units: [15, 19],
    timelineMonths: [10, 14],
    zoning: "Residential — low-to-moderate density",
    currentBuilding: "Detached villa on a large wooded plot",
    context: "Green residential setting close to Sonian Forest; density limits are moderate.",
    whyItWorks: ["Sizeable plot with modest existing footprint", "Consistent approval history for townhouse-scale infill"],
    watchOuts: ["Tree preservation order likely on part of the plot", "Commune favours low-rise character strongly"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 14,
    detectedDaysAgo: 15,
    comparableCount: 8,
  },
  {
    id: "opp-waterloo-02",
    communeId: "waterloo",
    address: "Avenue de la Bergerie 45, Waterloo",
    dLat: -0.005,
    dLng: 0.003,
    score: 73,
    siteAreaM2: 2680,
    builtAreaM2: 480,
    buildable: [1500, 1900],
    units: [12, 16],
    timelineMonths: [8, 12],
    zoning: "Residential — moderate density",
    currentBuilding: "Single-family house with large rear garden",
    context: "Residential side street, 12 minutes from Waterloo centre.",
    whyItWorks: ["Waterloo's fastest-improving approval rate in the sample", "Low complexity site, no shared structures"],
    watchOuts: ["Rear-garden depth may limit unit count if setback rules apply strictly"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 12,
    detectedDaysAgo: 0,
    comparableCount: 8,
  },
  {
    id: "opp-overijse-02",
    communeId: "overijse",
    address: "Waversesteenweg 210, Overijse",
    dLat: -0.004,
    dLng: 0.004,
    score: 71,
    siteAreaM2: 3120,
    builtAreaM2: 640,
    buildable: [1700, 2100],
    units: [14, 18],
    timelineMonths: [9, 13],
    zoning: "Residential — moderate density",
    currentBuilding: "Small commercial unit and adjoining plot",
    context: "Secondary arterial road, mixed residential and light commercial.",
    whyItWorks: ["Zoning allows mixed ground-floor use, aiding financing flexibility", "Reasonable comparable approval rate"],
    watchOuts: ["Ground-floor commercial requirement may reduce residential yield", "Parking ratio requirement is strict here"],
    floodRisk: "medium",
    heritageConstraint: false,
    transitWalkMin: 13,
    detectedDaysAgo: 18,
    comparableCount: 8,
  },
  {
    id: "opp-kraainem-01",
    communeId: "kraainem",
    address: "Wezembeeklaan 63, Kraainem",
    dLat: 0.003,
    dLng: -0.003,
    score: 68,
    siteAreaM2: 2450,
    builtAreaM2: 520,
    buildable: [1200, 1550],
    units: [10, 13],
    timelineMonths: [11, 15],
    zoning: "Residential — low density",
    currentBuilding: "Detached house, average condition",
    context: "Quiet residential street with a mix of villas and small apartment buildings.",
    whyItWorks: ["A few comparable small-scale conversions have gone through recently"],
    watchOuts: ["Commune has one of the lower approval rates in the sample", "Public inquiries here frequently generate objections"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 10,
    detectedDaysAgo: 21,
    comparableCount: 7,
  },
  {
    id: "opp-uccle-02",
    communeId: "uccle",
    address: "Chaussée d'Alsemberg 501, Uccle",
    dLat: 0.006,
    dLng: -0.002,
    score: 65,
    siteAreaM2: 2180,
    builtAreaM2: 460,
    buildable: [1100, 1400],
    units: [9, 12],
    timelineMonths: [9, 13],
    zoning: "Residential — moderate density",
    currentBuilding: "Semi-detached house, partial commercial ground floor",
    context: "Busy chaussée with mixed-use character further from the metro.",
    whyItWorks: ["Good transit frequency along the chaussée", "Site is straightforward with no easements"],
    watchOuts: ["Traffic noise may require facade treatment", "Smaller plot limits unit economics"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 8,
    detectedDaysAgo: 24,
    comparableCount: 8,
  },
  {
    id: "opp-rsg-01",
    communeId: "rhode-saint-genese",
    address: "Chaussée de Waterloo 310, Rhode-Saint-Genèse",
    dLat: -0.003,
    dLng: -0.004,
    score: 61,
    siteAreaM2: 3480,
    builtAreaM2: 780,
    buildable: [1400, 1800],
    units: [11, 15],
    timelineMonths: [12, 16],
    zoning: "Residential — low-to-moderate density",
    currentBuilding: "Large villa, subdivided into offices",
    context: "Affluent residential commune with cautious planning culture.",
    whyItWorks: ["Plot size supports a reasonable unit count if approved", "Office-to-residential conversion is generally viewed favourably"],
    watchOuts: ["One of the slowest median decision times in the sample", "High incomplete-file rate suggests procedural strictness"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 16,
    detectedDaysAgo: 27,
    comparableCount: 7,
  },
  {
    id: "opp-zaventem-02",
    communeId: "zaventem",
    address: "Hoogstraat 22, Zaventem",
    dLat: 0.004,
    dLng: 0.003,
    score: 58,
    siteAreaM2: 1980,
    builtAreaM2: 520,
    buildable: [950, 1250],
    units: [8, 11],
    timelineMonths: [10, 14],
    zoning: "Residential — moderate density",
    currentBuilding: "Rowhouse with rear extension",
    context: "Dense residential fabric close to the village centre.",
    whyItWorks: ["Consistent small-scale approvals in this street"],
    watchOuts: ["Shared-wall construction adds technical complexity", "Limited buildable envelope for the site size"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 9,
    detectedDaysAgo: 0,
    comparableCount: 7,
  },
  {
    id: "opp-brussels-02",
    communeId: "brussels-centre",
    address: "Chaussée d'Ixelles 88, Brussels",
    dLat: 0.005,
    dLng: -0.005,
    score: 55,
    siteAreaM2: 1640,
    builtAreaM2: 480,
    buildable: [850, 1100],
    units: [7, 10],
    timelineMonths: [11, 15],
    zoning: "Residential — dense urban fabric",
    currentBuilding: "Mixed-use building, ground floor retail",
    context: "Dense urban block with high competition for construction slots.",
    whyItWorks: ["Excellent transit and amenity access"],
    watchOuts: ["Small plot limits scale", "High procedural competition slows review"],
    floodRisk: "low",
    heritageConstraint: true,
    transitWalkMin: 3,
    detectedDaysAgo: 29,
    comparableCount: 8,
  },
  {
    id: "opp-tervuren-02",
    communeId: "tervuren",
    address: "Leuvensesteenweg 154, Tervuren",
    dLat: -0.005,
    dLng: 0.005,
    score: 52,
    siteAreaM2: 2260,
    builtAreaM2: 610,
    buildable: [900, 1200],
    units: [7, 10],
    timelineMonths: [12, 16],
    zoning: "Residential — low density, partial buffer overlap",
    currentBuilding: "Detached house adjoining a wooded parcel",
    context: "Edge of the forest buffer zone; part of the plot falls under overlay constraints.",
    whyItWorks: ["Portion of the plot outside the buffer remains developable"],
    watchOuts: ["Buffer overlap will reduce usable footprint materially", "Environmental screening required before filing"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 15,
    detectedDaysAgo: 20,
    comparableCount: 6,
  },
  {
    id: "opp-wb-02",
    communeId: "watermael-boitsfort",
    address: "Avenue des Deux Chênes 12, Watermael-Boitsfort",
    dLat: -0.004,
    dLng: -0.003,
    score: 47,
    siteAreaM2: 1520,
    builtAreaM2: 440,
    buildable: [600, 850],
    units: [5, 7],
    timelineMonths: [12, 17],
    zoning: "Residential — low density",
    currentBuilding: "Detached house in good condition, limited surplus land",
    context: "Well-established residential street with little redevelopment precedent.",
    whyItWorks: ["Well-connected residential pocket"],
    watchOuts: ["Little surplus buildable area beyond the existing footprint", "Strong low-rise preservation sentiment locally"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 17,
    detectedDaysAgo: 23,
    comparableCount: 6,
  },
  {
    id: "opp-kraainem-02",
    communeId: "kraainem",
    address: "Kerkstraat 40, Kraainem",
    dLat: -0.002,
    dLng: 0.004,
    score: 44,
    siteAreaM2: 1380,
    builtAreaM2: 420,
    buildable: [520, 720],
    units: [4, 6],
    timelineMonths: [13, 18],
    zoning: "Residential — low density",
    currentBuilding: "Detached house, small rear plot",
    context: "Compact residential lot with limited redevelopment margin.",
    whyItWorks: ["Straightforward single-owner title with no easements"],
    watchOuts: ["Below the commune's typical viable scale for multi-unit permits", "Low approval rate and long decision times locally"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 12,
    detectedDaysAgo: 26,
    comparableCount: 6,
  },
  {
    id: "opp-rsg-02",
    communeId: "rhode-saint-genese",
    address: "Steenweg op Brussel 145, Rhode-Saint-Genèse",
    dLat: 0.004,
    dLng: 0.002,
    score: 39,
    siteAreaM2: 1240,
    builtAreaM2: 380,
    buildable: [420, 600],
    units: [3, 5],
    timelineMonths: [14, 19],
    zoning: "Residential — low density, flood overlay",
    currentBuilding: "Detached bungalow",
    context: "Sits partly within a mapped flood-risk overlay along a small watercourse.",
    whyItWorks: ["Central location within the village"],
    watchOuts: ["Flood overlay materially constrains ground-floor use", "Small scale limits development economics"],
    floodRisk: "high",
    heritageConstraint: false,
    transitWalkMin: 18,
    detectedDaysAgo: 28,
    comparableCount: 5,
  },
];

// Additional communes are populated procedurally rather than hand-authored,
// reusing the same Seed shape so they flow through the identical pipeline
// (sub-scores, planning confidence derived from real comparable counts, etc.)
const generatedCommuneIds = [
  "ixelles",
  "etterbeek",
  "schaerbeek",
  "saint-gilles",
  "forest",
  "woluwe-saint-pierre",
  "auderghem",
  "vilvoorde",
  "grimbergen",
  "dilbeek",
  "sint-pieters-leeuw",
  "beersel",
  "linkebeek",
  "wezembeek-oppem",
  "kortenberg",
  "hoeilaart",
];

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const zoningPool = [
  "Residential — moderate density",
  "Residential — low density",
  "Residential — transit-oriented density bonus",
  "Residential — recently rezoned for higher density",
  "Residential — mixed density",
];

const buildingPool = [
  "Detached house on an oversized plot",
  "Vacant commercial building, disused for several years",
  "Ageing rowhouse in poor condition",
  "Underused industrial or storage plot",
  "Two adjoined townhouses, structurally poor condition",
  "Single-family house with a large rear garden",
  "Former retail unit with residential upper floors",
];

const whyPool = [
  "Plot size significantly exceeds the footprint of the existing structure",
  "Straightforward site with no shared-wall constraints",
  "Good access from a public road, no easements identified",
  "Comparable mid-rise projects have cleared review recently nearby",
  "Zoning envelope allows meaningfully more than what's built today",
  "No major environmental constraints identified",
  "Reasonable distance to public transport",
  "Site sits within a corridor the municipality is actively densifying",
  "Single-owner title simplifies acquisition",
];

const watchPool = [
  "Public inquiry likely given the residential setting",
  "Neighbouring properties may raise objections",
  "Height above the surrounding roofline will draw scrutiny",
  "Parking ratio requirements may constrain the scheme",
  "Demolition permit required before a building permit can be filed",
  "Site shape may require a bespoke massing study",
  "Access road width should be verified before filing",
  "Mature trees on site may require a compensation plan",
];

function pick<T>(rand: () => number, pool: T[], n: number): T[] {
  const arr = [...pool];
  const out: T[] = [];
  for (let i = 0; i < n && arr.length > 0; i++) {
    const idx = Math.floor(rand() * arr.length);
    out.push(arr.splice(idx, 1)[0]);
  }
  return out;
}

function generateSeeds(): Seed[] {
  const rand = mulberry32(4820231);
  const out: Seed[] = [];
  let newTodayBudget = 2;

  for (const communeId of generatedCommuneIds) {
    const commune = communes.find((c) => c.id === communeId)!;
    const streets = streetPool[communeId] ?? ["Rue Centrale"];
    const count = 2 + Math.floor(rand() * 2); // 2-3 opportunities per commune

    for (let i = 0; i < count; i++) {
      const street = streets[Math.floor(rand() * streets.length)];
      const number = 4 + Math.floor(rand() * 240);

      const base = commune.developmentFriendliness * 9 + (rand() - 0.5) * 34;
      const score = Math.max(32, Math.min(96, Math.round(base)));

      const siteAreaM2 = Math.round(1300 + rand() * 4200);
      const useRatio = 0.12 + rand() * 0.28;
      const builtAreaM2 = Math.round(siteAreaM2 * useRatio);
      const buildableFactor = 0.32 + score / 260;
      const buildableMin = Math.round(siteAreaM2 * buildableFactor);
      const buildableMax = Math.round(buildableMin * (1.18 + rand() * 0.14));
      const unitsMin = Math.max(3, Math.round(buildableMin / 105));
      const unitsMax = Math.max(unitsMin + 2, Math.round(buildableMax / 88));

      const baseMonths = Math.round(commune.medianDecisionDays / 30);
      const timelineMonths: [number, number] = [Math.max(6, baseMonths - 1), baseMonths + 3];

      const availableComparables = permitsForCommune(communeId).length;
      const comparableCount = Math.max(4, Math.min(availableComparables, 6 + Math.floor(rand() * 6)));

      const floodRoll = rand();
      const floodRisk: "low" | "medium" | "high" = floodRoll > 0.92 ? "high" : floodRoll > 0.75 ? "medium" : "low";
      const heritageConstraint = rand() > 0.84;

      let detectedDaysAgo: number;
      if (newTodayBudget > 0 && rand() > 0.7) {
        detectedDaysAgo = 0;
        newTodayBudget--;
      } else {
        detectedDaysAgo = Math.floor(rand() * 30);
      }

      const why = pick(rand, whyPool, 3);
      why.splice(
        Math.floor(rand() * (why.length + 1)),
        0,
        `${commune.approvalRate}% approval rate in ${commune.name} over the past 24 months`
      );

      out.push({
        id: `opp-${communeId}-${i + 1}`,
        communeId,
        address: `${street} ${number}, ${commune.name}`,
        dLat: (rand() - 0.5) * 0.016,
        dLng: (rand() - 0.5) * 0.016,
        score,
        siteAreaM2,
        builtAreaM2,
        buildable: [buildableMin, buildableMax],
        units: [unitsMin, unitsMax],
        timelineMonths,
        zoning: zoningPool[Math.floor(rand() * zoningPool.length)],
        currentBuilding: buildingPool[Math.floor(rand() * buildingPool.length)],
        context: commune.blurb,
        whyItWorks: why,
        watchOuts: pick(rand, watchPool, 2),
        floodRisk,
        heritageConstraint,
        transitWalkMin: 4 + Math.floor(rand() * 17),
        detectedDaysAgo,
        comparableCount,
      });
    }
  }
  return out;
}

function scoreBand(score: number) {
  if (score >= 85) return "excellent" as const;
  if (score >= 70) return "strong" as const;
  if (score >= 55) return "worth_investigating" as const;
  return "low" as const;
}

function subScoresFor(seed: Seed) {
  const rand = (n: number) => Math.round(((n * 9301 + 49297) % 233280) / 233280 * 10);
  const jitter1 = rand(seed.score) % 7 - 3;
  const jitter2 = rand(seed.score + 17) % 7 - 3;
  const development = Math.max(20, Math.min(99, seed.score + 3 + jitter1));
  const constraints = Math.max(20, Math.min(99, seed.score - 4 + jitter2));
  const planning = Math.max(20, Math.min(99, seed.score));
  return { development, planning, constraints };
}

function buildOpportunities(): Opportunity[] {
  const allSeeds = [...seeds, ...generateSeeds()];
  return allSeeds.map((seed) => {
    const commune = communes.find((c) => c.id === seed.communeId)!;
    const comparablePermitIds = permitsForCommune(seed.communeId)
      .slice(0, seed.comparableCount)
      .map((p) => p.id);
    const approved = permitsForCommune(seed.communeId)
      .slice(0, seed.comparableCount)
      .filter((p) => p.status === "approved").length;
    const rawRatio = approved / seed.comparableCount;
    const planningConfidencePct = Math.max(28, Math.min(96, Math.round(rawRatio * 100 * 0.6 + seed.score * 0.4)));
    const whyItWorks = seed.whyItWorks.map((line) =>
      line === "__COMPARABLE_STAT__"
        ? `${approved} of ${seed.comparableCount} comparable permits in the area approved`
        : line
    );

    return {
      id: seed.id,
      communeId: seed.communeId,
      address: seed.address,
      lat: commune.lat + seed.dLat,
      lng: commune.lng + seed.dLng,
      score: seed.score,
      subScores: subScoresFor(seed),
      siteAreaM2: seed.siteAreaM2,
      builtAreaM2: seed.builtAreaM2,
      currentUseRatioPct: Math.round((seed.builtAreaM2 / seed.siteAreaM2) * 100),
      buildableM2: seed.buildable,
      units: seed.units,
      planningConfidencePct,
      timelineMonths: seed.timelineMonths,
      zoning: seed.zoning,
      currentBuilding: seed.currentBuilding,
      context: seed.context,
      whyItWorks,
      watchOuts: seed.watchOuts,
      floodRisk: seed.floodRisk,
      heritageConstraint: seed.heritageConstraint,
      transitWalkMin: seed.transitWalkMin,
      detectedDaysAgo: seed.detectedDaysAgo,
      comparablePermitIds,
    };
  });
}

export const opportunities: Opportunity[] = buildOpportunities();

export const opportunityById = (id: string) => opportunities.find((o) => o.id === id);

export { scoreBand };
