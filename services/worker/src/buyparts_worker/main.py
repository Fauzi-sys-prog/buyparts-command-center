from buyparts_worker.jobs.catalog_enrichment import run_catalog_enrichment
from buyparts_worker.jobs.pricing_recommendation import run_pricing_recommendation


def main() -> None:
    print("BuyParts worker bootstrap")

    for result in (run_catalog_enrichment(), run_pricing_recommendation()):
        print(f"- {result['job']}: {result['status']}")
        print(f"  next: {result['next_step']}")


if __name__ == "__main__":
    main()
