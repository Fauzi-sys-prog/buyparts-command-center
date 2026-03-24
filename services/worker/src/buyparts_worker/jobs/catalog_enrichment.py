from __future__ import annotations

from buyparts_worker.ai.prompt_catalog import get_prompt_catalog
from buyparts_worker.config import WorkerSettings
from buyparts_worker.db.client import db_connection
from buyparts_worker.db.repositories.catalog import CatalogRepository
from buyparts_worker.integrations.llm_provider import get_llm_readiness


def run_catalog_enrichment() -> dict[str, str]:
    settings = WorkerSettings.from_env()
    readiness = get_llm_readiness(settings)
    prompts = get_prompt_catalog()

    if not settings.postgres_url:
        return {
            "job": "catalog-enrichment",
            "status": "needs_manual_setup",
            "next_step": "Configure POSTGRES_URL before queuing catalog enrichment runs.",
        }

    with db_connection(settings) as connection:
        repository = CatalogRepository(connection)
        candidate = repository.get_catalog_candidate()

        if candidate is None:
            return {
                "job": "catalog-enrichment",
                "status": "waiting_for_source_data",
                "next_step": "Sync Shopify products first so enrichment has catalog candidates.",
            }

        if readiness.status != "configured":
            run_id = repository.create_catalog_enrichment_run(
                candidate=candidate,
                provider=settings.llm_provider or None,
                prompt_version="catalog-v1-dry-run",
                status="pending_provider_config",
                input_payload={
                    "product_title": candidate.title,
                    "vendor": candidate.vendor,
                    "product_type": candidate.product_type,
                    "tags": candidate.tags,
                    "prompt_families": [prompt.name for prompt in prompts],
                },
                output_payload=None,
                error_message="LLM provider credentials are not configured yet.",
            )
            connection.commit()

            return {
                "job": "catalog-enrichment",
                "status": "queued_waiting_for_provider",
                "next_step": (
                    f"Queued enrichment run {run_id} for product {candidate.external_product_id}. "
                    "Add LLM_PROVIDER and LLM_API_KEY to continue with live generation."
                ),
            }

        run_id = repository.create_catalog_enrichment_run(
            candidate=candidate,
            provider=settings.llm_provider,
            prompt_version="catalog-v1-dry-run",
            status="planned",
            input_payload={
                "product_title": candidate.title,
                "vendor": candidate.vendor,
                "product_type": candidate.product_type,
                "tags": candidate.tags,
                "prompt_families": [prompt.name for prompt in prompts],
            },
            output_payload={
                "status": "dry_run_only",
                "planned_prompts": [prompt.name for prompt in prompts],
            },
        )
        connection.commit()

    return {
        "job": "catalog-enrichment",
        "status": "persisted_dry_run",
        "next_step": (
            f"Stored enrichment plan {run_id} with {len(prompts)} prompt families "
            f"using provider {readiness.provider}."
        ),
    }
