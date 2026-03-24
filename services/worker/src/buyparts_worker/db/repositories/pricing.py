from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Any

import psycopg
from psycopg.types.json import Jsonb


@dataclass(frozen=True)
class PricingCandidate:
    external_variant_id: str
    sku: str | None
    current_price: Decimal | None
    variant_title: str
    product_title: str


class PricingRepository:
    def __init__(self, connection: psycopg.Connection):
        self.connection = connection

    def get_pricing_candidate(self) -> PricingCandidate | None:
        row = self.connection.execute(
            """
            SELECT
              v.external_variant_id,
              v.sku,
              v.price,
              v.title AS variant_title,
              p.title AS product_title
            FROM variants v
            JOIN products p ON p.id = v.product_id
            ORDER BY v.synced_at DESC, v.created_at DESC
            LIMIT 1
            """
        ).fetchone()

        if row is None:
            return None

        return PricingCandidate(
            external_variant_id=row["external_variant_id"],
            sku=row["sku"],
            current_price=row["price"],
            variant_title=row["variant_title"],
            product_title=row["product_title"],
        )

    def create_pricing_recommendation(
        self,
        *,
        candidate: PricingCandidate,
        recommended_price: Decimal,
        confidence_score: Decimal,
        reasons: list[str],
        status: str = "pending",
    ) -> str:
        row = self.connection.execute(
            """
            INSERT INTO pricing_recommendations (
              external_variant_id,
              sku,
              current_price,
              recommended_price,
              confidence_score,
              status,
              reasons
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                candidate.external_variant_id,
                candidate.sku,
                candidate.current_price,
                recommended_price,
                confidence_score,
                status,
                Jsonb(reasons),
            ),
        ).fetchone()

        return row["id"]


def build_placeholder_recommendation(candidate: PricingCandidate) -> tuple[Decimal, Decimal, list[str]]:
    if candidate.current_price is None or candidate.current_price <= 0:
        raise ValueError("Candidate is missing a usable current price.")

    recommended_price = (candidate.current_price * Decimal("1.05")).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )
    confidence_score = Decimal("62.50")
    reasons = [
        "Dry-run recommendation seeded from the current synced Shopify price.",
        "Applies a placeholder 5% uplift until pricing rules and margin guardrails are fully implemented.",
        f"Candidate SKU: {candidate.sku or candidate.external_variant_id}.",
    ]
    return recommended_price, confidence_score, reasons
