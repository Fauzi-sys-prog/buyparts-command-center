from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import psycopg
from psycopg.types.json import Jsonb


@dataclass(frozen=True)
class CatalogCandidate:
    external_product_id: str
    title: str
    vendor: str | None
    product_type: str | None
    tags: list[str]


class CatalogRepository:
    def __init__(self, connection: psycopg.Connection):
        self.connection = connection

    def get_catalog_candidate(self) -> CatalogCandidate | None:
        row = self.connection.execute(
            """
            SELECT external_product_id, title, vendor, product_type, tags
            FROM products
            ORDER BY synced_at DESC, created_at DESC
            LIMIT 1
            """
        ).fetchone()

        if row is None:
            return None

        return CatalogCandidate(
            external_product_id=row["external_product_id"],
            title=row["title"],
            vendor=row["vendor"],
            product_type=row["product_type"],
            tags=list(row["tags"] or []),
        )

    def create_catalog_enrichment_run(
        self,
        *,
        candidate: CatalogCandidate,
        provider: str | None,
        prompt_version: str,
        status: str,
        input_payload: dict[str, Any],
        output_payload: dict[str, Any] | None = None,
        error_message: str | None = None,
    ) -> str:
        row = self.connection.execute(
            """
            INSERT INTO catalog_enrichment_runs (
              external_product_id,
              status,
              provider,
              prompt_version,
              input_payload,
              output_payload,
              error_message,
              completed_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, CASE WHEN %s = 'completed' THEN NOW() ELSE NULL END)
            RETURNING id
            """,
            (
                candidate.external_product_id,
                status,
                provider,
                prompt_version,
                Jsonb(input_payload),
                Jsonb(output_payload) if output_payload is not None else None,
                error_message,
                status,
            ),
        ).fetchone()

        return row["id"]
