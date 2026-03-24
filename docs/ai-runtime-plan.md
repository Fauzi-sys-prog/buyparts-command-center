# AI Runtime Plan

This layer prepares LLM enrichment and RAG workflows before live AI credentials are connected.

## Goal

Support:

- product title enrichment
- product description enrichment
- attribute normalization
- fitment-aware retrieval and grounded generation

## Current implementation state

- LLM readiness exists
- RAG readiness exists
- prompt catalog exists
- retrieval source manifest exists
- both jobs run in dry-run mode until credentials are present

## Prompt families

- `product-title-enrichment`
- `product-description-enrichment`
- `attribute-normalization`
- `fitment-summary`

## Retrieval sources

- manufacturer spec sheets
- supplier fitment notes
- catalog history
- operator playbooks

## Manual setup needed later

### LLM

- `LLM_PROVIDER`
- `LLM_API_KEY`

### RAG

- `EMBEDDING_PROVIDER`
- `EMBEDDING_API_KEY`
- `VECTOR_STORE_PROVIDER`
- `VECTOR_STORE_URL`
- `VECTOR_STORE_API_KEY`
- `RAG_COLLECTION_NAME`

## Next engineering step after credentials exist

1. add provider SDKs or REST clients
2. wire approved prompt templates into enrichment runs
3. ingest source documents into the retrieval index
4. connect RAG context into catalog enrichment and operator-assist flows
