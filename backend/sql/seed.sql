-- ============================
-- CompareHub demo seed data (idempotent)
-- Safe to run on every startup.
-- ============================

-- STORES
INSERT INTO stores (name, base_url) VALUES
  ('Amazon', 'https://www.amazon.com'),
  ('BestBuy', 'https://www.bestbuy.com'),
  ('Walmart', 'https://www.walmart.com'),
  -- OEM (official) stores
  ('Apple', 'https://www.apple.com'),
  ('Samsung', 'https://www.samsung.com/us'),
  ('Google', 'https://store.google.com'),
  ('OnePlus', 'https://www.oneplus.com/us'),
  ('Motorola', 'https://www.motorola.com/us'),
  ('Xiaomi', 'https://www.mi.com/global'),
  ('Lenovo', 'https://www.lenovo.com/us'),
  ('ASUS', 'https://www.asus.com/us'),
  ('Dell', 'https://www.dell.com/en-us'),
  ('HP', 'https://www.hp.com/us-en'),
  ('Microsoft', 'https://www.microsoft.com'),
  ('LG', 'https://www.lg.com/us'),
  ('Framework', 'https://frame.work'),
  ('JBL', 'https://www.jbl.com'),
  ('Acer', 'https://www.acer.com/us-en')
ON CONFLICT (name) DO NOTHING;

-- PRODUCTS
-- Category is intentionally more specific now (Phones / Laptops) so category-specific specs are meaningful.
INSERT INTO products (name, brand, category, description, image_url) VALUES
  -- Phones (10)
  ('iPhone 15 Pro', 'Apple', 'Phones', 'A17 Pro chip, Pro camera system, and titanium build.', 'https://picsum.photos/seed/iphone15pro/800/600'),
  ('iPhone 15', 'Apple', 'Phones', 'Dynamic Island, A16 Bionic, and upgraded camera.', 'https://picsum.photos/seed/iphone15/800/600'),
  ('Galaxy S24 Ultra', 'Samsung', 'Phones', 'Flagship Android phone with advanced camera and S Pen.', 'https://picsum.photos/seed/s24ultra/800/600'),
  ('Galaxy S24', 'Samsung', 'Phones', 'Premium display, strong cameras, and fast performance.', 'https://picsum.photos/seed/s24/800/600'),
  ('Pixel 8 Pro', 'Google', 'Phones', 'Google AI features, excellent camera processing.', 'https://picsum.photos/seed/pixel8pro/800/600'),
  ('Pixel 8', 'Google', 'Phones', 'Compact flagship with clean Android and great camera.', 'https://picsum.photos/seed/pixel8/800/600'),
  ('OnePlus 12', 'OnePlus', 'Phones', 'Fast charging, bright display, and smooth performance.', 'https://picsum.photos/seed/oneplus12/800/600'),
	-- Removed: Nothing Phone (2) (user requested)
  ('Moto Edge+', 'Motorola', 'Phones', 'High refresh display and near-stock Android experience.', 'https://picsum.photos/seed/motoedge/800/600'),
  ('Xiaomi 14', 'Xiaomi', 'Phones', 'Strong specs and camera collaboration branding.', 'https://picsum.photos/seed/xiaomi14/800/600'),
	('Google Pixel 7', 'Google', 'Phones', 'Great camera, clean Android, and strong value.', 'https://picsum.photos/seed/pixel7/800/600'),
	('OnePlus 11', 'OnePlus', 'Phones', 'Flagship performance with fast charging and smooth display.', 'https://picsum.photos/seed/oneplus11/800/600'),

  -- Laptops (10)
  ('MacBook Air 13-inch (M3)', 'Apple', 'Laptops', 'Lightweight laptop with M3 chip and all-day battery.', 'https://picsum.photos/seed/macairm3/800/600'),
  ('MacBook Pro 14-inch (M3)', 'Apple', 'Laptops', 'Pro performance with Liquid Retina XDR display.', 'https://picsum.photos/seed/macprom3/800/600'),
  ('Dell XPS 13', 'Dell', 'Laptops', 'Compact premium ultrabook with crisp display.', 'https://picsum.photos/seed/xps13/800/600'),
  ('HP Spectre x360 14', 'HP', 'Laptops', '2-in-1 convertible with premium build and OLED option.', 'https://picsum.photos/seed/spectre14/800/600'),
  ('Lenovo ThinkPad X1 Carbon', 'Lenovo', 'Laptops', 'Business ultrabook with great keyboard and durability.', 'https://picsum.photos/seed/x1carbon/800/600'),
  ('ASUS ROG Zephyrus G14', 'ASUS', 'Laptops', 'Portable gaming laptop with strong GPU performance.', 'https://picsum.photos/seed/g14/800/600'),
  ('Acer Aspire 5', 'Acer', 'Laptops', 'Budget-friendly laptop for school and daily use.', 'https://picsum.photos/seed/aspire5/800/600'),
  ('Microsoft Surface Laptop 5', 'Microsoft', 'Laptops', 'Sleek design with a comfortable keyboard and screen.', 'https://picsum.photos/seed/surfacel5/800/600'),
  ('LG Gram 16', 'LG', 'Laptops', 'Ultra-light 16-inch laptop with long battery life.', 'https://picsum.photos/seed/lggram16/800/600'),
  ('Framework Laptop 13', 'Framework', 'Laptops', 'Modular, repairable laptop with upgradeable parts.', 'https://picsum.photos/seed/framework13/800/600')

  -- Headphones (3)
  ,('AirPods Pro 3', 'Apple', 'Headphones', 'Premium earbuds with ANC and tight Apple ecosystem integration.', 'https://picsum.photos/seed/airpodspro3/800/600')
  ,('JBL Tune 520BT Bluetooth Wireless On-Ear Headphones', 'JBL', 'Headphones', 'Lightweight on-ear headphones with long battery life.', 'https://picsum.photos/seed/jbl520bt/800/600')
  ,('JBL Tune 670NC Bluetooth Wireless On-Ear Headphones', 'JBL', 'Headphones', 'On-ear headphones with ANC and very long battery life.', 'https://picsum.photos/seed/jbl670nc/800/600')
