import type { ComparablePermit, PermitStatus } from "../types";
import { communes } from "./communes";

// Deterministic pseudo-random generator so the mock dataset is stable across reloads.
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

export const streetPool: Record<string, string[]> = {
  uccle: ["Avenue Winston Churchill", "Chaussée d'Alsemberg", "Rue Vanderkindere", "Avenue de Fré", "Rue Basse"],
  "watermael-boitsfort": ["Chaussée de La Hulpe", "Avenue des Deux Chênes", "Rue Middelbourg", "Drève des Weigélias"],
  waterloo: ["Chaussée de Bruxelles", "Avenue de la Bergerie", "Rue Fond Marache", "Chemin du Vert Chasseur"],
  "rhode-saint-genese": ["Chaussée de Waterloo", "Steenweg op Brussel", "Kasteellaan", "Rue de Genval"],
  overijse: ["Brusselsesteenweg", "Waversesteenweg", "Justus Lipsiuslaan", "Beatrijslaan"],
  tervuren: ["Brusselsesteenweg", "Leuvensesteenweg", "Vossemsesteenweg", "Kerkstraat"],
  zaventem: ["Leuvensesteenweg", "Hoogstraat", "Stationlei", "Woluwelaan"],
  kraainem: ["Wezembeeklaan", "Kerkstraat", "Waversesteenweg", "Sint-Jozefslaan"],
  "brussels-centre": ["Avenue Louise", "Chaussée d'Ixelles", "Rue de la Loi", "Boulevard Anspach", "Avenue de Tervueren"],
  ixelles: ["Chaussée de Boondael", "Rue du Bailli", "Avenue de la Couronne", "Rue Malibran"],
  etterbeek: ["Chaussée de Wavre", "Rue des Tongres", "Avenue des Celtes", "Rue Général Leman"],
  schaerbeek: ["Chaussée de Haecht", "Avenue Rogier", "Rue Josaphat", "Boulevard Lambermont"],
  "saint-gilles": ["Chaussée de Waterloo", "Rue de l'Hôtel des Monnaies", "Avenue Ducpétiaux", "Rue Vanderschrick"],
  forest: ["Chaussée de Bruxelles", "Avenue Van Volxem", "Rue du Charroi", "Avenue Jupiter"],
  "woluwe-saint-pierre": ["Avenue de Tervueren", "Avenue Orban", "Avenue du Prince Héritier"],
  auderghem: ["Chaussée de Wavre", "Boulevard du Souverain", "Avenue Jean Van Horenbeeck"],
  vilvoorde: ["Mechelsesteenweg", "Leuvensestraat", "Havenstraat", "Schaarbeeklei"],
  grimbergen: ["Prinsenstraat", "Guldendallaan", "Verbrandebrug"],
  dilbeek: ["Ninoofsesteenweg", "Gentsesteenweg", "Bodegemstraat"],
  "sint-pieters-leeuw": ["Bergensesteenweg", "Zuunstraat", "Fabriekstraat"],
  beersel: ["Alsembergsesteenweg", "Dwersbos", "Herman Teirlinckstraat"],
  linkebeek: ["Rue de la Station", "Rue Grosjean", "Rue du Village"],
  "wezembeek-oppem": ["De Ronestraat", "Kruisstraat", "Kerkhofstraat"],
  kortenberg: ["Stationsstraat", "Leuvensesteenweg", "Vlasstraat"],
  hoeilaart: ["Terhulpsesteenweg", "Dennenlaan", "Duboislaan"],
};

const projectWords = ["Résidence", "Domaine", "Villa", "Cour", "Jardins", "Terrasses", "Rives", "Clos"];

function buildPermits(): ComparablePermit[] {
  const rand = mulberry32(20260318);
  const permits: ComparablePermit[] = [];
  let counter = 1;

  for (const commune of communes) {
    const streets = streetPool[commune.id] ?? ["Rue Centrale"];
    const count = 9 + Math.floor(rand() * 7); // 9-15 per commune
    for (let i = 0; i < count; i++) {
      const distanceM = Math.round(60 + rand() * 1400);
      const units = Math.round(6 + rand() * 44);
      const statusRoll = rand();
      let status: PermitStatus = "approved";
      if (statusRoll > 0.68 && statusRoll <= 0.85) status = "refused";
      else if (statusRoll > 0.85 && statusRoll <= 0.94) status = "withdrawn";
      else if (statusRoll > 0.94) status = "pending";
      const year = 2023 + Math.floor(rand() * 3);
      const street = streets[Math.floor(rand() * streets.length)];
      const word = projectWords[Math.floor(rand() * projectWords.length)];
      permits.push({
        id: `permit-${counter++}`,
        label: `${word} ${street.split(" ").slice(-1)[0]}`,
        communeId: commune.id,
        distanceM,
        units,
        status,
        year,
        note: `${street}, ${commune.name}`,
      });
    }
  }
  return permits;
}

export const permits: ComparablePermit[] = buildPermits();

export const permitById = (id: string) => permits.find((p) => p.id === id);

export const permitsForCommune = (communeId: string) =>
  permits.filter((p) => p.communeId === communeId).sort((a, b) => a.distanceM - b.distanceM);
