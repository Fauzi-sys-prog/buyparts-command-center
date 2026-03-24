from __future__ import annotations

from dataclasses import dataclass
import os


def _env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


@dataclass(frozen=True)
class WorkerSettings:
    postgres_url: str
    gcp_project_id: str
    bigquery_dataset: str
    bigquery_location: str
    bigquery_service_account_json: str
    google_application_credentials: str

    @classmethod
    def from_env(cls) -> "WorkerSettings":
        return cls(
            postgres_url=_env("POSTGRES_URL"),
            gcp_project_id=_env("GCP_PROJECT_ID"),
            bigquery_dataset=_env("BIGQUERY_DATASET", "buyparts"),
            bigquery_location=_env("BIGQUERY_LOCATION", "US"),
            bigquery_service_account_json=_env("BIGQUERY_SERVICE_ACCOUNT_JSON"),
            google_application_credentials=_env("GOOGLE_APPLICATION_CREDENTIALS"),
        )

    @property
    def bigquery_auth_configured(self) -> bool:
        return bool(self.bigquery_service_account_json or self.google_application_credentials)

    @property
    def bigquery_ready(self) -> bool:
        return bool(
            self.gcp_project_id
            and self.bigquery_dataset
            and self.bigquery_location
            and self.bigquery_auth_configured
        )