ON CONFLICT (name, brand) DO NOTHING;

-- PRODUCT SPECS (JSON)
-- Notes:
-- - We keep the JSON readable and recruiter-friendly.
-- - last_updated is maintained in the table, but we also store it inside JSON for UI display.
-- - buy_links are OPTIONAL; offers already include store URLs.

-- Phones specs
INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 18234,
         'key_features', jsonb_build_array('Titanium design', 'A17 Pro chip', 'Pro camera system'),
         'pros', jsonb_build_array('Excellent performance', 'Great cameras', 'Premium build'),
         'cons', jsonb_build_array('Expensive', 'Limited base storage'),
         'last_updated', '2026-01-09',
         'chipset', 'A17 Pro',
         'ram', 8,
         'storage', 256,
         'display_size', 6.1,
         'refresh_rate', 120,
         'camera_main_mp', 48,
         'battery_mah', 3274,
         'charging_watts', 27,
         '5g', true,
         'os_version', 'iOS 17'
       )
FROM products p
WHERE p.name='iPhone 15 Pro' AND p.brand='Apple'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 14321,
         'key_features', jsonb_build_array('Dynamic Island', 'A16 Bionic', 'Improved camera'),
         'pros', jsonb_build_array('Smooth UI', 'Strong battery', 'Great video'),
         'cons', jsonb_build_array('No 120Hz display'),
         'last_updated', '2026-01-09',
         'chipset', 'A16 Bionic',
         'ram', 6,
         'storage', 128,
         'display_size', 6.1,
         'refresh_rate', 60,
         'camera_main_mp', 48,
         'battery_mah', 3349,
         'charging_watts', 27,
         '5g', true,
         'os_version', 'iOS 17'
       )
