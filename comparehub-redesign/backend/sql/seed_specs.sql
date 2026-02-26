-- go-ecommerce/backend/sql/seed_specs.sql
-- Upserts extra specs for products (especially Headphones) so Compare page can show spec rows.
--
-- How to run:
--   psql "$DATABASE_URL" -f sql/schema.sql
--   psql "$DATABASE_URL" -f sql/seed.sql        -- optional
--   psql "$DATABASE_URL" -f sql/seed_specs.sql  -- required for Headphones + extras
--
-- Notes:
-- - Products are matched by (name, brand). If you rename a product, update this script.
-- - `specs_json` keys must match the frontend spec rows.

-- ==========================
-- Headphones
-- ==========================

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 18234,
         'type', 'Earbuds',
         'anc', true,
         'battery_hours', 30,
         'multipoint', false,
         'codec_support', 'AAC, Spatial Audio',
         'key_features', jsonb_build_array('Active Noise Cancellation', 'Transparency mode', 'Spatial Audio'),
         'pros', jsonb_build_array('Excellent ANC', 'Great integration with Apple devices'),
         'cons', jsonb_build_array('Premium price', 'Best experience in Apple ecosystem')
       )
FROM products p
WHERE LOWER(p.name)=LOWER('AirPods Pro 3') AND LOWER(p.brand)=LOWER('Apple')
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=NOW();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 9120,
         'type', 'On-ear',
         'anc', false,
         'battery_hours', 57,
         'multipoint', true,
         'codec_support', 'SBC',
         'key_features', jsonb_build_array('JBL Pure Bass', 'Bluetooth 5.3', 'Fast charge'),
         'pros', jsonb_build_array('Very long battery life', 'Lightweight'),
         'cons', jsonb_build_array('No ANC', 'On-ear fit may not suit everyone')
       )
FROM products p
WHERE LOWER(p.name)=LOWER('JBL Tune 520BT Bluetooth Wireless On-Ear Headphones') AND LOWER(p.brand)=LOWER('JBL')
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=NOW();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 5340,
         'type', 'On-ear',
         'anc', true,
         'battery_hours', 70,
         'multipoint', true,
         'codec_support', 'SBC, AAC',
         'key_features', jsonb_build_array('Adaptive Noise Cancelling', 'Up to 70 hours battery', 'Dual-device connection'),
         'pros', jsonb_build_array('Excellent battery', 'Solid ANC for the price'),
         'cons', jsonb_build_array('On-ear pressure for some users', 'Plastic build')
       )
FROM products p
WHERE LOWER(p.name)=LOWER('JBL Tune 670NC Bluetooth Wireless On-Ear Headphones') AND LOWER(p.brand)=LOWER('JBL')
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=NOW();

-- ==========================
-- Phones (extras often coming from feeds)
-- ==========================

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 16780,
         'chipset', 'Snapdragon 8 Gen 3',
         'ram', 12,
         'storage', 256,
         'display_size', 6.2,
         'refresh_rate', 120,
         'camera_main_mp', 50,
         'battery_mah', 4000,
         'charging_watts', 25,
         '5g', true,
         'os_version', 'Android 14',
         'key_features', jsonb_build_array('Dynamic AMOLED 2X', 'High refresh display', 'Flagship cameras'),
         'pros', jsonb_build_array('Bright display', 'Great cameras'),
         'cons', jsonb_build_array('Charging not the fastest')
       )
FROM products p
WHERE LOWER(p.name)=LOWER('Samsung Galaxy S24') AND LOWER(p.brand)=LOWER('Samsung')
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=NOW();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 23450,
         'chipset', 'Snapdragon 8 Gen 3',
         'ram', 12,
         'storage', 512,
         'display_size', 6.8,
         'refresh_rate', 120,
         'camera_main_mp', 200,
         'battery_mah', 5000,
         'charging_watts', 45,
         '5g', true,
         'os_version', 'Android 14',
         'key_features', jsonb_build_array('200MP main camera', 'S Pen support', 'Large AMOLED display'),
         'pros', jsonb_build_array('Top-tier camera', 'Big battery'),
         'cons', jsonb_build_array('Large/heavy', 'Expensive')
       )
FROM products p
WHERE LOWER(p.name)=LOWER('Galaxy S24 Ultra') AND LOWER(p.brand)=LOWER('Samsung')
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=NOW();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 8460,
         'chipset', 'Tensor G2',
         'ram', 8,
         'storage', 128,
         'display_size', 6.3,
         'refresh_rate', 90,
         'camera_main_mp', 50,
         'battery_mah', 4355,
         'charging_watts', 20,
         '5g', true,
         'os_version', 'Android 14',
         'key_features', jsonb_build_array('Google camera processing', 'Call screening', 'Clean Android'),
         'pros', jsonb_build_array('Great photos', 'Smooth UI'),
         'cons', jsonb_build_array('Charging speed is average')
       )
FROM products p
WHERE LOWER(p.name)=LOWER('Google Pixel 7') AND LOWER(p.brand)=LOWER('Google')
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=NOW();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 7420,
         'chipset', 'Snapdragon 8 Gen 2',
         'ram', 16,
         'storage', 256,
         'display_size', 6.7,
         'refresh_rate', 120,
         'camera_main_mp', 50,
         'battery_mah', 5000,
         'charging_watts', 80,
         '5g', true,
         'os_version', 'Android 14',
         'key_features', jsonb_build_array('Fast charging', 'Fluid AMOLED', 'High performance'),
         'pros', jsonb_build_array('Very fast charging', 'Smooth performance'),
         'cons', jsonb_build_array('Camera is good but not best-in-class')
       )
FROM products p
WHERE LOWER(p.name)=LOWER('OnePlus 11') AND LOWER(p.brand)=LOWER('OnePlus')
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=NOW();

-- ==========================
-- Laptops (extras often coming from feeds)
-- ==========================

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 10234,
         'cpu', 'Apple M2',
         'gpu', 'Integrated',
         'ram', 8,
         'storage', 256,
         'screen_size', 13.6,
         'resolution', '2560x1664',
         'battery_hours', 18,
         'weight', 2.7,
         'ports', '2x Thunderbolt/USB4, MagSafe',
         'os', 'macOS',
         'key_features', jsonb_build_array('Fanless design', 'Great battery life', 'Thin and light'),
         'pros', jsonb_build_array('Excellent efficiency', 'Great screen'),
         'cons', jsonb_build_array('Limited ports')
       )
FROM products p
WHERE LOWER(p.name)=LOWER('MacBook Air M2') AND LOWER(p.brand)=LOWER('Apple')
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=NOW();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 11240,
         'cpu', 'Apple M3',
         'gpu', 'Integrated',
         'ram', 8,
         'storage', 256,
         'screen_size', 13.6,
         'resolution', '2560x1664',
         'battery_hours', 18,
         'weight', 2.7,
         'ports', '2x Thunderbolt/USB4, MagSafe',
         'os', 'macOS',
         'key_features', jsonb_build_array('Improved GPU', 'Great battery', 'Silent operation'),
         'pros', jsonb_build_array('Fast and efficient', 'Great build quality'),
         'cons', jsonb_build_array('Limited port selection')
       )
FROM products p
WHERE LOWER(p.name)=LOWER('MacBook Air M3') AND LOWER(p.brand)=LOWER('Apple')
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=NOW();
