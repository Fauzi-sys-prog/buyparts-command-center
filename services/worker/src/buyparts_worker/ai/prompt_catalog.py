from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PromptSpec:
    name: str
    objective: str
    output_shape: str


def get_prompt_catalog() -> list[PromptSpec]:
    return [
        PromptSpec(
            name="product-title-enrichment",
            objective="Rewrite raw manufacturer titles into conversion-oriented ecommerce titles.",
            output_shape="title string plus rationale",
        ),
        PromptSpec(
            name="product-description-enrichment",
            objective="Generate clean product descriptions from sparse specs and notes.",
            output_shape="marketing description plus bullet highlights",
        ),
        PromptSpec(
            name="attribute-normalization",
            objective="Map free-form supplier attributes into a structured schema.",
            output_shape="normalized attribute list",
        ),
        PromptSpec(
            name="fitment-summary",
            objective="Summarize vehicle or part compatibility from structured and semi-structured data.",
            output_shape="fitment summary plus confidence notes",
        ),
    ]
