from __future__ import annotations

from buyparts_worker.config import WorkerSettings
from buyparts_worker.integrations.bigquery import get_bigquery_readiness
from buyparts_worker.warehouse.manifest import get_warehouse_manifest


def run_bigquery_sync() -> dict[str, str]:
    settings = WorkerSettings.from_env()
    readiness = get_bigquery_readiness(settings)
    manifest = get_warehouse_manifest(settings.bigquery_dataset, settings.bigquery_location)

    if readiness.status != "configured":
        return {
            "job": "bigquery-sync",
            "status": "needs_manual_setup",
            "next_step": (
                "Configure "
                + ", ".join(readiness.missing)
                + " before enabling live BigQuery exports."
            ),
        }

    return {
        "job": "bigquery-sync",
        "status": "dry-run-ready",
        "next_step": (
            f"Plan exports into {readiness.dataset_ref} ({manifest.location}) "
            f"covering {len(manifest.tables)} warehouse tables."
        ),
    }