FROM products p
WHERE p.name='iPhone 15' AND p.brand='Apple'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 21455,
         'key_features', jsonb_build_array('S Pen', 'Large display', 'High-end cameras'),
         'pros', jsonb_build_array('Best-in-class zoom', 'Bright display', 'Premium features'),
         'cons', jsonb_build_array('Large and heavy'),
         'last_updated', '2026-01-09',
         'chipset', 'Snapdragon 8 Gen 3',
         'ram', 12,
         'storage', 256,
         'display_size', 6.8,
         'refresh_rate', 120,
         'camera_main_mp', 200,
         'battery_mah', 5000,
         'charging_watts', 45,
         '5g', true,
         'os_version', 'Android 14'
       )
FROM products p
WHERE p.name='Galaxy S24 Ultra' AND p.brand='Samsung'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 16780,
         'key_features', jsonb_build_array('120Hz display', 'Great cameras', 'Premium build'),
         'pros', jsonb_build_array('Excellent screen', 'Fast performance'),
         'cons', jsonb_build_array('Pricey'),
         'last_updated', '2026-01-09',
         'chipset', 'Snapdragon 8 Gen 3',
         'ram', 8,
         'storage', 256,
         'display_size', 6.2,
         'refresh_rate', 120,
         'camera_main_mp', 50,
         'battery_mah', 4000,
         'charging_watts', 25,
         '5g', true,
         'os_version', 'Android 14'
       )
FROM products p
WHERE p.name='Galaxy S24' AND p.brand='Samsung'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 11240,
         'key_features', jsonb_build_array('AI photo tools', 'Great camera processing', '120Hz LTPO'),
         'pros', jsonb_build_array('Top camera', 'Clean software'),
         'cons', jsonb_build_array('Charging slower than rivals'),
         'last_updated', '2026-01-09',
         'chipset', 'Google Tensor G3',
         'ram', 12,
         'storage', 128,
         'display_size', 6.7,
         'refresh_rate', 120,
         'camera_main_mp', 50,
         'battery_mah', 5050,
         'charging_watts', 30,
         '5g', true,
         'os_version', 'Android 14'
       )
FROM products p
WHERE p.name='Pixel 8 Pro' AND p.brand='Google'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 9850,
         'key_features', jsonb_build_array('Compact flagship', 'Great camera', '7 years updates'),
         'pros', jsonb_build_array('Excellent photos', 'Long software support'),
         'cons', jsonb_build_array('Not the fastest charging'),
         'last_updated', '2026-01-09',
         'chipset', 'Google Tensor G3',
         'ram', 8,
         'storage', 128,
         'display_size', 6.2,
         'refresh_rate', 120,
         'camera_main_mp', 50,
         'battery_mah', 4575,
         'charging_watts', 27,
         '5g', true,
         'os_version', 'Android 14'
       )
FROM products p
WHERE p.name='Pixel 8' AND p.brand='Google'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 7420,
         'key_features', jsonb_build_array('Fast charging', 'Bright display', 'Smooth UI'),
         'pros', jsonb_build_array('Very fast charging', 'Great value'),
         'cons', jsonb_build_array('Camera not best in class'),
         'last_updated', '2026-01-09',
         'chipset', 'Snapdragon 8 Gen 3',
         'ram', 12,
         'storage', 256,
         'display_size', 6.8,
         'refresh_rate', 120,
         'camera_main_mp', 50,
         'battery_mah', 5400,
         'charging_watts', 80,
         '5g', true,
         'os_version', 'Android 14'
       )
FROM products p
WHERE p.name='OnePlus 12' AND p.brand='OnePlus'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 4180,
         'key_features', jsonb_build_array('High refresh display', 'Clean Android', 'Good cameras'),
         'pros', jsonb_build_array('Smooth display', 'Solid performance'),
         'cons', jsonb_build_array('Average updates policy'),
         'last_updated', '2026-01-09',
         'chipset', 'Snapdragon 8 Gen 2',
         'ram', 8,
         'storage', 256,
         'display_size', 6.7,
         'refresh_rate', 165,
         'camera_main_mp', 50,
         'battery_mah', 5100,
         'charging_watts', 68,
         '5g', true,
         'os_version', 'Android 14'
       )
