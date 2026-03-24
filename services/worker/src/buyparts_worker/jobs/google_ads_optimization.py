from __future__ import annotations

from buyparts_worker.config import WorkerSettings
from buyparts_worker.growth.manifest import get_growth_manifest
from buyparts_worker.integrations.google_ads import get_google_ads_readiness


def run_google_ads_optimization() -> dict[str, str]:
    settings = WorkerSettings.from_env()
    readiness = get_google_ads_readiness(settings)
    manifest = get_growth_manifest()

    if readiness.status != "configured":
        return {
            "job": "google-ads-optimization",
            "status": "needs_manual_setup",
            "next_step": (
                "Configure "
                + ", ".join(readiness.missing)
                + " before enabling Google Ads ingestion and optimization."
            ),
        }

    return {
        "job": "google-ads-optimization",
        "status": "dry-run-ready",
        "next_step": (
            f"Prepare {len(manifest.google_ads_exports)} Google Ads exports for customer "
            f"{readiness.customer_id} under manager {readiness.login_customer_id} "
            f"using {readiness.auth_mode} auth."
        ),
    }
