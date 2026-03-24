from buyparts_worker.jobs.bigquery_sync import run_bigquery_sync
from buyparts_worker.jobs.catalog_enrichment import run_catalog_enrichment
from buyparts_worker.jobs.google_ads_optimization import run_google_ads_optimization
from buyparts_worker.jobs.inventory_tagging import run_inventory_tagging
from buyparts_worker.jobs.langchain_catalog_assistant import run_langchain_catalog_assistant
from buyparts_worker.jobs.merchant_center_diagnostics import run_merchant_center_diagnostics
from buyparts_worker.jobs.pricing_recommendation import run_pricing_recommendation
from buyparts_worker.jobs.rag_indexing import run_rag_indexing
from buyparts_worker.jobs.supplier_sync import run_supplier_sync


def main() -> None:
    print("BuyParts worker bootstrap")

    for result in (
        run_catalog_enrichment(),
        run_pricing_recommendation(),
        run_inventory_tagging(),
        run_supplier_sync(),
        run_bigquery_sync(),
        run_google_ads_optimization(),
        run_merchant_center_diagnostics(),
        run_rag_indexing(),
        run_langchain_catalog_assistant(),
    ):
        print(f"- {result['job']}: {result['status']}")
        print(f"  next: {result['next_step']}")


if __name__ == "__main__":
    main()
