#!/usr/bin/env python3
"""
First real-data test: pull parcels, buildings, permits, zoning, and
heritage/flood constraints for a single commune (Overijse) and write each
as raw, untouched GeoJSON under raw/<dataset>/<date>/ — never overwritten,
per the "keep every source snapshot" principle. Nothing here transforms or
scores anything; that happens downstream, against the raw files, so a bug
in the scoring step never costs you the original pull.

Prerequisite: sources.py must have real, verified `wfs_url` values (run
discover.py against each catalog_url first — see README.md). Until then,
running this script raises a clear error rather than silently doing
nothing or fetching the wrong thing.
"""

import argparse
import hashlib
import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path

import geopandas as gpd

from sources import SOURCES, DataSource

RAW_DIR = Path(__file__).parent / "raw"

# Overijse's centre, taken from this repo's mock commune data. This is a
# POINT, not a verified administrative boundary — treat the derived bbox
# below as a rough starting filter to keep payloads small, and prefer a
# proper municipality-name/NIS-code CQL_FILTER once discover.py confirms
# the field name on each layer (a bbox alone can clip parts of the commune
# or pull in slivers of its neighbours).
OVERIJSE_CENTER = (50.7736, 4.5322)  # lat, lng
OVERIJSE_BBOX_DEGREES = 0.045  # ~5km radius at this latitude — approximate, widen if features look clipped


def bbox_from_center(lat: float, lng: float, half_span: float) -> tuple[float, float, float, float]:
    return (lng - half_span, lat - half_span, lng + half_span, lat + half_span)


def fetch_source(source: DataSource, bbox: tuple[float, float, float, float]) -> gpd.GeoDataFrame:
    if not source.wfs_url:
        raise RuntimeError(
            f"sources.py: '{source.key}' has no verified wfs_url yet.\n"
            f"  1. Run: python discover.py <candidate service URL>\n"
            f"     (start from the catalog page: {source.catalog_url})\n"
            f"  2. Paste the confirmed URL and layer name into sources.py.\n"
            f"  3. Re-run this script."
        )
    layer = source.layer_hint
    target = f"WFS:{source.wfs_url}"
    print(f"[{source.key}] reading layer={layer!r} bbox={bbox} from {target}")
    return gpd.read_file(target, layer=layer, bbox=bbox)


def row_hash(gdf: gpd.GeoDataFrame) -> str:
    """A cheap content hash so a scheduled re-run can tell 'nothing changed'
    from 'something changed' without a human diffing GeoJSON by eye."""
    payload = gdf.drop(columns=gdf.geometry.name).to_json() if len(gdf) else "[]"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]


def save_raw(source_key: str, gdf: gpd.GeoDataFrame, run_date: date) -> Path:
    out_dir = RAW_DIR / source_key / run_date.isoformat()
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "features.geojson"
    gdf.to_file(out_path, driver="GeoJSON")

    meta = {
        "source_key": source_key,
        "ingested_at": datetime.now(timezone.utc).isoformat(),
        "feature_count": int(len(gdf)),
        "row_hash": row_hash(gdf),
    }
    (out_dir / "meta.json").write_text(json.dumps(meta, indent=2))
    print(f"[{source_key}] wrote {meta['feature_count']} features -> {out_path} (hash={meta['row_hash']})")
    return out_path


DATASET_KEYS_FOR_ONE_COMMUNE = [
    "parcels_flanders_fiscal",
    "buildings_grb",
    "permits_flanders",
    "zoning_flanders",
    "heritage_flanders",
]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--only", nargs="*", default=None, help="Limit to these source keys (default: all Overijse-relevant sources)"
    )
    args = parser.parse_args()

    keys = args.only or DATASET_KEYS_FOR_ONE_COMMUNE
    bbox = bbox_from_center(*OVERIJSE_CENTER, OVERIJSE_BBOX_DEGREES)
    run_date = date.today()

    failures: list[str] = []
    for key in keys:
        source = next((s for s in SOURCES if s.key == key), None)
        if source is None:
            print(f"unknown source key: {key}", file=sys.stderr)
            failures.append(key)
            continue
        try:
            gdf = fetch_source(source, bbox)
            save_raw(key, gdf, run_date)
        except Exception as exc:  # noqa: BLE001 - surface every failure, keep going so one bad source doesn't block the rest
            print(f"[{key}] FAILED: {exc}", file=sys.stderr)
            failures.append(key)

    if failures:
        print(f"\n{len(failures)}/{len(keys)} source(s) failed: {failures}", file=sys.stderr)
        return 1
    print(f"\nAll {len(keys)} sources ingested for {run_date.isoformat()}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
