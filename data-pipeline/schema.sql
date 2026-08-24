-- PostGIS schema for the Planning Graph.
-- Run once against a PostgreSQL 15+ / PostGIS 3.3+ database:
--   createdb landio && psql landio -c "CREATE EXTENSION postgis;" && psql landio -f schema.sql

CREATE TABLE municipality (
  id              TEXT PRIMARY KEY,       -- NIS/INS code, e.g. "31056" for Overijse
  name            TEXT NOT NULL,
  region          TEXT NOT NULL CHECK (region IN ('flanders', 'brussels', 'wallonia')),
  geom            GEOMETRY(MultiPolygon, 31370)  -- Lambert 72, the shared Belgian projection
);

CREATE TABLE parcel (
  id                TEXT PRIMARY KEY,     -- capakey or equivalent stable identifier
  municipality_id   TEXT REFERENCES municipality(id),
  geom              GEOMETRY(MultiPolygon, 31370) NOT NULL,
  area_m2           DOUBLE PRECISION NOT NULL,
  source            TEXT NOT NULL,        -- which DataSource.key in sources.py this came from
  source_updated_at TIMESTAMPTZ,
  ingested_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX parcel_geom_idx ON parcel USING GIST (geom);
CREATE INDEX parcel_municipality_idx ON parcel (municipality_id);

CREATE TABLE building (
  id                TEXT PRIMARY KEY,
  parcel_id         TEXT REFERENCES parcel(id),  -- resolved via ST_Intersects at load time, nullable until resolved
  geom              GEOMETRY(MultiPolygon, 31370) NOT NULL,
  footprint_m2      DOUBLE PRECISION NOT NULL,
  source            TEXT NOT NULL,
  source_updated_at TIMESTAMPTZ,
  ingested_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX building_geom_idx ON building USING GIST (geom);
CREATE INDEX building_parcel_idx ON building (parcel_id);

CREATE TABLE zoning (
  id       TEXT PRIMARY KEY,
  label    TEXT NOT NULL,     -- e.g. "residential", "mixed-use" — normalise from the source's own code list
  geom     GEOMETRY(MultiPolygon, 31370) NOT NULL,
  source   TEXT NOT NULL
);
CREATE INDEX zoning_geom_idx ON zoning USING GIST (geom);

CREATE TABLE constraint_layer (
  id       TEXT PRIMARY KEY,
  kind     TEXT NOT NULL CHECK (kind IN ('flood', 'heritage_monument', 'heritage_zone', 'natura2000', 'other')),
  severity TEXT,              -- source-specific, e.g. flood risk class
  geom     GEOMETRY(MultiPolygon, 31370) NOT NULL,
  source   TEXT NOT NULL
);
CREATE INDEX constraint_geom_idx ON constraint_layer USING GIST (geom);

CREATE TABLE company (
  id            TEXT PRIMARY KEY,  -- BCE/KBO number
  name          TEXT NOT NULL,
  legal_form    TEXT,
  source        TEXT NOT NULL DEFAULT 'companies_bce'
);

CREATE TABLE permit (
  id                    TEXT PRIMARY KEY,
  parcel_id             TEXT REFERENCES parcel(id),
  municipality_id       TEXT REFERENCES municipality(id),
  geom                  GEOMETRY(Point, 31370),
  address               TEXT,
  application_date      DATE,
  current_status        TEXT NOT NULL,   -- normalise source-specific status strings to a shared vocabulary at load time
  status_date           DATE,
  project_type          TEXT,            -- e.g. "multifamily_residential" — see project_type_extraction note below
  description           TEXT,            -- raw text from the source, kept verbatim
  applicant_name         TEXT,
  applicant_company_id  TEXT REFERENCES company(id),
  authority              TEXT,
  units                  INTEGER,        -- extracted, nullable until the extraction step has run
  demolition             BOOLEAN,
  source                 TEXT NOT NULL,
  source_url             TEXT,
  ingested_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX permit_geom_idx ON permit USING GIST (geom);
CREATE INDEX permit_parcel_idx ON permit (parcel_id);
CREATE INDEX permit_municipality_idx ON permit (municipality_id);
CREATE INDEX permit_status_idx ON permit (current_status);

-- Daily snapshots turn "current status" into a real history. Insert a row
-- here whenever a scheduled re-ingest finds permit.current_status changed
-- from the previous run's row_hash — see ingest_overijse.py's row_hash().
CREATE TABLE permit_event (
  id          BIGSERIAL PRIMARY KEY,
  permit_id   TEXT NOT NULL REFERENCES permit(id),
  event_date  DATE NOT NULL,
  old_status  TEXT,
  new_status  TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX permit_event_permit_idx ON permit_event (permit_id);

-- project_type is free text on the source ("Démolition d'une habitation
-- unifamiliale et construction d'un immeuble de 23 logements...") until an
-- extraction step (an LLM call, per the product owner's plan) fills in
-- `units` / `project_type` / `demolition` above from `description`. Track
-- that provenance explicitly rather than conflating extracted fields with
-- fields the source itself provided structured.
CREATE TABLE permit_extraction (
  permit_id     TEXT PRIMARY KEY REFERENCES permit(id),
  model         TEXT NOT NULL,
  extracted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_response  JSONB NOT NULL
);