FROM products p
WHERE p.name='Moto Edge+' AND p.brand='Motorola'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 6500,
         'key_features', jsonb_build_array('Compact flagship', 'Leica-branded camera', 'Fast charging'),
         'pros', jsonb_build_array('Strong performance', 'Great display'),
         'cons', jsonb_build_array('Software varies by region'),
         'last_updated', '2026-01-09',
         'chipset', 'Snapdragon 8 Gen 3',
         'ram', 12,
         'storage', 256,
         'display_size', 6.36,
         'refresh_rate', 120,
         'camera_main_mp', 50,
         'battery_mah', 4610,
         'charging_watts', 90,
         '5g', true,
         'os_version', 'Android 14'
       )
FROM products p
WHERE p.name='Xiaomi 14' AND p.brand='Xiaomi'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

-- Laptops specs
INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 10234,
         'key_features', jsonb_build_array('M3 chip', 'Lightweight', 'All-day battery'),
         'pros', jsonb_build_array('Great battery', 'Silent performance', 'Excellent trackpad'),
         'cons', jsonb_build_array('Limited ports'),
         'last_updated', '2026-01-09',
         'cpu', 'Apple M3',
         'gpu', 'Integrated',
         'ram', 16,
         'storage', 512,
         'screen_size', 13.6,
         'resolution', '2560x1664',
         'battery_hours', 18,
         'weight', 2.7,
         'ports', jsonb_build_array('2x Thunderbolt/USB4', 'MagSafe', '3.5mm'),
         'os', 'macOS'
       )
FROM products p
WHERE p.name='MacBook Air 13-inch (M3)' AND p.brand='Apple'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 12340,
         'key_features', jsonb_build_array('Liquid Retina XDR', 'Pro performance', 'Great speakers'),
         'pros', jsonb_build_array('Top display', 'Very fast', 'Great build'),
         'cons', jsonb_build_array('Expensive'),
         'last_updated', '2026-01-09',
         'cpu', 'Apple M3',
         'gpu', 'Integrated',
         'ram', 18,
         'storage', 512,
         'screen_size', 14.2,
         'resolution', '3024x1964',
         'battery_hours', 18,
         'weight', 3.5,
         'ports', jsonb_build_array('HDMI', 'SDXC', '3x Thunderbolt/USB4', 'MagSafe', '3.5mm'),
         'os', 'macOS'
       )
FROM products p
WHERE p.name='MacBook Pro 14-inch (M3)' AND p.brand='Apple'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 8450,
         'key_features', jsonb_build_array('Premium ultrabook', 'Compact', 'Crisp display'),
         'pros', jsonb_build_array('Beautiful design', 'Great screen'),
         'cons', jsonb_build_array('Limited port selection'),
         'last_updated', '2026-01-09',
         'cpu', 'Intel Core i7',
         'gpu', 'Intel Iris Xe',
         'ram', 16,
         'storage', 512,
         'screen_size', 13.4,
         'resolution', '1920x1200',
         'battery_hours', 12,
         'weight', 2.7,
         'ports', jsonb_build_array('2x Thunderbolt 4', 'USB-C', 'microSD'),
         'os', 'Windows 11'
       )
FROM products p
WHERE p.name='Dell XPS 13' AND p.brand='Dell'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 6230,
         'key_features', jsonb_build_array('2-in-1 convertible', 'Premium build', 'OLED option'),
         'pros', jsonb_build_array('Versatile form factor', 'Great display'),
         'cons', jsonb_build_array('Can get pricey'),
         'last_updated', '2026-01-09',
         'cpu', 'Intel Core i7',
         'gpu', 'Intel Iris Xe',
         'ram', 16,
         'storage', 512,
         'screen_size', 14,
         'resolution', '3000x2000',
         'battery_hours', 11,
         'weight', 3.0,
         'ports', jsonb_build_array('2x Thunderbolt 4', 'USB-A', 'microSD'),
         'os', 'Windows 11'
       )
