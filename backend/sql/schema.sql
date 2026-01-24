-- ============================
-- CompareHub schema (tables + indexes only)
-- ============================

CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  base_url TEXT,
  logo_url TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  rating NUMERIC(3,1),
  url TEXT NOT NULL,
  -- Used to filter "New only" vs other listing types.
  condition TEXT NOT NULL DEFAULT 'New',
  active BOOLEAN DEFAULT TRUE,
  last_seen_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, store_id, url)
);

-- Migration for existing databases (CREATE TABLE won't apply changes).
ALTER TABLE offers
  ADD COLUMN IF NOT EXISTS condition TEXT NOT NULL DEFAULT 'New';

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_offers_product ON offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_price ON offers(price);
CREATE INDEX IF NOT EXISTS idx_offers_condition ON offers(condition);
CREATE UNIQUE INDEX IF NOT EXISTS ux_products_name_brand ON products (name, brand);

-- ============================
-- PRODUCT SPECS (JSON)
-- ============================
-- Stores category-specific specs plus shared fields like review_count, key_features, pros/cons, buy_links.
CREATE TABLE IF NOT EXISTS product_specs (
  product_id INT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  specs_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_specs_gin
ON product_specs
USING GIN (specs_json);

-- ============================
-- ANALYTICS TABLES
-- ============================

CREATE TABLE IF NOT EXISTS search_events (
  id BIGSERIAL PRIMARY KEY,
  query TEXT,
  category TEXT,
  sort TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_events_time
ON search_events (created_at DESC);

CREATE TABLE IF NOT EXISTS click_events (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  offer_id BIGINT REFERENCES offers(id),
  store_id BIGINT REFERENCES stores(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_click_events_time
ON click_events (created_at DESC);

