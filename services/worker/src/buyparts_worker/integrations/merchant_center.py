from __future__ import annotations

from dataclasses import dataclass

from buyparts_worker.config import WorkerSettings


@dataclass(frozen=True)
class MerchantCenterReadiness:
    status: str
    missing: list[str]
    merchant_id: str


def get_merchant_center_readiness(settings: WorkerSettings) -> MerchantCenterReadiness:
    missing: list[str] = []

    if not settings.google_merchant_id:
        missing.append("GOOGLE_MERCHANT_ID")

    if not settings.google_auth_configured:
        missing.append("GOOGLE_APPLICATION_CREDENTIALS or BIGQUERY_SERVICE_ACCOUNT_JSON")

    status = "configured" if not missing else "needs_manual_setup"

    return MerchantCenterReadiness(
        status=status,
        missing=missing,
        merchant_id=settings.google_merchant_id or "<merchant-id>",
    )
