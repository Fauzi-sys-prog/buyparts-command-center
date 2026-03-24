from __future__ import annotations

from dataclasses import dataclass

from buyparts_worker.config import WorkerSettings


@dataclass(frozen=True)
class RagReadiness:
    status: str
    missing: list[str]
    collection_name: str
    vector_store: str


def get_rag_readiness(settings: WorkerSettings) -> RagReadiness:
    missing: list[str] = []

    if not settings.embedding_provider:
        missing.append("EMBEDDING_PROVIDER")

    if not settings.embedding_api_key:
        missing.append("EMBEDDING_API_KEY")

    if not settings.vector_store_provider:
        missing.append("VECTOR_STORE_PROVIDER")

    if not settings.vector_store_url:
        missing.append("VECTOR_STORE_URL")

    if not settings.vector_store_api_key:
        missing.append("VECTOR_STORE_API_KEY")

    if not settings.rag_collection_name:
        missing.append("RAG_COLLECTION_NAME")

    return RagReadiness(
        status="configured" if not missing else "needs_manual_setup",
        missing=missing,
        collection_name=settings.rag_collection_name or "<rag-collection>",
        vector_store=settings.vector_store_provider or "<vector-store>",
    )
