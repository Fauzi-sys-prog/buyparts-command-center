# Shopify Ingestion Plan

## What this slice covers

The first Shopify integration slice is intentionally narrow:

- accept webhook-style product payloads
- accept webhook-style order payloads
- normalize them into BuyParts internal records
- persist them into PostgreSQL when `POSTGRES_URL` is configured
- fall back to preview mode when database wiring is not active

## Current API endpoints

- `GET /integrations/shopify/status`
- `POST /integrations/shopify/webhooks/products-upsert`
- `POST /integrations/shopify/webhooks/orders-create`

## Local test payloads

- `services/api/examples/shopify-product.json`
- `services/api/examples/shopify-order.json`

## Suggested curl smoke tests

```bash
curl -X POST http://localhost:4000/integrations/shopify/webhooks/products-upsert \
  -H 'Content-Type: application/json' \
  --data @services/api/examples/shopify-product.json
```

```bash
curl -X POST http://localhost:4000/integrations/shopify/webhooks/orders-create \
  -H 'Content-Type: application/json' \
  --data @services/api/examples/shopify-order.json
```

## Target Shopify data

### Products

- product identity: `id`, `title`, `handle`, `vendor`, `product_type`, `status`
- merchandising fields: `tags`
- variants: `id`, `inventory_item_id`, `sku`, `barcode`, `price`, `compare_at_price`
- operational fields: `inventory_quantity`, `inventory_policy`, `tracked`

### Orders

- order identity: `id`, `name`, `currency`, `created_at`
- commercial status: `financial_status`, `fulfillment_status`
- customer contact: `email`
- economics: `subtotal_price`, `total_discounts`, `total_tax`, `total_price`
- line items: `variant_id`, `sku`, `quantity`, `price`

## Next persistence step

Once PostgreSQL wiring is added, each accepted webhook should:

1. create a `shopify_webhook_receipts` row
2. open a `sync_runs` row
3. upsert `products` and `variants`, or `orders` and `order_lines`
4. append `inventory_snapshots` when inventory values are present
5. mark the sync run `success` or `failed`

That persistence flow is now implemented in the API repository layer. The remaining work is operational:

1. install `npm` dependencies
2. apply the schema to PostgreSQL
3. run the API and exercise the example payloads end to end

## Credentials checklist

- Shopify Partner account
- Shopify development store
- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_ADMIN_TOKEN`
