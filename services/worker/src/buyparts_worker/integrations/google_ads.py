from __future__ import annotations

from dataclasses import dataclass

from buyparts_worker.config import WorkerSettings


@dataclass(frozen=True)
class GoogleAdsReadiness:
    status: str
    missing: list[str]
    auth_mode: str
    customer_id: str
    login_customer_id: str


def get_google_ads_readiness(settings: WorkerSettings) -> GoogleAdsReadiness:
    oauth_configured = bool(
        settings.google_ads_client_id
        and settings.google_ads_client_secret
        and settings.google_ads_refresh_token
    )
    service_account_configured = settings.google_auth_configured
    auth_mode = "missing"

    if oauth_configured:
        auth_mode = "oauth-refresh-token"
    elif service_account_configured:
        auth_mode = "service-account"

    missing: list[str] = []

    if not settings.google_ads_developer_token:
        missing.append("GOOGLE_ADS_DEVELOPER_TOKEN")

    if not settings.google_ads_customer_id:
        missing.append("GOOGLE_ADS_CUSTOMER_ID")

    if not settings.google_ads_login_customer_id:
        missing.append("GOOGLE_ADS_LOGIN_CUSTOMER_ID")

    if not oauth_configured and not service_account_configured:
        missing.append(
            "GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_ADS_CLIENT_ID/GOOGLE_ADS_CLIENT_SECRET/GOOGLE_ADS_REFRESH_TOKEN"
        )

    status = "configured" if not missing else "needs_manual_setup"

    return GoogleAdsReadiness(
        status=status,
        missing=missing,
        auth_mode=auth_mode,
        customer_id=settings.google_ads_customer_id or "<customer-id>",
        login_customer_id=settings.google_ads_login_customer_id or "<manager-id>",
    )
