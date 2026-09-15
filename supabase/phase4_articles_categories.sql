-- =============================================================================
-- PHASE 4 / 5: Card Categories & 21 Full Review Articles
-- =============================================================================

-- 1. Card ↔ Category relationships (Single fast batch query)
INSERT INTO catalog_card_categories (card_id, category_id)
SELECT c.id, cat.id
FROM (
  VALUES
  ('equitas-selfe', 'Apparel'),
  ('equitas-selfe', 'Utility'),
  ('equitas-selfe', 'Grocery'),
  ('bob-eterna', 'Online'),
  ('bob-eterna', 'Travel'),
  ('bob-eterna', 'Dining'),
  ('bob-eterna', 'International'),
  ('hdfc-marriott-bonvoy', 'Hotels'),
  ('hdfc-marriott-bonvoy', 'Travel'),
  ('hdfc-marriott-bonvoy', 'Dining'),
  ('hdfc-regalia-gold', 'Travel'),
  ('hdfc-regalia-gold', 'Hotels'),
  ('hdfc-regalia-gold', 'Lifestyle'),
  ('hdfc-regalia-gold', 'Shopping'),
  ('yes-reserv', 'Online'),
  ('yes-reserv', 'Travel'),
  ('yes-reserv', 'Apparel'),
  ('yes-reserv', 'Dining'),
  ('yes-reserv', 'International'),
  ('scapia', 'Travel'),
  ('scapia', 'Everyday Retail'),
  ('scapia', 'Gold & Jewelry'),
  ('amex-platinum-charge', 'Travel'),
  ('amex-platinum-charge', 'International'),
  ('amex-platinum-charge', 'Luxury'),
  ('times-black-icici', 'International'),
  ('times-black-icici', 'Travel'),
  ('times-black-icici', 'Lifestyle'),
  ('times-black-icici', 'All Retail'),
  ('au-lit', 'Retail'),
  ('au-lit', 'Grocery'),
  ('au-lit', 'Apparel'),
  ('au-lit', 'Online'),
  ('sbi-cashback', 'Online'),
  ('sbi-cashback', 'Shopping'),
  ('sbi-cashback', 'Grocery'),
  ('sbi-cashback', 'Dining'),
  ('sbi-cashback', 'Travel'),
  ('sbi-phonepe-select-black', 'PhonePe'),
  ('sbi-phonepe-select-black', 'Online Shopping'),
  ('sbi-phonepe-select-black', 'UPI'),
  ('sbi-phonepe-select-black', 'Travel'),
  ('sbi-phonepe-select-black', 'Utilities'),
  ('hdfc-swiggy', 'Food Delivery'),
  ('hdfc-swiggy', 'Grocery'),
  ('hdfc-swiggy', 'Dining'),
  ('hdfc-swiggy', 'Online Shopping'),
  ('hdfc-swiggy', 'Travel'),
  ('hdfc-swiggy', 'Transport'),
  ('axis-cashback', 'Online'),
  ('axis-cashback', 'Shopping'),
  ('axis-cashback', 'Utilities'),
  ('axis-magnus', 'Travel'),
  ('axis-magnus', 'Miles Transfer'),
  ('axis-magnus', 'Lifestyle'),
  ('axis-magnus', 'International'),
  ('axis-magnus-burgundy', 'Travel'),
  ('axis-magnus-burgundy', 'Miles Transfer'),
  ('axis-magnus-burgundy', 'Dining'),
  ('axis-magnus-burgundy', 'Lifestyle'),
  ('hsbc-live-plus', 'Dining'),
  ('hsbc-live-plus', 'Food Delivery'),
  ('hsbc-live-plus', 'Groceries'),
  ('bob-etihad-guest-premium', 'Travel'),
  ('bob-etihad-guest-premium', 'International'),
  ('bob-etihad-guest-premium', 'Airline Miles'),
  ('salaryse-levelup', 'UPI'),
  ('salaryse-levelup', 'Everyday Spends'),
  ('salaryse-levelup', 'Gift Cards'),
  ('icici-amazon-pay', 'Amazon'),
  ('icici-amazon-pay', 'Online'),
  ('icici-amazon-pay', 'Grocery'),
  ('icici-amazon-pay', 'Shopping'),
  ('axis-ace', 'Utilities'),
  ('axis-ace', 'Dining'),
  ('axis-ace', 'Travel'),
  ('axis-ace', 'Online'),
  ('axis-ace', 'Offline'),
  ('axis-flipkart', 'Flipkart'),
  ('axis-flipkart', 'Myntra'),
  ('axis-flipkart', 'Cleartrip'),
  ('axis-flipkart', 'Dining'),
  ('axis-flipkart', 'Entertainment'),
  ('idfc-first-wealth', 'Online'),
  ('idfc-first-wealth', 'Dining'),
  ('idfc-first-wealth', 'Travel'),
  ('idfc-first-wealth', 'Retail'),
  ('idfc-first-wealth', 'International'),
  ('sc-ultimate', 'All Retail'),
  ('sc-ultimate', 'Online'),
  ('sc-ultimate', 'Dining'),
  ('sc-ultimate', 'Travel'),
  ('sc-ultimate', 'International'),
  ('hdfc-millennia', 'Amazon'),
  ('hdfc-millennia', 'Flipkart'),
  ('hdfc-millennia', 'Myntra'),
  ('hdfc-millennia', 'Dining'),
  ('hdfc-millennia', 'Travel'),
  ('hdfc-millennia', 'Entertainment'),
  ('hdfc-diners-black', 'Travel'),
  ('hdfc-diners-black', 'Hotels'),
  ('hdfc-diners-black', 'Dining'),
  ('hdfc-diners-black', 'Lifestyle'),
  ('hdfc-diners-black', 'International'),
  ('hdfc-diners-privilege', 'Travel'),
  ('hdfc-diners-privilege', 'Hotels'),
  ('hdfc-diners-privilege', 'Lifestyle'),
  ('hdfc-tata-neu-infinity', 'Tata Brands'),
  ('hdfc-tata-neu-infinity', 'Grocery'),
  ('hdfc-tata-neu-infinity', 'Travel'),
  ('hdfc-tata-neu-infinity', 'Electronics'),
  ('hdfc-tata-neu-infinity', 'Health'),
  ('hdfc-moneyback-plus', 'Amazon'),
  ('hdfc-moneyback-plus', 'Flipkart'),
  ('hdfc-moneyback-plus', 'Food Delivery'),
  ('hdfc-moneyback-plus', 'Grocery'),
  ('hdfc-indianoil', 'Fuel'),
  ('hdfc-indianoil', 'Grocery'),
  ('hdfc-indianoil', 'Dining'),
  ('sbi-aurum', 'Travel'),
  ('sbi-aurum', 'Lifestyle'),
  ('sbi-aurum', 'Dining'),
  ('sbi-aurum', 'International'),
  ('sbi-elite', 'Dining'),
  ('sbi-elite', 'Grocery'),
  ('sbi-elite', 'Shopping'),
  ('sbi-elite', 'Travel'),
  ('sbi-prime', 'Dining'),
  ('sbi-prime', 'Grocery'),
  ('sbi-prime', 'Shopping'),
  ('sbi-simplyclick', 'Amazon'),
  ('sbi-simplyclick', 'Food Delivery'),
  ('sbi-simplyclick', 'Travel'),
  ('sbi-simplyclick', 'Entertainment'),
  ('sbi-simplyclick', 'Online'),
  ('sbi-simplysave', 'Dining'),
  ('sbi-simplysave', 'Entertainment'),
  ('sbi-simplysave', 'Grocery'),
  ('sbi-simplysave', 'Shopping'),
  ('sbi-bpcl-octane', 'Fuel'),
  ('sbi-bpcl-octane', 'Grocery'),
  ('sbi-bpcl-octane', 'Dining'),
  ('sbi-bpcl-octane', 'Entertainment'),
  ('hdfc-infinia', 'Travel'),
  ('hdfc-infinia', 'Hotels'),
  ('hdfc-infinia', 'Lifestyle'),
  ('hdfc-infinia', 'Shopping'),
  ('hdfc-infinia', 'International'),
  ('icici-emeralde-private-metal', 'All Retail'),
  ('icici-emeralde-private-metal', 'Travel'),
  ('icici-emeralde-private-metal', 'Dining'),
  ('icici-emeralde-private-metal', 'International'),
  ('icici-emeralde', 'All Retail'),
  ('icici-emeralde', 'Travel'),
  ('icici-emeralde', 'Dining'),
  ('icici-emeralde', 'Shopping'),
  ('icici-sapphiro', 'Travel'),
  ('icici-sapphiro', 'Dining'),
  ('icici-sapphiro', 'Shopping'),
  ('icici-coral', 'Shopping'),
  ('icici-coral', 'Dining'),
  ('icici-coral', 'Entertainment'),
  ('icici-hpcl-super-saver', 'Fuel'),
  ('icici-hpcl-super-saver', 'Grocery'),
  ('icici-hpcl-super-saver', 'Utility'),
  ('axis-reserve', 'Travel'),
  ('axis-reserve', 'International'),
  ('axis-reserve', 'Lifestyle'),
  ('axis-reserve', 'Dining'),
  ('axis-select', 'Travel'),
  ('axis-select', 'Shopping'),
  ('axis-select', 'Entertainment'),
  ('axis-privilege', 'Travel'),
  ('axis-privilege', 'Entertainment'),
  ('axis-privilege', 'Shopping'),
  ('axis-neo', 'Fashion'),
  ('axis-neo', 'Food Delivery'),
  ('axis-neo', 'Dining'),
  ('axis-indianoil', 'Fuel'),
  ('axis-indianoil', 'Grocery'),
  ('axis-airtel', 'Telecom'),
  ('axis-airtel', 'Food Delivery'),
  ('axis-airtel', 'Grocery'),
  ('axis-atlas', 'Travel'),
  ('axis-atlas', 'Dining'),
  ('axis-atlas', 'Online'),
  ('axis-atlas', 'International'),
  ('kotak-white-reserve', 'Travel'),
  ('kotak-white-reserve', 'Lifestyle'),
  ('kotak-white-reserve', 'Shopping'),
  ('kotak-white-reserve', 'International'),
  ('kotak-cashback-plus', 'Grocery'),
  ('kotak-cashback-plus', 'Food Delivery'),
  ('kotak-cashback-plus', 'Entertainment'),
  ('kotak-cashback-plus', 'Fuel'),
  ('kotak-league-platinum', 'All Retail'),
  ('kotak-league-platinum', 'Online'),
  ('kotak-league-platinum', 'Offline'),
  ('yes-private', 'Online'),
  ('yes-private', 'Travel'),
  ('yes-private', 'Dining'),
  ('yes-private', 'Lifestyle'),
  ('yes-private', 'International'),
  ('yes-marquee', 'Online'),
  ('yes-marquee', 'Travel'),
  ('yes-marquee', 'Dining'),
  ('yes-marquee', 'International'),
  ('yes-premia', 'Online'),
  ('yes-premia', 'Shopping'),
  ('yes-premia', 'Dining'),
  ('idfc-first-select', 'Online'),
  ('idfc-first-select', 'Dining'),
  ('idfc-first-select', 'Retail'),
  ('idfc-first-select', 'International'),
  ('idfc-first-millennia', 'Online'),
  ('idfc-first-millennia', 'Entertainment'),
  ('idfc-first-millennia', 'Dining'),
  ('idfc-first-millennia', 'Retail'),
  ('idfc-first-power-hpcl', 'Fuel'),
  ('idfc-first-power-hpcl', 'Grocery'),
  ('idfc-first-power-hpcl', 'Utility'),
  ('indusind-pinnacle', 'Travel'),
  ('indusind-pinnacle', 'International'),
  ('indusind-pinnacle', 'Lifestyle'),
  ('indusind-pinnacle', 'Shopping'),
  ('indusind-legend', 'All Retail'),
  ('indusind-legend', 'Dining'),
  ('indusind-legend', 'Shopping'),
  ('indusind-legend', 'Travel'),
  ('indusind-platinum-aura-edge', 'All Retail'),
  ('indusind-platinum-aura-edge', 'Online'),
  ('indusind-platinum-aura-edge', 'Offline'),
  ('rbl-icon', 'Dining'),
  ('rbl-icon', 'Shopping'),
  ('rbl-icon', 'Travel'),
  ('rbl-nova', 'Travel'),
  ('rbl-nova', 'Lifestyle'),
  ('rbl-nova', 'Dining'),
  ('rbl-lumiere', 'Travel'),
  ('rbl-lumiere', 'Lifestyle'),
  ('sc-smart', 'Online'),
  ('sc-smart', 'All Retail'),
  ('sc-smart', 'Shopping'),
  ('sc-emirates', 'Travel'),
  ('sc-emirates', 'International'),
  ('sc-emirates', 'Emirates'),
  ('sc-emirates', 'Shopping'),
  ('federal-celesta', 'Travel'),
  ('federal-celesta', 'Lifestyle'),
  ('federal-celesta', 'Shopping'),
  ('federal-signet', 'All Retail'),
  ('federal-signet', 'Online'),
  ('federal-signet', 'Offline'),
  ('bob-premier', 'Travel'),
  ('bob-premier', 'Dining'),
  ('bob-premier', 'International'),
  ('bob-select', 'Online'),
  ('bob-select', 'Utility'),
  ('bob-select', 'Dining'),
  ('bob-cashback', 'Online'),
  ('bob-cashback', 'Shopping'),
  ('bob-cashback', 'Dining'),
  ('bob-cashback', 'Travel'),
  ('amex-platinum-travel', 'Travel'),
  ('amex-platinum-travel', 'Milestones'),
  ('amex-platinum-travel', 'Hotels'),
  ('amex-mrcc', 'Shopping'),
  ('amex-mrcc', 'Milestones'),
  ('amex-mrcc', 'Everyday Retail'),
  ('hdfc-tata-neu-plus', 'Tata Brands'),
  ('hdfc-tata-neu-plus', 'Grocery'),
  ('hdfc-tata-neu-plus', 'UPI'),
  ('hdfc-tata-neu-plus', 'Shopping'),
  ('axis-myzone', 'Dining'),
  ('axis-myzone', 'Entertainment'),
  ('axis-myzone', 'Shopping'),
  ('rbl-world-safari', 'Travel'),
  ('rbl-world-safari', 'Airlines'),
  ('rbl-world-safari', 'Hotels'),
  ('rbl-world-safari', 'International'),
  ('axis-horizon', 'Travel'),
  ('axis-horizon', 'Airlines'),
  ('kotak-air-plus', 'Travel'),
  ('kotak-air-plus', 'Hotels'),
  ('indusind-tiger', 'All eligible spends')
) AS t(card_slug, cat_name)
JOIN catalog_cards c ON c.slug = t.card_slug
JOIN catalog_benefit_categories cat ON LOWER(cat.name) = LOWER(t.cat_name)
ON CONFLICT (card_id, category_id) DO NOTHING;


