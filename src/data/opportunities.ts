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
    zoning: "Résidentiel — densité mixte",
    currentBuilding: "Bâtiment commercial de plain-pied vacant, largement inoccupé depuis 2021",
    context: "En façade d'un axe majeur, 6 min à pied du centre de Waterloo et de la gare SNCB.",
    whyItWorks: [
      "Site fortement sous-exploité par rapport à son enveloppe de zonage",
      "__COMPARABLE_STAT__",
      "Densification récente acceptée à 320 m",
      "Accès routier favorable, aucune contrainte de mur mitoyen",
    ],
    watchOuts: ["Enquête publique probable vu la façade sur voirie", "Parcelles résidentielles voisines à l'arrière", "Une hauteur supérieure à 4 étages attirera l'attention"],
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
    zoning: "Résidentiel — densité modérée (compatible PPAS)",
    currentBuilding: "Maison unifamiliale vieillissante sur une parcelle surdimensionnée",
    context: "Avenue prisée d'Uccle avec une forte rotation récente de parcelles d'angle comparables.",
    whyItWorks: [
      "La taille de la parcelle dépasse largement l'emprise du bâtiment existant",
      "Solide historique d'approbations le long de cette avenue",
      "Excellent accès tram et bus",
      "Aucune contrainte d'inondation ni de patrimoine",
    ],
    watchOuts: ["Association de quartier vocale dans cette sous-zone", "Des arbres matures pourraient nécessiter un plan de compensation"],
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
    zoning: "Résidentiel — récemment rezoné pour une densité plus élevée",
    currentBuilding: "Ancien site horticole, partiellement dégagé",
    context: "Situé dans le corridor récemment ouvert par le plan d'affectation actualisé d'Overijse.",
    whyItWorks: [
      "Le rezonage de 2024 a directement augmenté l'enveloppe constructible",
      "La commune approuve activement le logement de remplacement ici",
      "Grande parcelle d'un seul tenant, peu de contraintes de servitude",
    ],
    watchOuts: ["La voie d'accès devra être élargie", "Une légère pente pourrait augmenter le coût des fondations"],
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
    zoning: "Résidentiel — bonus de densité lié au transport",
    currentBuilding: "Entrepôt désaffecté, locataire unique parti en 2023",
    context: "Dans le corridor à bonus de densité proche de la gare de Zaventem.",
    whyItWorks: [
      "Le bonus de densité s'applique dans un rayon de 600 m autour de la gare",
      "Forte demande locative dans le corridor aéroportuaire",
      "Site déjà dégagé de son ancien usage industriel",
    ],
    watchOuts: ["Le contour de bruit nécessite une étude acoustique", "Étude de sol en attente sur l'ancien usage industriel"],
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
    zoning: "Résidentiel — densité modérée",
    currentBuilding: "Deux maisons mitoyennes accolées, en mauvais état structurel",
    context: "Centre de Tervuren, en dehors de la zone tampon forestière protégée.",
    whyItWorks: ["En dehors de la zone tampon forestière sensible", "Projet comparable de moyenne hauteur récemment approuvé à proximité", "Emplacement central avec forte demande à la revente"],
    watchOuts: ["Des lignes directrices esthétiques de centre-village s'appliquent", "Permis de démolir requis avant le permis de bâtir"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 9,
    detectedDaysAgo: 9,
    comparableCount: 9,
  },
  {
    id: "opp-brussels-01",
    communeId: "brussels-centre",
    address: "Avenue de Tervueren 412, Bruxelles",
    dLat: -0.003,
    dLng: 0.006,
    score: 79,
    siteAreaM2: 2960,
    builtAreaM2: 520,
    buildable: [2100, 2600],
    units: [19, 24],
    timelineMonths: [10, 14],
    zoning: "Résidentiel — zone de régénération",
    currentBuilding: "Immeuble de bureaux vacant, construction des années 1970",
    context: "Situé dans un périmètre de régénération désigné le long d'une avenue majeure.",
    whyItWorks: ["Le statut de zone de régénération accélère l'instruction", "Précédent de conversion bureaux-résidentiel à proximité", "Accès métro à moins de 500 m"],
    watchOuts: ["La façade pourrait faire l'objet d'une recommandation de préservation", "Forte concurrence pour les créneaux de construction dans cette zone"],
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
    zoning: "Résidentiel — densité faible à modérée",
    currentBuilding: "Villa quatre façades sur une grande parcelle boisée",
    context: "Cadre résidentiel verdoyant proche de la forêt de Soignes ; limites de densité modérées.",
    whyItWorks: ["Parcelle de bonne taille avec une emprise bâtie modeste", "Historique d'approbations constant pour du comblement de type maisons de ville"],
    watchOuts: ["Un arrêté de préservation des arbres est probable sur une partie de la parcelle", "La commune est très attachée au caractère peu dense"],
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
    zoning: "Résidentiel — densité modérée",
    currentBuilding: "Maison unifamiliale avec grand jardin arrière",
    context: "Rue résidentielle secondaire, à 12 minutes du centre de Waterloo.",
    whyItWorks: ["Taux d'approbation le plus en progression de l'échantillon à Waterloo", "Site simple, sans structures partagées"],
    watchOuts: ["La profondeur du jardin arrière pourrait limiter le nombre d'unités si les règles de recul sont appliquées strictement"],
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
    zoning: "Résidentiel — densité modérée",
    currentBuilding: "Petit local commercial et parcelle attenante",
    context: "Axe secondaire, tissu mixte résidentiel et commerce léger.",
    whyItWorks: ["Le zonage autorise un usage mixte au rez-de-chaussée, ce qui facilite le financement", "Taux d'approbation comparable raisonnable"],
    watchOuts: ["L'obligation de commerce au rez-de-chaussée pourrait réduire le rendement résidentiel", "L'exigence de ratio de parking est stricte ici"],
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
    zoning: "Résidentiel — densité faible",
    currentBuilding: "Maison quatre façades, état moyen",
    context: "Rue résidentielle calme avec un mélange de villas et de petits immeubles à appartements.",
    whyItWorks: ["Quelques conversions comparables de petite échelle sont récemment passées"],
    watchOuts: ["La commune affiche l'un des taux d'approbation les plus bas de l'échantillon", "Les enquêtes publiques y génèrent fréquemment des recours"],
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
    zoning: "Résidentiel — densité modérée",
    currentBuilding: "Maison mitoyenne, rez-de-chaussée partiellement commercial",
    context: "Chaussée animée au caractère mixte, plus éloignée du métro.",
    whyItWorks: ["Bonne fréquence de transport le long de la chaussée", "Site simple, sans servitudes"],
    watchOuts: ["Le bruit routier pourrait nécessiter un traitement de façade", "La parcelle plus petite limite l'économie du projet"],
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
    zoning: "Résidentiel — densité faible à modérée",
    currentBuilding: "Grande villa, divisée en bureaux",
    context: "Commune résidentielle aisée avec une culture urbanistique prudente.",
    whyItWorks: ["La taille de la parcelle permet un nombre d'unités raisonnable en cas d'approbation", "La conversion bureaux-résidentiel est généralement bien perçue"],
    watchOuts: ["L'un des délais médians de décision les plus longs de l'échantillon", "Le taux élevé de dossiers incomplets suggère une rigueur procédurale"],
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
    zoning: "Résidentiel — densité modérée",
    currentBuilding: "Maison mitoyenne avec extension arrière",
    context: "Tissu résidentiel dense proche du centre du village.",
    whyItWorks: ["Approbations constantes de petite échelle dans cette rue"],
    watchOuts: ["La construction mitoyenne ajoute de la complexité technique", "Enveloppe constructible limitée pour la taille du site"],
    floodRisk: "low",
    heritageConstraint: false,
    transitWalkMin: 9,
    detectedDaysAgo: 0,
    comparableCount: 7,
  },
  {
    id: "opp-brussels-02",
    communeId: "brussels-centre",
    address: "Chaussée d'Ixelles 88, Bruxelles",
    dLat: 0.005,
    dLng: -0.005,
    score: 55,
    siteAreaM2: 1640,
    builtAreaM2: 480,
    buildable: [850, 1100],
    units: [7, 10],
    timelineMonths: [11, 15],
    zoning: "Résidentiel — tissu urbain dense",
    currentBuilding: "Immeuble à usage mixte, commerce au rez-de-chaussée",
    context: "Îlot urbain dense avec une forte concurrence pour les créneaux de construction.",
    whyItWorks: ["Excellent accès au transport et aux commodités"],
    watchOuts: ["La petite parcelle limite l'échelle du projet", "La forte concurrence procédurale ralentit l'instruction"],
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
    zoning: "Résidentiel — densité faible, chevauchement partiel de la zone tampon",
    currentBuilding: "Maison quatre façades attenante à une parcelle boisée",
    context: "Bordure de la zone tampon forestière ; une partie de la parcelle est soumise à des contraintes de superposition.",
    whyItWorks: ["La portion de la parcelle hors zone tampon reste constructible"],
    watchOuts: ["Le chevauchement de la zone tampon réduira sensiblement l'emprise utilisable", "Un screening environnemental est requis avant dépôt"],
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
    zoning: "Résidentiel — densité faible",
    currentBuilding: "Maison quatre façades en bon état, peu de terrain excédentaire",
    context: "Rue résidentielle bien établie avec peu de précédents de redéveloppement.",
    whyItWorks: ["Poche résidentielle bien desservie"],
    watchOuts: ["Peu de surface constructible au-delà de l'emprise existante", "Fort attachement local à la préservation du caractère peu dense"],
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
    zoning: "Résidentiel — densité faible",
    currentBuilding: "Maison quatre façades, petite parcelle arrière",
    context: "Lot résidentiel compact avec une marge de redéveloppement limitée.",
    whyItWorks: ["Titre de propriété unique et simple, sans servitudes"],
    watchOuts: ["En dessous de l'échelle habituellement viable pour des permis multi-unités dans la commune", "Taux d'approbation faible et délais de décision longs localement"],
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
    zoning: "Résidentiel — densité faible, zone inondable",
    currentBuilding: "Bungalow quatre façades",
    context: "Se situe en partie dans une zone cartographiée à risque d'inondation le long d'un petit cours d'eau.",
    whyItWorks: ["Emplacement central dans le village"],
    watchOuts: ["La zone inondable contraint fortement l'usage du rez-de-chaussée", "La petite échelle limite l'économie du projet"],
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
  "Résidentiel — densité modérée",
  "Résidentiel — densité faible",
  "Résidentiel — bonus de densité lié au transport",
  "Résidentiel — récemment rezoné pour une densité plus élevée",
  "Résidentiel — densité mixte",
];

