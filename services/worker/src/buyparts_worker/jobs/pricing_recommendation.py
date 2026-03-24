from __future__ import annotations

from buyparts_worker.config import WorkerSettings
from buyparts_worker.db.client import db_connection
from buyparts_worker.db.repositories.pricing import (
    PricingRepository,
    build_placeholder_recommendation,
)


def run_pricing_recommendation() -> dict[str, str]:
    settings = WorkerSettings.from_env()

    if not settings.postgres_url:
        return {
            "job": "pricing-recommendation",
            "status": "needs_manual_setup",
            "next_step": "Configure POSTGRES_URL before persisting pricing recommendations.",
        }

    with db_connection(settings) as connection:
        repository = PricingRepository(connection)
        candidate = repository.get_pricing_candidate()

        if candidate is None:
            return {
                "job": "pricing-recommendation",
                "status": "waiting_for_source_data",
                "next_step": "Sync Shopify variants first so the pricing engine has SKU candidates.",
            }

        try:
            recommended_price, confidence_score, reasons = build_placeholder_recommendation(candidate)
        except ValueError as error:
            return {
                "job": "pricing-recommendation",
                "status": "waiting_for_source_data",
                "next_step": str(error),
            }

        recommendation_id = repository.create_pricing_recommendation(
            candidate=candidate,
            recommended_price=recommended_price,
            confidence_score=confidence_score,
            reasons=reasons,
        )
        connection.commit()

    return {
        "job": "pricing-recommendation",
        "status": "persisted_dry_run",
        "next_step": (
            f"Stored recommendation {recommendation_id} for "
            f"{candidate.sku or candidate.external_variant_id} at {recommended_price}."
        ),
    }