-- 2. Full Review Articles
INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'equitas-selfe',
  (SELECT id FROM catalog_cards WHERE slug = 'equitas-selfe' LIMIT 1),
  'The 10% Secret: Why Equitas Selfe Might Be India''s Most Underrated Credit Card 💳 🇮🇳',
  'By Yash Sartanpara • Jan 18, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'bob-eterna',
  (SELECT id FROM catalog_cards WHERE slug = 'bob-eterna' LIMIT 1),
  'BoB Eterna: The Maximizer’s Guide to 3.75% Valueback & Forex Profits 🏦',
  'By Yash Sartanpara • Mar 23, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'hdfc-marriott-bonvoy',
  (SELECT id FROM catalog_cards WHERE slug = 'hdfc-marriott-bonvoy' LIMIT 1),
  'HDFC Bank Marriott Bonvoy Credit Card Review: Free Night Awards, Silver Elite Status & FNA Masterclass',
  'By Yash Sartanpara · Updated April 6, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'regalia-gold',
  (SELECT id FROM catalog_cards WHERE slug = 'hdfc-regalia-gold' LIMIT 1),
  'HDFC Regalia Gold: The Premium Travel Card That Pays For Itself 🏆',
  'By Yash Sartanpara • Mar 24, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'yes-reserv',
  (SELECT id FROM catalog_cards WHERE slug = 'yes-reserv' LIMIT 1),
  'YES RESERV Strategy: How to Turn a Standard Card into a 6–9% Reward Machine 🏦',
  'By Yash Sartanpara • Mar 24, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'scapia',
  (SELECT id FROM catalog_cards WHERE slug = 'scapia' LIMIT 1),
  'Scapia Review · 4% on Travel, 2% Everywhere, Lifetime Free ✈️',
  'By Yash Sartanpara · Mar 25, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'amex-platinum-charge',
  (SELECT id FROM catalog_cards WHERE slug = 'amex-platinum-charge' LIMIT 1),
  'American Express Platinum Charge Card Review: Unlimited Lounges, Four Hotel Statuses & Fine Hotels + Resorts',
  'By Yash Sartanpara · Updated April 6, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'times-black',
  (SELECT id FROM catalog_cards WHERE slug = 'times-black-icici' LIMIT 1),
  'Times Black ICICI Bank Credit Card Review: Luxury Travel, Lounge, and Milestone Value',
  'By Yash Sartanpara · Updated April 3, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'au-lit',
  (SELECT id FROM catalog_cards WHERE slug = 'au-lit' LIMIT 1),
  'AU Lit Credit Card: Build-Your-Own Cashback Card',
  'By Yash Sartanpara · Jul 14, 2025',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'sbi-cashback',
  NULL,
  'SBI Cashback Card Review · Devalued April 2026',
  'By Yash Sartanpara · Apr 2, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'sbi-phonepe-select-black',
  NULL,
  'PhonePe SBI Card SELECT BLACK Review · 10% on PhonePe, 5% Online, 1% UPI',
  'By Yash Sartanpara · Updated April 10, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'hdfc-swiggy',
  NULL,
  'Swiggy HDFC Bank Credit Card Review · 10% Cashback + 5% Online',
  'By Yash Sartanpara · Updated April 10, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'axis-cashback',
  (SELECT id FROM catalog_cards WHERE slug = 'axis-cashback' LIMIT 1),
  'Axis Bank Cashback Credit Card · Up to 7% Online Cashback Reviewed',
  'By Yash Sartanpara · Jun 3, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'axis-magnus',
  NULL,
  'Axis Bank Magnus Credit Card Review 2026 · 35 ER Acceleration, No Renewal Benefits, and the Devaluations Explained',
  'By Yash Sartanpara · Updated April 14, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'axis-magnus-burgundy',
  NULL,
  'Axis Bank Magnus for Burgundy Review 2026 · Best Miles Transfer Ratio in India, 35 ER Acceleration, 4 Meet & Greet',
  'By Yash Sartanpara · Updated April 14, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'hsbc-premier',
  (SELECT id FROM catalog_cards WHERE slug = 'hsbc-premier' LIMIT 1),
  'HSBC Premier Credit Card Review · 0.99% Forex, Unlimited Lounges, 1:1 Miles',
  'By Yash Sartanpara · April 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'hsbc-travelone',
  (SELECT id FROM catalog_cards WHERE slug = 'hsbc-travelone' LIMIT 1),
  'HSBC TravelOne Credit Card Review · 1:1 Miles, OTA Multipliers, Chauffeur Transfers',
  'By Yash Sartanpara · April 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'hsbc-live-plus',
  (SELECT id FROM catalog_cards WHERE slug = 'hsbc-live-plus' LIMIT 1),
  'HSBC Live+ Credit Card Review · 10% Dining Cashback, 1.5% Unlimited Retail',
  'By Yash Sartanpara · April 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'hsbc-rupay-platinum',
  (SELECT id FROM catalog_cards WHERE slug = 'hsbc-rupay-platinum' LIMIT 1),
  'HSBC RuPay Platinum Credit Card Review · Lifetime Free, UPI-Enabled, Miles Transfer',
  'By Yash Sartanpara · April 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'bob-etihad-guest-premium',
  (SELECT id FROM catalog_cards WHERE slug = 'bob-etihad-guest-premium' LIMIT 1),
  'BOB Etihad Guest Premium Credit Card · 6 Miles/₹100 on Etihad, Free Lounge, Gold Tier Reviewed',
  'By Yash Sartanpara · Jun 29, 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  'salaryse-levelup',
  (SELECT id FROM catalog_cards WHERE slug = 'salaryse-levelup' LIMIT 1),
  'SalarySe LevelUp Credit Card Review · 7.5% Salary Day Bonus, RuPay UPI Rewards',
  'By Yash Sartanpara · August 2026',
  '2026-09-14',
  '',
  NULL,
  NULL,
  '{}'::text[],
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;

