-- The "fiche parcelle" join: for one parcel, everything the Opportunity
-- Score engine (src/lib/opportunityScoring.ts in the main app) needs as
-- input. This is the query no public source hands you directly — it's
-- built by joining geometry across five tables.
--
-- Usage: psql landio -f parcel_sheet.sql -v parcel_id="'BE_12345'"

WITH target AS (
  SELECT * FROM parcel WHERE id = :parcel_id
),
coverage AS (
  SELECT
    COALESCE(SUM(ST_Area(ST_Intersection(b.geom, t.geom))), 0) AS built_area_m2
  FROM target t
  LEFT JOIN building b ON ST_Intersects(b.geom, t.geom)
),
site_zoning AS (
  SELECT z.label
  FROM target t
  JOIN zoning z ON ST_Intersects(z.geom, t.geom)
  ORDER BY ST_Area(ST_Intersection(z.geom, t.geom)) DESC  -- the zoning that covers the most of the parcel wins if it straddles two
  LIMIT 1
),
site_constraints AS (
  SELECT
    bool_or(kind = 'flood') AS has_flood,
    max(severity) FILTER (WHERE kind = 'flood') AS flood_severity,
    bool_or(kind IN ('heritage_monument', 'heritage_zone')) AS has_heritage,
    bool_or(kind = 'natura2000') AS has_natura2000
  FROM target t
  JOIN constraint_layer c ON ST_Intersects(c.geom, t.geom)
),
-- Comparable permits: same project family, within 500m, most recent first.
-- Distance-weighting matching the app's scoring engine (halflife 250m)
-- happens in the application layer, not here — this returns the raw set.
comparables AS (
  SELECT
    p.id, p.current_status, p.units, p.application_date,
    ST_Distance(p.geom, (SELECT ST_Centroid(geom) FROM target)) AS distance_m
  FROM target t, permit p
  WHERE p.project_type = 'multifamily_residential'
    AND ST_DWithin(p.geom, ST_Centroid(t.geom), 500)
  ORDER BY distance_m ASC
)
SELECT
  t.id                                        AS parcel_id,
  t.area_m2                                   AS site_area_m2,
  cov.built_area_m2,
  round((cov.built_area_m2 / NULLIF(t.area_m2, 0) * 100)::numeric, 1) AS coverage_pct,
  sz.label                                    AS zoning,
  sc.has_flood, sc.flood_severity, sc.has_heritage, sc.has_natura2000,
  (SELECT count(*) FROM comparables)          AS comparables_total,
  (SELECT count(*) FROM comparables WHERE current_status = 'approved') AS comparables_approved,
  (SELECT count(*) FROM comparables WHERE current_status = 'refused')  AS comparables_refused,
  (SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY units) FROM comparables) AS median_comparable_units
FROM target t
CROSS JOIN coverage cov
LEFT JOIN site_zoning sz ON true
LEFT JOIN site_constraints sc ON true;
