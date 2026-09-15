-- =============================================================================
-- PHASE 4B: 21 Card Review Articles
-- =============================================================================

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

