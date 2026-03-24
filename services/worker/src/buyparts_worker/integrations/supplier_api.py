from __future__ import annotations

from dataclasses import dataclass

from buyparts_worker.config import WorkerSettings


@dataclass(frozen=True)
class SupplierApiReadiness:
    status: str
    missing: list[str]
    base_url: str


def get_supplier_api_readiness(settings: WorkerSettings) -> SupplierApiReadiness:
    missing: list[str] = []

    if not settings.supplier_api_base_url:
        missing.append("SUPPLIER_API_BASE_URL")

    if not settings.supplier_api_key:
        missing.append("SUPPLIER_API_KEY")

    return SupplierApiReadiness(
        status="configured" if not missing else "needs_manual_setup",
        missing=missing,
        base_url=settings.supplier_api_base_url or "<supplier-base-url>",
    )
