CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_product_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  handle TEXT,
  vendor TEXT,
  product_type TEXT,
  status TEXT NOT NULL DEFAULT 'unknown',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  external_variant_id TEXT NOT NULL UNIQUE,
  external_inventory_item_id TEXT,
  sku TEXT,
  barcode TEXT,
  title TEXT NOT NULL,
  price NUMERIC(12, 2),
  compare_at_price NUMERIC(12, 2),
  cost NUMERIC(12, 2),
  taxable BOOLEAN,
  tracked BOOLEAN,
  inventory_policy TEXT,
  option_values JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS variants_product_id_idx ON variants(product_id);
CREATE INDEX IF NOT EXISTS variants_sku_idx ON variants(sku);

CREATE TABLE IF NOT EXISTS inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES variants(id) ON DELETE CASCADE,
  external_variant_id TEXT NOT NULL,
  external_inventory_item_id TEXT,
  location_external_id TEXT,
  available INTEGER,
  committed INTEGER,
  incoming INTEGER,
  on_hand INTEGER,
  source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS inventory_snapshots_external_variant_id_idx
  ON inventory_snapshots(external_variant_id);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_order_id TEXT NOT NULL UNIQUE,
  order_number TEXT,
  currency_code TEXT,
  financial_status TEXT,
  fulfillment_status TEXT,
  customer_email TEXT,
  subtotal_price NUMERIC(12, 2),
  total_discount NUMERIC(12, 2),
  total_tax NUMERIC(12, 2),
  total_price NUMERIC(12, 2),
  ordered_at TIMESTAMPTZ,
  source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  external_line_item_id TEXT NOT NULL UNIQUE,
  external_variant_id TEXT,
  sku TEXT,
  title TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC(12, 2),
  total_discount NUMERIC(12, 2),
  source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_lines_order_id_idx ON order_lines(order_id);
CREATE INDEX IF NOT EXISTS order_lines_external_variant_id_idx ON order_lines(external_variant_id);

CREATE TABLE IF NOT EXISTS sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  status TEXT NOT NULL,
  external_reference TEXT,
  records_received INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS sync_runs_connector_resource_idx
  ON sync_runs(connector, resource_type, started_at DESC);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS alerts_status_severity_idx
  ON alerts(status, severity, created_at DESC);

CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  strategy TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  scope JSONB NOT NULL DEFAULT '{}'::jsonb,
  min_margin_percent NUMERIC(5, 2),
  max_discount_percent NUMERIC(5, 2),
  rounding_mode TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pricing_rule_id UUID REFERENCES pricing_rules(id) ON DELETE SET NULL,
  external_variant_id TEXT NOT NULL,
  sku TEXT,
  current_price NUMERIC(12, 2),
  recommended_price NUMERIC(12, 2) NOT NULL,
  confidence_score NUMERIC(5, 2),
  status TEXT NOT NULL DEFAULT 'pending',
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  review_operator_label TEXT,
  review_source TEXT
);

CREATE INDEX IF NOT EXISTS pricing_recommendations_status_idx
  ON pricing_recommendations(status, created_at DESC);

ALTER TABLE pricing_recommendations
  ADD COLUMN IF NOT EXISTS review_operator_label TEXT;

ALTER TABLE pricing_recommendations
  ADD COLUMN IF NOT EXISTS review_source TEXT;

CREATE TABLE IF NOT EXISTS pricing_review_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pricing_recommendation_id UUID NOT NULL UNIQUE REFERENCES pricing_recommendations(id) ON DELETE CASCADE,
  checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT NOT NULL DEFAULT '',
  operator_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pricing_review_workspaces_recommendation_idx
  ON pricing_review_workspaces(pricing_recommendation_id);

CREATE TABLE IF NOT EXISTS pricing_review_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pricing_recommendation_id UUID NOT NULL REFERENCES pricing_recommendations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pricing_review_events_recommendation_created_idx
  ON pricing_review_events(pricing_recommendation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS catalog_enrichment_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_product_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT,
  prompt_version TEXT,
  input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS catalog_review_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_run_id UUID NOT NULL UNIQUE REFERENCES catalog_enrichment_runs(id) ON DELETE CASCADE,
  checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT NOT NULL DEFAULT '',
  operator_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS catalog_review_workspaces_run_idx
  ON catalog_review_workspaces(catalog_run_id);

CREATE TABLE IF NOT EXISTS catalog_review_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_run_id UUID NOT NULL REFERENCES catalog_enrichment_runs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS catalog_review_events_run_created_idx
  ON catalog_review_events(catalog_run_id, created_at DESC);

CREATE TABLE IF NOT EXISTS shopify_webhook_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id TEXT UNIQUE,
  topic TEXT NOT NULL,
  shop_domain TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);
