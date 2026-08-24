-- The "truth test" query: rank every residentially-zoned parcel in a
-- commune by apparent densification potential. This is deliberately crude
-- (no comparables, no planning-confidence weighting — that's the app's
-- scoring engine, which needs the full parcel_sheet.sql join per parcel to
-- run) — it exists to answer one question fast: does the underlying data,
-- once joined, actually surface parcels a human would recognise as
-- plausible opportunities? If the top 20 look wrong, no amount of scoring
-- sophistication downstream will fix it.
--
-- Usage: psql landio -f top_opportunities.sql -v municipality_id="'31056'"  -- Overijse's NIS code

WITH coverage AS (
  SELECT
    p.id AS parcel_id,
    p.area_m2,
    COALESCE(SUM(ST_Area(ST_Intersection(b.geom, p.geom))), 0) AS built_area_m2
  FROM parcel p
  LEFT JOIN building b ON ST_Intersects(b.geom, p.geom)
  WHERE p.municipality_id = :municipality_id
  GROUP BY p.id, p.area_m2
),
zoned AS (
  SELECT c.*, z.label AS zoning
  FROM coverage c
  JOIN zoning z ON ST_Intersects(z.geom, (SELECT geom FROM parcel WHERE id = c.parcel_id))
  WHERE z.label ILIKE '%residential%'
)
SELECT
  parcel_id,
  area_m2,
  built_area_m2,
  round((built_area_m2 / NULLIF(area_m2, 0) * 100)::numeric, 1) AS coverage_pct,
  zoning
FROM zoned
WHERE area_m2 >= 800          -- below this, multi-unit development is rarely viable — tune once real economics are known
ORDER BY (built_area_m2 / NULLIF(area_m2, 0)) ASC  -- lowest coverage first = most apparently underused
LIMIT 20;
