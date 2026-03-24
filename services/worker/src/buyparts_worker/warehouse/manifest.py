from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class WarehouseTable:
    name: str
    grain: str
    source: str
    purpose: str


@dataclass(frozen=True)
class WarehouseManifest:
    dataset: str
    location: str
    tables: list[WarehouseTable]


def get_warehouse_manifest(dataset: str, location: str) -> WarehouseManifest:
    return WarehouseManifest(
        dataset=dataset,
        location=location,
        tables=[
            WarehouseTable(
                name="dim_products",
                grain="one row per Shopify product",
                source="products",
                purpose="Product-level catalog analysis and enrichment rollups.",
            ),
            WarehouseTable(
                name="dim_variants",
                grain="one row per SKU / variant",
                source="variants",
                purpose="SKU-level profitability, inventory, and channel joins.",
            ),
            WarehouseTable(
                name="fact_orders",
                grain="one row per order",
                source="orders",
                purpose="Order-level revenue and status analytics.",
            ),
            WarehouseTable(
                name="fact_order_lines",
                grain="one row per order line",
                source="order_lines",
                purpose="SKU sales velocity and contribution tracking.",
            ),
            WarehouseTable(
                name="fact_inventory_snapshots",
                grain="one row per variant snapshot",
                source="inventory_snapshots",
                purpose="Stock trend analysis and coverage modeling.",
            ),
            WarehouseTable(
                name="fact_pricing_recommendations",
                grain="one row per recommendation event",
                source="pricing_recommendations",
                purpose="Pricing engine audit trail and acceptance analysis.",
            ),
            WarehouseTable(
                name="fact_catalog_enrichment_runs",
                grain="one row per enrichment run",
                source="catalog_enrichment_runs",
                purpose="LLM output quality, throughput, and review tracking.",
            ),
            WarehouseTable(
                name="fact_google_ads_sku_daily",
                grain="one row per sku per day",
                source="google_ads + sku mapping",
                purpose="Spend-to-margin joins once Google Ads is connected.",
            ),
        ],
    )
