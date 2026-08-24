# Data pipeline (real data — not started, scaffolded)

Scaffolding for phase 2 of the project: replacing the mocked opportunities
in `src/data/` with real Belgian parcels, buildings, permits, zoning, and
constraints, feeding the same scoring engine documented in
`../docs/scoring-methodology.md`.

## Status: written blind, not yet run

This code was written in a Claude Code session with **zero general network
egress** — confirmed by testing WebFetch and curl against wikipedia.org,
google.com, and every Belgian government domain in `sources.py`; all
blocked with `EGRESS_BLOCKED` / a 403 from the proxy. Only `pypi.org`,
`npmjs.org`, and `github.com` are reachable from that sandbox, which is
enough to install and import `geopandas`/`pyogrio`/`requests` and confirm
the code is syntactically sound and structurally correct (GDAL's WFS/OAPIF
drivers are available and importable), but **not** to hit a single real
government endpoint or confirm a single real URL.

Every `wfs_url` in `sources.py` is therefore `None`. Nothing will run
until you fill those in from a session/machine with real internet access.

## How to actually start

1. **Get network access.** Either run this on your own machine, or open a
   new Claude Code session in an environment configured with broader
   network access (an already-running session's network policy is fixed
   at container start — changing the environment's settings does not
   retroactively open up a session that's already running).
2. **Install dependencies:**
   ```bash
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. **Discover the real service URL for one source.** Open the `catalog_url`
   for e.g. `permits_flanders` in `sources.py`, find the WFS/OGC API
   Features link on that page (usually under "Toegang"/"Webservice"), then:
   ```bash
   python discover.py https://<the-url-you-found>
   ```
   This lists the actual layers available. Copy the confirmed base URL and
   layer name into `sources.py`.
4. **Repeat step 3 for each source** you need for the first real test
   (parcels, buildings, permits, zoning, heritage — the five listed in
   `ingest_overijse.py`'s `DATASET_KEYS_FOR_ONE_COMMUNE`).
5. **Run the first real pull:**
   ```bash
   python ingest_overijse.py
   ```
   This writes raw, untouched GeoJSON under `raw/<source>/<date>/` — check
   `meta.json` next to each file for the feature count and a content hash.
6. **Load into PostGIS** (`schema.sql`) and run `queries/top_opportunities.sql`
   for Overijse's NIS code. This is the truth test from the product
   discussion: if the top 20 don't look like real opportunities to someone
   who knows Overijse, the scoring engine downstream won't save it —
   fix the data layer first.

## What's deliberately not here yet

- **Loading `raw/*.geojson` into PostGIS.** `schema.sql` defines the
  tables; writing them is mechanical (`ogr2ogr` or `GeoDataFrame.to_postgis`)
  but pointless to write against a schema that hasn't been validated
  against one real payload yet.
- **Owner/BCE resolution, transaction data, Wallonia permits.** Explicitly
  phase 2+ per `docs/scoring-methodology.md`'s limitations section.
- **Scheduled re-ingestion / diffing.** `ingest_overijse.py` already hashes
  each pull (see `row_hash()`) so a future scheduler can detect "nothing
  changed" cheaply — but there's no scheduler here, just the one-shot script.
