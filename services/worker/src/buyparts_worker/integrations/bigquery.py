from __future__ import annotations

from dataclasses import dataclass

from buyparts_worker.config import WorkerSettings


@dataclass(frozen=True)
class BigQueryReadiness:
    dataset_ref: str
    status: str
    missing: list[str]
    auth_mode: str


def get_bigquery_readiness(settings: WorkerSettings) -> BigQueryReadiness:
    missing: list[str] = []

    if not settings.gcp_project_id:
        missing.append("GCP_PROJECT_ID")

    if not settings.bigquery_dataset:
        missing.append("BIGQUERY_DATASET")

    if not settings.bigquery_location:
        missing.append("BIGQUERY_LOCATION")

    if not settings.bigquery_auth_configured:
        missing.append("BIGQUERY_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS")

    auth_mode = "service-account-json"
    if settings.google_application_credentials:
        auth_mode = "google-application-credentials"
    elif not settings.bigquery_service_account_json:
        auth_mode = "missing"

    status = "configured" if not missing else "needs_manual_setup"

    return BigQueryReadiness(
        dataset_ref=f"{settings.gcp_project_id or '<project>'}.{settings.bigquery_dataset}",
        status=status,
        missing=missing,
        auth_mode=auth_mode,
    )
