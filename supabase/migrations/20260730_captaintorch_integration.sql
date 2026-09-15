-- ─── 1. Catalog Cards ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bank TEXT NOT NULL,
  network TEXT,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('LTF','FYF','paid')),
  fee_label TEXT,
  annual_fee INTEGER DEFAULT 0,
  joining_fee INTEGER DEFAULT 0,
  fee_waiver_spend INTEGER,
  fee_waiver_label TEXT,
  forex_markup TEXT,
  point_value TEXT,
  rewards_cycle TEXT,
  short_description TEXT,
  thumbnail_url TEXT,
  card_image_url TEXT,
  affiliate_url TEXT,
  full_review_slug TEXT,
  key_perks TEXT[] DEFAULT '{}',
  joining_benefits TEXT[] DEFAULT '{}',
  renewal_benefits TEXT[] DEFAULT '{}',
  earns_on TEXT[] DEFAULT '{}',
  does_not_earn_on TEXT[] DEFAULT '{}',
  lounge_access BOOLEAN DEFAULT false,
  lounge_domestic TEXT,
  lounge_international TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  launched_at DATE DEFAULT CURRENT_DATE,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  update_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. Benefit Categories ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_benefit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT DEFAULT 'gray'
);

-- ─── 3. Card ↔ Category ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_card_categories (
  card_id UUID REFERENCES catalog_cards(id) ON DELETE CASCADE,
  category_id UUID REFERENCES catalog_benefit_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, category_id)
);

-- ─── 4. Offers ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES catalog_cards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  merchant TEXT,
  discount_value TEXT,
  min_transaction INTEGER DEFAULT 0,
  max_discount INTEGER,
  expiry_date DATE,
  no_end_date BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  affiliate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 5. MCC Codes ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mcc_codes (
  mcc TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT,
  is_excluded_by_default BOOLEAN DEFAULT false
);

-- ─── 6. Card MCC Reward Rates ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_card_mcc_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES catalog_cards(id) ON DELETE CASCADE,
  mcc TEXT REFERENCES mcc_codes(mcc),
  reward_rate NUMERIC(5,2),
  reward_type TEXT DEFAULT 'points',
  cap_per_month NUMERIC,
  notes TEXT,
  UNIQUE (card_id, mcc)
);

