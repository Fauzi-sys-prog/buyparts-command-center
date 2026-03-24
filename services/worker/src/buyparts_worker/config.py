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
    google_ads_developer_token: str
    google_ads_customer_id: str
    google_ads_login_customer_id: str
    google_ads_client_id: str
    google_ads_client_secret: str
    google_ads_refresh_token: str
    google_merchant_id: str

    @classmethod
    def from_env(cls) -> "WorkerSettings":
        return cls(
            postgres_url=_env("POSTGRES_URL"),
            gcp_project_id=_env("GCP_PROJECT_ID"),
            bigquery_dataset=_env("BIGQUERY_DATASET", "buyparts"),
            bigquery_location=_env("BIGQUERY_LOCATION", "US"),
            bigquery_service_account_json=_env("BIGQUERY_SERVICE_ACCOUNT_JSON"),
            google_application_credentials=_env("GOOGLE_APPLICATION_CREDENTIALS"),
            google_ads_developer_token=_env("GOOGLE_ADS_DEVELOPER_TOKEN"),
            google_ads_customer_id=_env("GOOGLE_ADS_CUSTOMER_ID"),
            google_ads_login_customer_id=_env("GOOGLE_ADS_LOGIN_CUSTOMER_ID"),
            google_ads_client_id=_env("GOOGLE_ADS_CLIENT_ID"),
            google_ads_client_secret=_env("GOOGLE_ADS_CLIENT_SECRET"),
            google_ads_refresh_token=_env("GOOGLE_ADS_REFRESH_TOKEN"),
            google_merchant_id=_env("GOOGLE_MERCHANT_ID"),
        )

    @property
    def google_auth_configured(self) -> bool:
        return bool(self.bigquery_service_account_json or self.google_application_credentials)

    @property
    def bigquery_auth_configured(self) -> bool:
        return self.google_auth_configured

    @property
    def bigquery_ready(self) -> bool:
        return bool(
            self.gcp_project_id
            and self.bigquery_dataset
            and self.bigquery_location
            and self.bigquery_auth_configured
        )
