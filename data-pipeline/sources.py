"""
Registry of the public data sources this pipeline ingests.

IMPORTANT — read before using this file:
`catalog_url` below is a real, verifiable page (found by the product owner's
own research, not invented here). `wfs_url` is deliberately left as `None`
almost everywhere: this codebase was written in a sandbox with zero general
network egress (confirmed — even wikipedia.org is blocked; only
pypi.org/npmjs.org/github.com are reachable), so the exact OGC service
endpoint behind each catalog page could not be verified by fetching it.

Do not fill in a `wfs_url` from guesswork. Run `discover.py <catalog_url>`
(or open the catalog page yourself and copy the service URL it lists —
usually under a "Toegang"/"Webservice"/"Accès" section) once you have
network access, then paste the confirmed URL here.
"""

from dataclasses import dataclass


@dataclass
class DataSource:
    key: str
    label: str
    region: str  # "flanders" | "brussels" | "wallonia" | "federal"
    catalog_url: str  # verified: a real catalog/landing page
    wfs_url: str | None  # unverified until confirmed via discover.py
    layer_hint: str | None  # a guess at the layer name, ALWAYS re-check with discover.py
    notes: str


SOURCES: list[DataSource] = [
    DataSource(
        key="parcels_cadastre",
        label="Plan parcellaire cadastral (SPF Finances)",
        region="federal",
        catalog_url="https://finances.belgium.be/fr/experts-partenaires/donnees-ouvertes-patrimoine/jeux-donnees/plan-cadastral/webservices",
        wfs_url=None,
        layer_hint=None,
        notes="Parcel boundaries, geometry, address. This is the central table everything else joins to.",
    ),
    DataSource(
        key="parcels_flanders_fiscal",
        label="Percelen fiscaal (Digitaal Vlaanderen, historised)",
        region="flanders",
        catalog_url="https://www.vlaanderen.be/datavindplaats/catalogus/wfs-grb-administratieve-percelen-fiscaal",
        wfs_url=None,
        layer_hint=None,
        notes="Yearly snapshots since 2017 — useful for tracking parcel splits/merges over time, not just current state.",
    ),
    DataSource(
        key="buildings_grb",
        label="GRB — gebouwen (Vlaanderen)",
        region="flanders",
        catalog_url="https://www.vlaanderen.be/datavindplaats/catalogus/wfs-grb",
        wfs_url=None,
        layer_hint=None,
        notes="Building footprints with stable IDs, used to compute site coverage (built area / parcel area).",
    ),
    DataSource(
        key="permits_flanders",
        label="Omgevingsloket — Stedenbouwkundige projecten V2",
        region="flanders",
        catalog_url="https://www.vlaanderen.be/datavindplaats/catalogus/omgevingsloket-stedenbouwkundige-projecten-v2",
        wfs_url=None,
        layer_hint=None,
        notes="The core permit feed for Flanders. Continuously updated per the catalog description. Also offered as GeoPackage / OGC API Features, not just WFS — worth comparing which is easiest to poll incrementally.",
    ),
    DataSource(
        key="zoning_flanders",
        label="DSI — plans d'affectation / règlements urbanistiques",
        region="flanders",
        catalog_url="https://www.vlaanderen.be/datavindplaats/catalogus/dsi-stedenbouwkundige-informatie-natraject-van-ruimtelijke-uitvoeringsplannen-en-stedenbouwkundige-verordeningen",
        wfs_url=None,
        layer_hint=None,
        notes="Spatially join against parcel/building geometry to get a zoning label per site.",
    ),
    DataSource(
        key="heritage_flanders",
        label="Beschermde monumenten (Vlaanderen)",
        region="flanders",
        catalog_url="https://www.vlaanderen.be/datavindplaats/catalogus/beschermde-monumenten",
        wfs_url=None,
        layer_hint=None,
        notes="Protected monuments / heritage zones — feeds the Constraints heritage flag directly.",
    ),
    DataSource(
        key="permits_brussels_nova",
        label="NOVA — PlanningPermits / EnvironmentalPermits (Bruxelles)",
        region="brussels",
        catalog_url="https://openpermits.brussels/fr/about",
        wfs_url=None,
        layer_hint="PlanningPermits",
        notes="Ingest the NOVA WFS layers directly, not by scraping OpenPermits.brussels — OpenPermits itself says it sources from the NOVA webservices.",
    ),
    DataSource(
        key="buildings_brussels_urbis",
        label="UrbIS — Parcelles & Bâtiments (Bruxelles)",
        region="brussels",
        catalog_url="https://urbisdownload.datastore.brussels/UrbIS/TechSpec/Buildings_TechSpec_FR20250708.pdf",
        wfs_url=None,
        layer_hint=None,
        notes="Combines regional building surveys with the federal cadastre parcel layer.",
    ),
    DataSource(
        key="constraints_brussels",
        label="Datastore.brussels — contraintes régionales",
        region="brussels",
        catalog_url="https://datastore.brussels/",
        wfs_url=None,
        layer_hint=None,
        notes="Portal, not a single dataset — browse for flood/heritage/Natura2000 layers specifically.",
    ),
    DataSource(
        key="zoning_wallonia",
        label="Plan de secteur (Wallonie)",
        region="wallonia",
        catalog_url="https://geoportail.wallonie.be/catalogue/7fe2f305-1302-4297-b67e-792f55acd834.html",
        wfs_url=None,
        layer_hint=None,
        notes="Available as OGC API Features too, per the catalog page.",
    ),
    DataSource(
        key="flood_wallonia",
        label="Aléa d'inondation (Wallonie)",
        region="wallonia",
        catalog_url="https://geoportail.wallonie.be/catalogue/68cfc9ff-651a-4757-b792-6bde0e238c2f.html",
        wfs_url=None,
        layer_hint=None,
        notes="Raster-based per the catalog description — the WFS/vector approach used for Flanders/Brussels layers may not apply directly here.",
    ),
    DataSource(
        key="heritage_wallonia",
        label="Patrimoine — biens classés (Wallonie)",
        region="wallonia",
        catalog_url="https://geoportail.wallonie.be/catalogue/7d89256d-3968-4db5-b572-25d1c0b59b44.html",
        wfs_url=None,
        layer_hint=None,
        notes="Exposed as a WMS per the catalog page — WMS gives you a rendered image, not features; you likely want the underlying vector service if one exists, not this WMS directly.",
    ),
    DataSource(
        key="companies_bce",
        label="BCE/KBO — open data entreprises",
        region="federal",
        catalog_url="https://economie.fgov.be/sites/default/files/Files/Entreprises/BCE/Opendata--tableau-comparatif-fin.pdf",
        wfs_url=None,
        layer_hint=None,
        notes="Bulk file download, not a WFS — different ingestion path (scheduled bulk download + diff), used to resolve a permit applicant's company number to a developer identity.",
    ),
]


def get_source(key: str) -> DataSource:
    for s in SOURCES:
        if s.key == key:
            return s
    raise KeyError(f"No such source: {key}. Known keys: {[s.key for s in SOURCES]}")
