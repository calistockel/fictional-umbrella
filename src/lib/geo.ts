export interface GeoBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export function boundsFor(points: { lat: number; lng: number }[], paddingRatio = 0.18): GeoBounds {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latPad = (maxLat - minLat) * paddingRatio || 0.02;
  const lngPad = (maxLng - minLng) * paddingRatio || 0.02;
  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLng: minLng - lngPad,
    maxLng: maxLng + lngPad,
  };
}

export function project(lat: number, lng: number, bounds: GeoBounds): { xPct: number; yPct: number } {
  const xPct = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const yPct = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
  return { xPct, yPct };
}
