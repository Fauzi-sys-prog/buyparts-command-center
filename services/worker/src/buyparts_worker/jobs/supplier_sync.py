from __future__ import annotations

from buyparts_worker.config import WorkerSettings
from buyparts_worker.integrations.supplier_api import get_supplier_api_readiness
from buyparts_worker.suppliers.manifest import get_supplier_adapters


def run_supplier_sync() -> dict[str, str]:
    settings = WorkerSettings.from_env()
    readiness = get_supplier_api_readiness(settings)
    adapters = get_supplier_adapters()

    if readiness.status != "configured":
        return {
            "job": "supplier-sync",
            "status": "needs_manual_setup",
            "next_step": (
                "Configure "
                + ", ".join(readiness.missing)
                + " before enabling supplier ingestion adapters."
            ),
        }

    return {
        "job": "supplier-sync",
        "status": "dry-run-ready",
        "next_step": (
            f"Prepare {len(adapters)} supplier adapters against {readiness.base_url} "
            "for catalog, pricing, and availability normalization."
        ),
    }
