from __future__ import annotations

from buyparts_worker.ai.prompt_catalog import get_prompt_catalog
from buyparts_worker.config import WorkerSettings
from buyparts_worker.integrations.llm_provider import get_llm_readiness


def run_catalog_enrichment() -> dict[str, str]:
    settings = WorkerSettings.from_env()
    readiness = get_llm_readiness(settings)
    prompts = get_prompt_catalog()

    if readiness.status != "configured":
        return {
            "job": "catalog-enrichment",
            "status": "needs_manual_setup",
            "next_step": (
                "Configure "
                + ", ".join(readiness.missing)
                + " before enabling LLM-powered catalog enrichment."
            ),
        }

    return {
        "job": "catalog-enrichment",
        "status": "dry-run-ready",
        "next_step": (
            f"Prepare {len(prompts)} enrichment prompt families using provider "
            f"{readiness.provider} for reviewed catalog updates."
        ),
    }
