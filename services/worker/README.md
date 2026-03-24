# BuyParts Worker

Python jobs live here for anything that is batch-oriented, AI-assisted, or easier to express outside the API runtime.

## Planned jobs

- Catalog enrichment
- Pricing recommendation batches
- Inventory tagging
- Supplier payload normalization
- BigQuery warehouse sync
- Google Ads performance joins
- RAG indexing and retrieval prep
- LangChain-assisted catalog workflows

## Suggested local setup

1. `cd services/worker`
2. `python3 -m venv .venv`
3. `source .venv/bin/activate`
4. `pip install -e .`
5. `buyparts-worker`
