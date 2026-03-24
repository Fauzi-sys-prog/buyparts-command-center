from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RetrievalSource:
    name: str
    content_type: str
    purpose: str


def get_retrieval_sources() -> list[RetrievalSource]:
    return [
        RetrievalSource(
            name="manufacturer-spec-sheets",
            content_type="pdf / tabular specs",
            purpose="Ground product titles, descriptions, and normalized attributes.",
        ),
        RetrievalSource(
            name="supplier-fitment-notes",
            content_type="structured notes",
            purpose="Support compatibility-aware enrichment and search.",
        ),
        RetrievalSource(
            name="catalog-history",
            content_type="approved product revisions",
            purpose="Reuse proven copy and attribute decisions in future runs.",
        ),
        RetrievalSource(
            name="operator-playbooks",
            content_type="internal markdown or docs",
            purpose="Give agents business-specific guardrails for enrichment and approvals.",
        ),
    ]
