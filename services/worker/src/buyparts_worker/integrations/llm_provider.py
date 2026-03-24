from __future__ import annotations

from dataclasses import dataclass

from buyparts_worker.config import WorkerSettings


@dataclass(frozen=True)
class LlmReadiness:
    status: str
    missing: list[str]
    provider: str


def get_llm_readiness(settings: WorkerSettings) -> LlmReadiness:
    missing: list[str] = []

    if not settings.llm_provider:
        missing.append("LLM_PROVIDER")

    if not settings.llm_api_key:
        missing.append("LLM_API_KEY")

    return LlmReadiness(
        status="configured" if not missing else "needs_manual_setup",
        missing=missing,
        provider=settings.llm_provider or "<llm-provider>",
    )
