#!/usr/bin/env python3
"""
Run this FIRST, before ingest_overijse.py — and only once you have real
network access (this sandbox does not; see README.md).

Given a candidate WFS or OGC API Features base URL, lists the layers it
actually exposes, so you can confirm the exact `wfs_url` / `layer` values
to put in sources.py instead of guessing.

Usage:
    python discover.py https://example.org/geoserver/wfs
    python discover.py https://example.org/geoserver/wfs --raw   # dump raw GetCapabilities XML too
"""

import argparse
import sys

import pyogrio
import requests


def list_layers_via_gdal(base_url: str) -> None:
    """
    GDAL's OGR WFS/OAPIF drivers handle the OGC protocol details (paging,
    version negotiation) for us — this is the same mechanism ingest_overijse.py
    uses to actually pull features, so if this works, the real fetch will too.
    """
    for prefix, label in [("WFS:", "WFS driver"), ("OAPIF:", "OGC API Features driver")]:
        target = f"{prefix}{base_url}"
        print(f"\n--- Trying {label}: {target}")
        try:
            layers = pyogrio.list_layers(target)
        except Exception as exc:  # noqa: BLE001 - we want to see any driver error, not just a curated subset
            print(f"  failed: {exc}")
            continue
        if len(layers) == 0:
            print("  no layers returned")
            continue
        for name, geom_type in layers:
            print(f"  layer: {name!r:40s} geometry={geom_type}")


def dump_raw_capabilities(base_url: str) -> None:
    """Fallback for when the GDAL drivers above choke on a non-standard
    server: fetch GetCapabilities directly and print the first few KB so a
    human can eyeball layer <Name> / <FeatureType> tags."""
    params = {"service": "WFS", "request": "GetCapabilities"}
    print(f"\n--- Raw GetCapabilities request to {base_url}")
    resp = requests.get(base_url, params=params, timeout=20)
    resp.raise_for_status()
    print(f"  status={resp.status_code} content-type={resp.headers.get('content-type')}")
    print(resp.text[:4000])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("base_url", help="Candidate WFS/OGC API Features service URL")
    parser.add_argument("--raw", action="store_true", help="Also dump the raw GetCapabilities XML")
    args = parser.parse_args()

    list_layers_via_gdal(args.base_url)
    if args.raw:
        dump_raw_capabilities(args.base_url)

    print(
        "\nNext step: copy the confirmed base_url and the exact layer name you need "
        "into sources.py (wfs_url / layer_hint), then re-run ingest_overijse.py."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