FROM products p
WHERE p.name='HP Spectre x360 14' AND p.brand='HP'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 7320,
         'key_features', jsonb_build_array('Great keyboard', 'Business-grade', 'Durable'),
         'pros', jsonb_build_array('Best keyboard', 'Light and sturdy'),
         'cons', jsonb_build_array('Webcam varies by model'),
         'last_updated', '2026-01-09',
         'cpu', 'Intel Core i7',
         'gpu', 'Intel Iris Xe',
         'ram', 16,
         'storage', 512,
         'screen_size', 14,
         'resolution', '1920x1200',
         'battery_hours', 14,
         'weight', 2.5,
         'ports', jsonb_build_array('2x Thunderbolt 4', 'USB-A', 'HDMI'),
         'os', 'Windows 11'
       )
FROM products p
WHERE p.name='Lenovo ThinkPad X1 Carbon' AND p.brand='Lenovo'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 5340,
         'key_features', jsonb_build_array('Portable gaming', 'Strong GPU', 'Great screen'),
         'pros', jsonb_build_array('Gaming performance', 'Portable'),
         'cons', jsonb_build_array('Fans can get loud'),
         'last_updated', '2026-01-09',
         'cpu', 'AMD Ryzen 9',
         'gpu', 'NVIDIA RTX',
         'ram', 16,
         'storage', 1024,
         'screen_size', 14,
         'resolution', '2560x1600',
         'battery_hours', 10,
         'weight', 3.6,
         'ports', jsonb_build_array('USB-C', 'USB-A', 'HDMI'),
         'os', 'Windows 11'
       )
FROM products p
WHERE p.name='ASUS ROG Zephyrus G14' AND p.brand='ASUS'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 9120,
         'key_features', jsonb_build_array('Budget friendly', 'Solid performance', 'Good value'),
         'pros', jsonb_build_array('Affordable', 'Good everyday laptop'),
         'cons', jsonb_build_array('Average display'),
         'last_updated', '2026-01-09',
         'cpu', 'Intel Core i5',
         'gpu', 'Integrated',
         'ram', 8,
         'storage', 512,
         'screen_size', 15.6,
         'resolution', '1920x1080',
         'battery_hours', 9,
         'weight', 3.9,
         'ports', jsonb_build_array('USB-A', 'USB-C', 'HDMI'),
         'os', 'Windows 11'
       )
FROM products p
WHERE p.name='Acer Aspire 5' AND p.brand='Acer'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 6040,
         'key_features', jsonb_build_array('Sleek design', 'Good keyboard', 'Touchscreen option'),
         'pros', jsonb_build_array('Premium feel', 'Nice display'),
         'cons', jsonb_build_array('Ports could be better'),
         'last_updated', '2026-01-09',
         'cpu', 'Intel Core i7',
         'gpu', 'Intel Iris Xe',
         'ram', 16,
         'storage', 512,
         'screen_size', 13.5,
         'resolution', '2256x1504',
         'battery_hours', 13,
         'weight', 2.9,
         'ports', jsonb_build_array('USB-C', 'USB-A'),
         'os', 'Windows 11'
       )
FROM products p
WHERE p.name='Microsoft Surface Laptop 5' AND p.brand='Microsoft'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 4890,
         'key_features', jsonb_build_array('Ultra light', 'Large screen', 'Long battery'),
         'pros', jsonb_build_array('Very lightweight', 'Big display'),
         'cons', jsonb_build_array('Webcam average'),
         'last_updated', '2026-01-09',
         'cpu', 'Intel Core i7',
         'gpu', 'Intel Iris Xe',
         'ram', 16,
         'storage', 512,
         'screen_size', 16,
         'resolution', '2560x1600',
         'battery_hours', 17,
         'weight', 2.6,
         'ports', jsonb_build_array('USB-C', 'USB-A', 'HDMI'),
         'os', 'Windows 11'
       )
FROM products p
WHERE p.name='LG Gram 16' AND p.brand='LG'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

