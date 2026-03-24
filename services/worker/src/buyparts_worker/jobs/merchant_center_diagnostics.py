from __future__ import annotations

from buyparts_worker.config import WorkerSettings
from buyparts_worker.growth.manifest import get_growth_manifest
from buyparts_worker.integrations.merchant_center import get_merchant_center_readiness


def run_merchant_center_diagnostics() -> dict[str, str]:
    settings = WorkerSettings.from_env()
    readiness = get_merchant_center_readiness(settings)
    manifest = get_growth_manifest()

    if readiness.status != "configured":
        return {
            "job": "merchant-center-diagnostics",
            "status": "needs_manual_setup",
            "next_step": (
                "Configure "
                + ", ".join(readiness.missing)
                + " before enabling Merchant Center diagnostics."
            ),
        }

    return {
        "job": "merchant-center-diagnostics",
        "status": "dry-run-ready",
        "next_step": (
            f"Prepare {len(manifest.merchant_center_exports)} Merchant Center diagnostic exports "
            f"for merchant {readiness.merchant_id}."
        ),
    }
