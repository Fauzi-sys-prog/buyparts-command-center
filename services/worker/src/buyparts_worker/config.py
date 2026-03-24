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
    supplier_api_base_url: str
    supplier_api_key: str
    llm_provider: str
    llm_api_key: str
    embedding_provider: str
    embedding_api_key: str
    vector_store_provider: str
    vector_store_url: str
    vector_store_api_key: str
    rag_collection_name: str
    langchain_tracing_v2: str
    langchain_api_key: str

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
            supplier_api_base_url=_env("SUPPLIER_API_BASE_URL"),
            supplier_api_key=_env("SUPPLIER_API_KEY"),
            llm_provider=_env("LLM_PROVIDER"),
            llm_api_key=_env("LLM_API_KEY"),
            embedding_provider=_env("EMBEDDING_PROVIDER"),
            embedding_api_key=_env("EMBEDDING_API_KEY"),
            vector_store_provider=_env("VECTOR_STORE_PROVIDER"),
            vector_store_url=_env("VECTOR_STORE_URL"),
            vector_store_api_key=_env("VECTOR_STORE_API_KEY"),
            rag_collection_name=_env("RAG_COLLECTION_NAME", "buyparts-catalog"),
            langchain_tracing_v2=_env("LANGCHAIN_TRACING_V2"),
            langchain_api_key=_env("LANGCHAIN_API_KEY"),
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

    @property
    def llm_ready(self) -> bool:
        return bool(self.llm_provider and self.llm_api_key)

    @property
    def rag_ready(self) -> bool:
        return bool(
            self.embedding_provider
            and self.embedding_api_key
            and self.vector_store_provider
            and self.vector_store_url
            and self.vector_store_api_key
            and self.rag_collection_name
        )