INSERT INTO product_specs (product_id, specs_json)
SELECT p.id,
       jsonb_build_object(
         'review_count', 3210,
         'key_features', jsonb_build_array('Repairable', 'Modular', 'Upgradeable'),
         'pros', jsonb_build_array('Easy to repair', 'Good performance'),
         'cons', jsonb_build_array('Can be pricier than peers'),
         'last_updated', '2026-01-09',
         'cpu', 'Intel Core i7',
         'gpu', 'Integrated',
         'ram', 16,
         'storage', 512,
         'screen_size', 13.5,
         'resolution', '2256x1504',
         'battery_hours', 10,
         'weight', 2.8,
         'ports', jsonb_build_array('USB-C', 'USB-A', 'HDMI (module)'),
         'os', 'Windows 11'
       )
FROM products p
WHERE p.name='Framework Laptop 13' AND p.brand='Framework'
ON CONFLICT (product_id) DO UPDATE SET specs_json=EXCLUDED.specs_json, last_updated=now();

-- OFFERS
-- Use predictable demo links. In a real build, these would be scraped or imported from feeds.

-- Helper: offers for each product across 2-3 stores.

-- Phones offers
INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 999.00, 4.7, 'https://www.amazon.com/s?k=iphone15pro', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='iPhone 15 Pro' AND p.brand='Apple'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 979.99, 4.6, 'https://www.bestbuy.com/site/searchpage.jsp?st=iphone15pro', 'New', true
FROM products p JOIN stores s ON s.name='BestBuy'
WHERE p.name='iPhone 15 Pro' AND p.brand='Apple'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 799.00, 4.6, 'https://www.amazon.com/s?k=iphone15', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='iPhone 15' AND p.brand='Apple'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 779.99, 4.5, 'https://www.walmart.com/search?q=iphone15', 'New', true
FROM products p JOIN stores s ON s.name='Walmart'
WHERE p.name='iPhone 15' AND p.brand='Apple'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 1299.00, 4.8, 'https://www.amazon.com/s?k=s24ultra', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='Galaxy S24 Ultra' AND p.brand='Samsung'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 1279.99, 4.7, 'https://www.bestbuy.com/site/searchpage.jsp?st=s24ultra', 'New', true
FROM products p JOIN stores s ON s.name='BestBuy'
WHERE p.name='Galaxy S24 Ultra' AND p.brand='Samsung'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 899.00, 4.6, 'https://www.amazon.com/s?k=s24', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='Galaxy S24' AND p.brand='Samsung'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 879.99, 4.5, 'https://www.bestbuy.com/site/searchpage.jsp?st=s24', 'New', true
FROM products p JOIN stores s ON s.name='BestBuy'
WHERE p.name='Galaxy S24' AND p.brand='Samsung'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 999.00, 4.6, 'https://www.amazon.com/s?k=pixel8pro', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='Pixel 8 Pro' AND p.brand='Google'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 979.00, 4.5, 'https://www.bestbuy.com/site/searchpage.jsp?st=pixel8pro', 'New', true
FROM products p JOIN stores s ON s.name='BestBuy'
WHERE p.name='Pixel 8 Pro' AND p.brand='Google'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 699.00, 4.5, 'https://www.amazon.com/s?k=pixel8', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='Pixel 8' AND p.brand='Google'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 679.00, 4.4, 'https://www.walmart.com/search?q=pixel8', 'New', true
FROM products p JOIN stores s ON s.name='Walmart'
WHERE p.name='Pixel 8' AND p.brand='Google'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

-- Remaining phones: give a single Amazon offer for demo
INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 799.00, 4.4, 'https://www.amazon.com/s?k=oneplus12', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='OnePlus 12' AND p.brand='OnePlus'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 599.00, 4.3, 'https://www.amazon.com/s?k=motoedge', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='Moto Edge+' AND p.brand='Motorola'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 749.00, 4.4, 'https://www.amazon.com/s?k=xiaomi14', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='Xiaomi 14' AND p.brand='Xiaomi'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

