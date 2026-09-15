-- =============================================================================
-- PHASE 1 / 5: Schema Definitions, RLS, Categories, & MCC Codes (~300 lines)
-- Run this phase FIRST in Supabase SQL Editor.
-- =============================================================================

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

CREATE TABLE IF NOT EXISTS catalog_benefit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT DEFAULT 'gray'
);

CREATE TABLE IF NOT EXISTS catalog_card_categories (
  card_id UUID REFERENCES catalog_cards(id) ON DELETE CASCADE,
  category_id UUID REFERENCES catalog_benefit_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, category_id)
);

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

CREATE TABLE IF NOT EXISTS mcc_codes (
  mcc TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT,
  is_excluded_by_default BOOLEAN DEFAULT false
);

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

CREATE TABLE IF NOT EXISTS catalog_card_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES catalog_cards(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL CHECK (update_type IN (
    'new_card','benefit_change','fee_change',
    'offer_update','merchant_tip','terms_change','mcc_update'
  )),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  detail TEXT,
  effective_date DATE,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE catalog_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_benefit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_card_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcc_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_card_mcc_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_merchant_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_hotel_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_airline_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_lifestyle_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_calculator_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_card_updates ENABLE ROW LEVEL SECURITY;

-- Read policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read catalog_cards') THEN
    CREATE POLICY "Public read catalog_cards" ON catalog_cards FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read catalog_benefit_categories') THEN
    CREATE POLICY "Public read catalog_benefit_categories" ON catalog_benefit_categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read catalog_card_categories') THEN
    CREATE POLICY "Public read catalog_card_categories" ON catalog_card_categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read catalog_offers') THEN
    CREATE POLICY "Public read catalog_offers" ON catalog_offers FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read mcc_codes') THEN
    CREATE POLICY "Public read mcc_codes" ON mcc_codes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read catalog_card_mcc_rewards') THEN
    CREATE POLICY "Public read catalog_card_mcc_rewards" ON catalog_card_mcc_rewards FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read catalog_guides') THEN
    CREATE POLICY "Public read catalog_guides" ON catalog_guides FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read catalog_merchant_tips') THEN
    CREATE POLICY "Public read catalog_merchant_tips" ON catalog_merchant_tips FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read catalog_articles') THEN
    CREATE POLICY "Public read catalog_articles" ON catalog_articles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read catalog_hotel_programs') THEN
    CREATE POLICY "Public read catalog_hotel_programs" ON catalog_hotel_programs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read catalog_airline_programs') THEN
    CREATE POLICY "Public read catalog_airline_programs" ON catalog_airline_programs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read catalog_lifestyle_brands') THEN
    CREATE POLICY "Public read catalog_lifestyle_brands" ON catalog_lifestyle_brands FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read catalog_calculator_configs') THEN
    CREATE POLICY "Public read catalog_calculator_configs" ON catalog_calculator_configs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read catalog_card_updates') THEN
    CREATE POLICY "Public read catalog_card_updates" ON catalog_card_updates FOR SELECT USING (true);
  END IF;
END $$;

-- Benefit Categories
INSERT INTO catalog_benefit_categories (name, icon, color) VALUES
  ('Travel', 'Plane', 'blue'),
  ('Shopping', 'ShoppingBag', 'indigo'),
  ('Dining', 'Utensils', 'orange'),
  ('Fuel', 'Fuel', 'amber'),
  ('Cashback', 'BadgePercent', 'emerald'),
  ('Lounge Access', 'Coffee', 'teal'),
  ('Movie & Entertainment', 'Film', 'purple'),
  ('Golf', 'Flag', 'green'),
  ('International / Forex', 'Globe', 'cyan'),
  ('Rewards / Points', 'Gift', 'rose'),
  ('UPI / RuPay', 'QrCode', 'violet'),
  ('Super Premium', 'Crown', 'yellow'),
  ('Entry Level / LTF', 'ShieldCheck', 'slate')
ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color;

-- MCC Codes
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5411', 'Grocery Stores and Supermarkets', 'grocery', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5812', 'Eating Places and Restaurants', 'dining', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5814', 'Fast Food Restaurants', 'dining', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5651', 'Family Clothing Stores', 'apparel', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5691', 'Men''s and Women''s Clothing Stores / Misc Apparel', 'apparel', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5699', 'Miscellaneous and Specialty Retail', 'shopping', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5399', 'Misc General Merchandise / Online Marketplace', 'shopping', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5311', 'Department Stores', 'shopping', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5262', 'Marketplaces / E-Commerce Online Platforms', 'shopping', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5944', 'Jewelry, Watch, Clock, and Silverware Stores', 'jewelry', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5947', 'Gift, Card, Novelty, and Souvenir Shops', 'gift_cards', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5499', 'Misc Food Stores - Convenience Stores & Quick Commerce', 'grocery', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5541', 'Service Stations / Fuel', 'fuel', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5542', 'Automated Fuel Dispensers', 'fuel', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('4900', 'Utilities - Electric, Gas, Water, Sanitary', 'utility', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('4814', 'Telecommunication Services', 'utility', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('7011', 'Hotels, Motels, Resorts', 'hotels', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('4511', 'Airlines and Air Carriers', 'travel', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('7832', 'Motion Picture Theatres', 'entertainment', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('4121', 'Taxicabs and Limousines (Ride Hailing)', 'travel', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5732', 'Electronic Sales', 'electronics', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('5999', 'Miscellaneous and Specialty Retail Stores', 'shopping', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('6540', 'POI Funding Transactions / Wallet Reload', 'wallet', TRUE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('6513', 'Real Estate Agents / Rent Payments', 'rent', TRUE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('6211', 'Security Brokers / Dealers (Trading & Investments)', 'investments', TRUE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('6300', 'Insurance Underwriting, Premiums', 'insurance', FALSE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('8211', 'Elementary and Secondary Schools', 'education', TRUE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('8220', 'Colleges, Universities', 'education', TRUE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('9399', 'Government Services - Not Elsewhere Classified', 'government', TRUE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES ('9311', 'Tax Payments', 'government', TRUE) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;
