from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SupplierAdapter:
    name: str
    purpose: str
    output: str


def get_supplier_adapters() -> list[SupplierAdapter]:
    return [
        SupplierAdapter(
            name="catalog-feed-adapter",
            purpose="Normalize manufacturer titles, attributes, and taxonomy mappings.",
            output="supplier_catalog_staging",
        ),
        SupplierAdapter(
            name="pricing-feed-adapter",
            purpose="Normalize cost, MAP, and price-break data into one comparable pricing shape.",
            output="supplier_pricing_staging",
        ),
        SupplierAdapter(
            name="availability-feed-adapter",
            purpose="Normalize stock, lead time, and warehouse availability signals.",
            output="supplier_inventory_staging",
        ),
    ]
