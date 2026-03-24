from __future__ import annotations

from buyparts_worker.config import WorkerSettings
from buyparts_worker.integrations.rag_runtime import get_rag_readiness
from buyparts_worker.retrieval.manifest import get_retrieval_sources


def run_rag_indexing() -> dict[str, str]:
    settings = WorkerSettings.from_env()
    readiness = get_rag_readiness(settings)
    sources = get_retrieval_sources()

    if readiness.status != "configured":
        return {
            "job": "rag-indexing",
            "status": "needs_manual_setup",
            "next_step": (
                "Configure "
                + ", ".join(readiness.missing)
                + " before enabling retrieval indexing."
            ),
        }

    return {
        "job": "rag-indexing",
        "status": "dry-run-ready",
        "next_step": (
            f"Prepare {len(sources)} retrieval sources for collection "
            f"{readiness.collection_name} on {readiness.vector_store}."
        ),
    }
