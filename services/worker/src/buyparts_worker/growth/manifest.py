from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GrowthExport:
    name: str
    grain: str
    purpose: str


@dataclass(frozen=True)
class GrowthManifest:
    google_ads_exports: list[GrowthExport]
    merchant_center_exports: list[GrowthExport]


def get_growth_manifest() -> GrowthManifest:
    return GrowthManifest(
        google_ads_exports=[
            GrowthExport(
                name="campaign_daily_performance",
                grain="one row per campaign per day",
                purpose="Track spend, clicks, conversions, and top campaign movement.",
            ),
            GrowthExport(
                name="product_group_daily_performance",
                grain="one row per product group per day",
                purpose="Tie shopping performance back to SKU and catalog groupings.",
            ),
            GrowthExport(
                name="search_term_daily_performance",
                grain="one row per search term per day",
                purpose="Surface spend leakage, negative keyword candidates, and SKU opportunity signals.",
            ),
        ],
        merchant_center_exports=[
            GrowthExport(
                name="product_status_diagnostics",
                grain="one row per merchant product status",
                purpose="Track feed disapprovals, warnings, and recoverable issues.",
            ),
            GrowthExport(
                name="feed_quality_summary",
                grain="one row per sync run",
                purpose="Monitor feed freshness, issue counts, and readiness for ad spend scaling.",
            ),
        ],
    )