-- ─── 7. Guides ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('merchants','rewards','hotels','airlines','lifestyle')),
  sub_section TEXT,
  summary TEXT,
  content TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  launched_at DATE DEFAULT CURRENT_DATE,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 8. Merchant Tips ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_merchant_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_name TEXT NOT NULL,
  merchant_slug TEXT UNIQUE NOT NULL,
  merchant_emoji TEXT DEFAULT '🏪',
  mcc TEXT REFERENCES mcc_codes(mcc),
  category TEXT,
  tip_text TEXT,
  full_tip TEXT,
  best_card_ids UUID[] DEFAULT '{}',
  exclusions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 9. Articles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  card_id UUID REFERENCES catalog_cards(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  author TEXT DEFAULT 'KYCc Team',
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  content TEXT,
  summary TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 10. Hotel Programs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_hotel_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  benefits TEXT[] DEFAULT '{}',
  linked_card_ids UUID[] DEFAULT '{}',
  program_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 11. Airline Programs ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_airline_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  airline TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  benefits TEXT[] DEFAULT '{}',
  linked_card_ids UUID[] DEFAULT '{}',
  program_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 12. Lifestyle Brands ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_lifestyle_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  logo_url TEXT,
  description TEXT,
  benefits TEXT[] DEFAULT '{}',
  linked_card_ids UUID[] DEFAULT '{}',
  brand_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 13. Calculator Configs ──────────────────────────────────────────────────
-- spend_categories shape: [{"name":"Utility","mccs":["4814","4900"],"rate":10,"cap_monthly":null,"type":"points"}]
-- tiers shape: [{"name":"Diamond","min_quarterly_spend":300000,"point_value_paise":100}]
CREATE TABLE IF NOT EXISTS catalog_calculator_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID UNIQUE REFERENCES catalog_cards(id) ON DELETE CASCADE,
  spend_categories JSONB NOT NULL DEFAULT '[]',
  base_rate NUMERIC(5,2) DEFAULT 1.00,
  point_value_paise NUMERIC(8,4) DEFAULT 100,
  annual_fee INTEGER DEFAULT 0,
  fee_waiver_spend INTEGER,
  tiers JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 14. Weekly Updates / Changelog ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_card_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES catalog_cards(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL CHECK (update_type IN (
    'new_card','benefit_change','fee_change',
    'offer_update','merchant_tip','terms_change','mcc_update'
  )),
  headline TEXT NOT NULL,
  details TEXT,
  effective_date DATE DEFAULT CURRENT_DATE,
  is_significant BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_catalog_cards_slug     ON catalog_cards(slug);
CREATE INDEX IF NOT EXISTS idx_catalog_cards_bank     ON catalog_cards(bank);
CREATE INDEX IF NOT EXISTS idx_catalog_cards_featured ON catalog_cards(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_catalog_cards_launched ON catalog_cards(launched_at DESC);
CREATE INDEX IF NOT EXISTS idx_catalog_cards_updated  ON catalog_cards(last_updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_catalog_offers_card    ON catalog_offers(card_id);
CREATE INDEX IF NOT EXISTS idx_catalog_offers_expiry  ON catalog_offers(expiry_date);
CREATE INDEX IF NOT EXISTS idx_catalog_guides_section ON catalog_guides(section);
CREATE INDEX IF NOT EXISTS idx_catalog_merchant_slug  ON catalog_merchant_tips(merchant_slug);
CREATE INDEX IF NOT EXISTS idx_catalog_articles_slug  ON catalog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_catalog_articles_card  ON catalog_articles(card_id);
CREATE INDEX IF NOT EXISTS idx_catalog_updates_card   ON catalog_card_updates(card_id);
CREATE INDEX IF NOT EXISTS idx_catalog_updates_date   ON catalog_card_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcc_category           ON mcc_codes(category);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE catalog_cards              ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_benefit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_card_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_offers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcc_codes                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_card_mcc_rewards   ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_guides             ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_merchant_tips      ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_articles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_hotel_programs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_airline_programs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_lifestyle_brands   ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_calculator_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_card_updates       ENABLE ROW LEVEL SECURITY;

-- Drop existing select policies if they exist before creating
DROP POLICY IF EXISTS "auth_read_catalog_cards" ON catalog_cards;
CREATE POLICY "auth_read_catalog_cards"
  ON catalog_cards FOR SELECT TO authenticated USING (is_published = true);

DROP POLICY IF EXISTS "auth_read_catalog_benefit_categories" ON catalog_benefit_categories;
CREATE POLICY "auth_read_catalog_benefit_categories"
  ON catalog_benefit_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_read_catalog_card_categories" ON catalog_card_categories;
CREATE POLICY "auth_read_catalog_card_categories"
  ON catalog_card_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_read_catalog_offers" ON catalog_offers;
CREATE POLICY "auth_read_catalog_offers"
  ON catalog_offers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_read_mcc_codes" ON mcc_codes;
CREATE POLICY "auth_read_mcc_codes"
  ON mcc_codes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_read_catalog_card_mcc_rewards" ON catalog_card_mcc_rewards;
CREATE POLICY "auth_read_catalog_card_mcc_rewards"
  ON catalog_card_mcc_rewards FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_read_catalog_guides" ON catalog_guides;
CREATE POLICY "auth_read_catalog_guides"
  ON catalog_guides FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_read_catalog_merchant_tips" ON catalog_merchant_tips;
CREATE POLICY "auth_read_catalog_merchant_tips"
  ON catalog_merchant_tips FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_read_catalog_articles" ON catalog_articles;
CREATE POLICY "auth_read_catalog_articles"
  ON catalog_articles FOR SELECT TO authenticated USING (is_published = true);

DROP POLICY IF EXISTS "auth_read_catalog_hotel_programs" ON catalog_hotel_programs;
CREATE POLICY "auth_read_catalog_hotel_programs"
  ON catalog_hotel_programs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_read_catalog_airline_programs" ON catalog_airline_programs;
CREATE POLICY "auth_read_catalog_airline_programs"
  ON catalog_airline_programs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_read_catalog_lifestyle_brands" ON catalog_lifestyle_brands;
CREATE POLICY "auth_read_catalog_lifestyle_brands"
  ON catalog_lifestyle_brands FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_read_catalog_calculator_configs" ON catalog_calculator_configs;
CREATE POLICY "auth_read_catalog_calculator_configs"
  ON catalog_calculator_configs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_read_catalog_card_updates" ON catalog_card_updates;
CREATE POLICY "auth_read_catalog_card_updates"
  ON catalog_card_updates FOR SELECT TO authenticated USING (true);

-- ─── Seed: Benefit Categories ────────────────────────────────────────────────
INSERT INTO catalog_benefit_categories (name, icon, color) VALUES
  ('Apparel','👗','pink'), ('Utility','⚡','yellow'), ('Grocery','🛒','green'),
  ('Online','🛍️','purple'), ('Travel','✈️','blue'), ('Dining','🍽️','orange'),
  ('International','🌍','teal'), ('Hotels','🏨','indigo'),
  ('Fuel','⛽','red'), ('Entertainment','🎬','violet'), ('Fitness','💪','lime')
ON CONFLICT (name) DO NOTHING;

-- ─── Seed: MCC Codes ─────────────────────────────────────────────────────────
INSERT INTO mcc_codes (mcc, description, category) VALUES
  ('4121','Taxicabs and Limousines (Uber, Ola)','transport'),
  ('4814','Telecommunication Services (Vi, Jio, Airtel)','utilities'),
  ('4816','Computer Network Services','utilities'),
  ('4829','Money Transfer','finance'),
  ('4900','Electric, Gas, Water Utilities','utilities'),
  ('5045','Computers, Peripherals, Software','electronics'),
  ('5262','Marketplaces (Amazon, Flipkart)','online'),
  ('5311','Department Stores','apparel'),
  ('5399','Misc General Merchandise','grocery'),
  ('5411','Grocery Stores, Supermarkets','grocery'),
  ('5441','Candy, Nut, Confectionery Stores','grocery'),
  ('5451','Dairy Products Stores','grocery'),
  ('5462','Bakeries','dining'),
  ('5499','Misc Food Stores','grocery'),
  ('5541','Service Stations (Fuel)','fuel'),
  ('5542','Automated Fuel Dispensers','fuel'),
  ('5611','Men''s and Boy''s Clothing','apparel'),
  ('5621','Women''s Ready-to-Wear','apparel'),
  ('5631','Women''s Accessory Shops','apparel'),
  ('5641','Children''s and Infants'' Wear','apparel'),
  ('5651','Family Clothing Stores (Ajio — RELIANCE RETAIL LTD)','apparel'),
  ('5655','Sports and Riding Apparel','apparel'),
  ('5691','Men''s and Women''s Clothing (Myntra, Ajio alt)','apparel'),
  ('5699','Misc Apparel — often NOT eligible for 5X','apparel'),
  ('5732','Electronics Sales','electronics'),
  ('5812','Eating Places and Restaurants','dining'),
  ('5814','Fast Food Restaurants','dining'),
  ('5912','Drug Stores, Pharmacies','health'),
  ('6012','Member Financial Institutions','finance'),
  ('6051','Non-Financial Institutions','finance'),
  ('6513','Real Estate Agents and Managers','real_estate'),
  ('7011','Hotels, Motels, Resorts','hotels'),
  ('7832','Motion Picture Theaters','entertainment'),
  ('8011','Doctors and Physicians','health'),
  ('8099','Health Practitioners','health')
ON CONFLICT (mcc) DO NOTHING;

UPDATE mcc_codes SET is_excluded_by_default = true
WHERE mcc IN ('4829','6012','6051','6513');