const buildingPool = [
  "Maison quatre façades sur une parcelle surdimensionnée",
  "Bâtiment commercial vacant, inoccupé depuis plusieurs années",
  "Maison mitoyenne vieillissante en mauvais état",
  "Parcelle industrielle ou de stockage sous-exploitée",
  "Deux maisons mitoyennes accolées, en mauvais état structurel",
  "Maison unifamiliale avec grand jardin arrière",
  "Ancien commerce avec étages résidentiels",
];

const whyPool = [
  "La taille de la parcelle dépasse largement l'emprise de la structure existante",
  "Site simple, sans contrainte de mur mitoyen",
  "Bon accès depuis une voirie publique, aucune servitude identifiée",
  "Des projets comparables de moyenne hauteur ont récemment obtenu leur permis à proximité",
  "L'enveloppe de zonage autorise sensiblement plus que ce qui est bâti aujourd'hui",
  "Aucune contrainte environnementale majeure identifiée",
  "Distance raisonnable aux transports en commun",
  "Le site se trouve dans un corridor que la commune densifie activement",
  "Titre de propriété unique, ce qui simplifie l'acquisition",
];

const watchPool = [
  "Enquête publique probable vu le cadre résidentiel",
  "Les propriétés voisines pourraient soulever des objections",
  "Une hauteur dépassant la ligne de toiture environnante attirera l'attention",
  "Les exigences de ratio de parking pourraient contraindre le projet",
  "Permis de démolir requis avant le dépôt du permis de bâtir",
  "La forme du site pourrait nécessiter une étude de volumétrie sur mesure",
  "La largeur de la voie d'accès devrait être vérifiée avant dépôt",
  "Des arbres matures sur le site pourraient nécessiter un plan de compensation",
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
        `Taux d'approbation de ${commune.approvalRate}% à ${commune.name} sur les 24 derniers mois`
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
        ? `${approved} permis comparables sur ${seed.comparableCount} approuvés dans le secteur`
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