-- Laptops offers
INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 1099.00, 4.8, 'https://www.amazon.com/s?k=macairm3', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='MacBook Air 13-inch (M3)' AND p.brand='Apple'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 1049.00, 4.7, 'https://www.bestbuy.com/site/searchpage.jsp?st=macairm3', 'New', true
FROM products p JOIN stores s ON s.name='BestBuy'
WHERE p.name='MacBook Air 13-inch (M3)' AND p.brand='Apple'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 1599.00, 4.8, 'https://www.amazon.com/s?k=macprom3', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='MacBook Pro 14-inch (M3)' AND p.brand='Apple'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 1549.00, 4.7, 'https://www.bestbuy.com/site/searchpage.jsp?st=macprom3', 'New', true
FROM products p JOIN stores s ON s.name='BestBuy'
WHERE p.name='MacBook Pro 14-inch (M3)' AND p.brand='Apple'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 999.00, 4.6, 'https://www.amazon.com/s?k=xps13', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='Dell XPS 13' AND p.brand='Dell'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 949.00, 4.5, 'https://www.bestbuy.com/site/searchpage.jsp?st=xps13', 'New', true
FROM products p JOIN stores s ON s.name='BestBuy'
WHERE p.name='Dell XPS 13' AND p.brand='Dell'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

-- Single-store demo offers for remaining laptops
INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 1199.00, 4.5, 'https://www.amazon.com/s?k=spectre14', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='HP Spectre x360 14' AND p.brand='HP'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 1299.00, 4.6, 'https://www.amazon.com/s?k=x1carbon', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='Lenovo ThinkPad X1 Carbon' AND p.brand='Lenovo'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 1399.00, 4.5, 'https://www.amazon.com/s?k=g14', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='ASUS ROG Zephyrus G14' AND p.brand='ASUS'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 549.00, 4.3, 'https://www.amazon.com/s?k=aspire5', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='Acer Aspire 5' AND p.brand='Acer'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 899.00, 4.4, 'https://www.amazon.com/s?k=surfacel5', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='Microsoft Surface Laptop 5' AND p.brand='Microsoft'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 1249.00, 4.5, 'https://www.amazon.com/s?k=lggram16', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='LG Gram 16' AND p.brand='LG'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 1149.00, 4.4, 'https://www.amazon.com/s?k=framework13', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='Framework Laptop 13' AND p.brand='Framework'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

-- Extra products that appear in the UI grid (Phones + Headphones)

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 449.00, 4.4, 'https://www.amazon.com/s?k=pixel+7', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='Google Pixel 7' AND p.brand='Google'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 699.00, 4.3, 'https://www.amazon.com/s?k=oneplus+11', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='OnePlus 11' AND p.brand='OnePlus'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 249.00, 4.7, 'https://www.amazon.com/s?k=airpods+pro+3', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='AirPods Pro 3' AND p.brand='Apple'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 229.00, 4.6, 'https://www.bestbuy.com/site/searchpage.jsp?st=airpods%20pro', 'New', true
FROM products p JOIN stores s ON s.name='BestBuy'
WHERE p.name='AirPods Pro 3' AND p.brand='Apple'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 69.99, 4.6, 'https://www.amazon.com/s?k=jbl+tune+520bt', 'New', true
FROM products p JOIN stores s ON s.name='Amazon'
WHERE p.name='JBL Tune 520BT Bluetooth Wireless On-Ear Headphones' AND p.brand='JBL'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO offers (product_id, store_id, price, rating, url, condition, active)
SELECT p.id, s.id, 89.99, 4.6, 'https://www.walmart.com/search?q=jbl%20tune%20670nc', 'New', true
FROM products p JOIN stores s ON s.name='Walmart'
WHERE p.name='JBL Tune 670NC Bluetooth Wireless On-Ear Headphones' AND p.brand='JBL'
ON CONFLICT (product_id, store_id, url) DO UPDATE SET price=EXCLUDED.price, rating=EXCLUDED.rating, active=true, last_seen_at=NOW();

INSERT INTO stores (name) VALUES
  ('Amazon'),
  ('Best Buy'),
  ('Walmart')
ON CONFLICT (name) DO NOTHING;