import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT_DIR, 'scripts/data/transformed');
const SEED_DIR = resolve(ROOT_DIR, 'supabase/seed_phases');

if (!existsSync(SEED_DIR)) {
  mkdirSync(SEED_DIR, { recursive: true });
}

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return isNaN(val) ? 'NULL' : String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return "'{}'::text[]";
    const escapedItems = val.map(item => `'${String(item).replace(/'/g, "''")}'`);
    return `ARRAY[${escapedItems.join(', ')}]::text[]`;
  }
  // string
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1: Schema + Categories + MCC Codes
// ─────────────────────────────────────────────────────────────────────────────
function generatePhase1() {
  let sql = `-- =============================================================================
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
`;
  return sql;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2A & 2B: Credit Cards (split in half: 1..40 and 41..81)
// ─────────────────────────────────────────────────────────────────────────────
function generateCardSql(cardsChunk, phaseNum, totalPhases, startIdx, endIdx) {
  let sql = `-- =============================================================================
-- PHASE ${phaseNum} / ${totalPhases}: Credit Cards Batch (${startIdx} to ${endIdx})
-- =============================================================================\n\n`;

  for (const c of cardsChunk) {
    sql += `INSERT INTO catalog_cards (
  slug, name, bank, network, fee_type, fee_label,
  annual_fee, joining_fee, fee_waiver_spend, fee_waiver_label,
  forex_markup, point_value, rewards_cycle, short_description,
  thumbnail_url, card_image_url, affiliate_url, full_review_slug,
  key_perks, joining_benefits, renewal_benefits, earns_on, does_not_earn_on,
  lounge_access, lounge_domestic, lounge_international, is_featured, is_published, launched_at
) VALUES (
  ${escapeSql(c.slug)},
  ${escapeSql(c.name)},
  ${escapeSql(c.bank)},
  ${escapeSql(c.network)},
  ${escapeSql(c.fee_type)},
  ${escapeSql(c.fee_label)},
  ${escapeSql(c.annual_fee ?? 0)},
  ${escapeSql(c.joining_fee ?? 0)},
  ${escapeSql(c.fee_waiver_spend)},
  ${escapeSql(c.fee_waiver_label)},
  ${escapeSql(c.forex_markup)},
  ${escapeSql(c.point_value)},
  ${escapeSql(c.rewards_cycle)},
  ${escapeSql(c.short_description)},
  ${escapeSql(c.thumbnail_url)},
  ${escapeSql(c.thumbnail_url)},
  ${escapeSql(c.affiliate_url)},
  ${escapeSql(c.full_review_slug)},
  ${escapeSql(c.key_perks ?? [])},
  ${escapeSql(c.joining_benefits ?? [])},
  ${escapeSql(c.renewal_benefits ?? [])},
  ${escapeSql(c.earns_on ?? [])},
  ${escapeSql(c.does_not_earn_on ?? [])},
  ${escapeSql(c.lounge_access ?? false)},
  ${escapeSql(c.lounge_domestic ?? null)},
  ${escapeSql(c.lounge_international ?? null)},
  ${escapeSql(c.is_featured ?? false)},
  TRUE,
  CURRENT_DATE
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  bank = EXCLUDED.bank,
  network = EXCLUDED.network,
  fee_type = EXCLUDED.fee_type,
  fee_label = EXCLUDED.fee_label,
  annual_fee = EXCLUDED.annual_fee,
  joining_fee = EXCLUDED.joining_fee,
  fee_waiver_spend = EXCLUDED.fee_waiver_spend,
  fee_waiver_label = EXCLUDED.fee_waiver_label,
  forex_markup = EXCLUDED.forex_markup,
  point_value = EXCLUDED.point_value,
  rewards_cycle = EXCLUDED.rewards_cycle,
  short_description = EXCLUDED.short_description,
  thumbnail_url = EXCLUDED.thumbnail_url,
  card_image_url = EXCLUDED.card_image_url,
  affiliate_url = EXCLUDED.affiliate_url,
  full_review_slug = EXCLUDED.full_review_slug,
  key_perks = EXCLUDED.key_perks,
  joining_benefits = EXCLUDED.joining_benefits,
  renewal_benefits = EXCLUDED.renewal_benefits,
  earns_on = EXCLUDED.earns_on,
  does_not_earn_on = EXCLUDED.does_not_earn_on,
  is_featured = EXCLUDED.is_featured;\n\n`;
  }
  return sql;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3: Card Categories Join & Review Articles
// ─────────────────────────────────────────────────────────────────────────────
function generatePhase3(cards) {
  let sql = `-- =============================================================================
-- PHASE 4 / 5: Card Categories & 21 Full Review Articles
-- =============================================================================\n\n`;

  sql += `-- 1. Card ↔ Category relationships (Single fast batch query)\n`;
  const pairs = [];
  for (const c of cards) {
    const cats = c.reward_categories ?? c.categories ?? [];
    for (const cat of cats) {
      pairs.push(`  (${escapeSql(c.slug)}, ${escapeSql(cat)})`);
    }
  }

  if (pairs.length > 0) {
    sql += `INSERT INTO catalog_card_categories (card_id, category_id)
SELECT c.id, cat.id
FROM (
  VALUES
${pairs.join(',\n')}
) AS t(card_slug, cat_name)
JOIN catalog_cards c ON c.slug = t.card_slug
JOIN catalog_benefit_categories cat ON LOWER(cat.name) = LOWER(t.cat_name)
ON CONFLICT (card_id, category_id) DO NOTHING;\n\n`;
  }

  sql += `\n-- 2. Full Review Articles\n`;
  if (existsSync(`${DATA_DIR}/articles.json`)) {
    const articles = JSON.parse(readFileSync(`${DATA_DIR}/articles.json`, 'utf-8'));
    for (const a of articles) {
      sql += `INSERT INTO catalog_articles (
  slug, card_id, title, author, published_at, content, summary, thumbnail_url, tags, is_published
) VALUES (
  ${escapeSql(a.slug)},
  ${a.card_slug ? `(SELECT id FROM catalog_cards WHERE slug = ${escapeSql(a.card_slug)} LIMIT 1)` : 'NULL'},
  ${escapeSql(a.title)},
  ${escapeSql(a.author ?? 'CaptainTorch Team')},
  ${escapeSql(a.published_at)},
  ${escapeSql(a.content)},
  ${escapeSql(a.summary ?? null)},
  ${escapeSql(a.thumbnail_url)},
  ${escapeSql(a.tags ?? [])},
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  card_id = EXCLUDED.card_id;\n\n`;
    }
  }
  return sql;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 4: Offers, Merchant Tips, Guides & Loyalty Programs
// ─────────────────────────────────────────────────────────────────────────────
function generatePhase4() {
  let sql = `-- =============================================================================
-- PHASE 5 / 5: Offers, Merchant Tips, Strategy Guides, Hotels, Airlines, Lifestyle
-- =============================================================================\n\n`;

  // Offers
  sql += `-- 1. Active Offers\n`;
  if (existsSync(`${DATA_DIR}/offers.json`)) {
    const offers = JSON.parse(readFileSync(`${DATA_DIR}/offers.json`, 'utf-8'));
    for (const o of offers) {
      sql += `INSERT INTO catalog_offers (
  title, description, merchant, discount_value, expiry_date, no_end_date, is_featured, affiliate_url
) VALUES (
  ${escapeSql(o.title)},
  ${escapeSql(o.description)},
  ${escapeSql(o.merchant)},
  ${escapeSql(o.discount_value)},
  ${escapeSql(o.expiry_date)},
  ${escapeSql(o.no_end_date ?? false)},
  ${escapeSql(o.is_featured ?? false)},
  ${escapeSql(o.affiliate_url)}
);\n`;
    }
  }

  // Merchant Tips
  sql += `\n-- 2. Merchant Tips\n`;
  if (existsSync(`${DATA_DIR}/merchants.json`)) {
    const merchants = JSON.parse(readFileSync(`${DATA_DIR}/merchants.json`, 'utf-8'));
    for (const m of merchants) {
      sql += `INSERT INTO catalog_merchant_tips (
  merchant_name, merchant_slug, merchant_emoji, mcc, category, tip_text, full_tip, exclusions
) VALUES (
  ${escapeSql(m.merchant_name)},
  ${escapeSql(m.merchant_slug)},
  ${escapeSql(m.merchant_emoji ?? '🏪')},
  ${escapeSql(m.mcc ?? null)},
  ${escapeSql(m.category ?? null)},
  ${escapeSql(m.tip_text ?? null)},
  ${escapeSql(m.full_tip ?? null)},
  ${escapeSql(m.exclusions ?? null)}
) ON CONFLICT (merchant_slug) DO UPDATE SET
  merchant_name = EXCLUDED.merchant_name,
  merchant_emoji = EXCLUDED.merchant_emoji,
  mcc = EXCLUDED.mcc,
  category = EXCLUDED.category,
  tip_text = EXCLUDED.tip_text,
  full_tip = EXCLUDED.full_tip,
  exclusions = EXCLUDED.exclusions;\n`;
    }
  }

  // Guides
  sql += `\n-- 3. Strategy Guides\n`;
  if (existsSync(`${DATA_DIR}/guides.json`)) {
    const guides = JSON.parse(readFileSync(`${DATA_DIR}/guides.json`, 'utf-8'));
    for (const g of guides) {
      sql += `INSERT INTO catalog_guides (
  slug, title, section, sub_section, summary, content, thumbnail_url, tags, is_featured, sort_order
) VALUES (
  ${escapeSql(g.slug)},
  ${escapeSql(g.title)},
  ${escapeSql(g.section)},
  ${escapeSql(g.sub_section)},
  ${escapeSql(g.summary)},
  ${escapeSql(g.content)},
  ${escapeSql(g.thumbnail_url)},
  ${escapeSql(g.tags ?? [])},
  ${escapeSql(g.is_featured ?? false)},
  ${escapeSql(g.sort_order ?? 0)}
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  section = EXCLUDED.section,
  sub_section = EXCLUDED.sub_section,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order;\n`;
    }
  }

  // Hotel Programs
  sql += `\n-- 4. Hotel Loyalty Programs\n`;
  if (existsSync(`${DATA_DIR}/hotel-programs.json`)) {
    const hotels = JSON.parse(readFileSync(`${DATA_DIR}/hotel-programs.json`, 'utf-8'));
    for (const h of hotels) {
      sql += `INSERT INTO catalog_hotel_programs (
  name, brand, logo_url, description, benefits, program_url
) VALUES (
  ${escapeSql(h.name)},
  ${escapeSql(h.brand)},
  ${escapeSql(h.logo_url)},
  ${escapeSql(h.description)},
  ${escapeSql(h.benefits ?? [])},
  ${escapeSql(h.program_url)}
);\n`;
    }
  }

  // Airline Programs
  sql += `\n-- 5. Airline Programs\n`;
  if (existsSync(`${DATA_DIR}/airline-programs.json`)) {
    const airlines = JSON.parse(readFileSync(`${DATA_DIR}/airline-programs.json`, 'utf-8'));
    for (const a of airlines) {
      sql += `INSERT INTO catalog_airline_programs (
  name, airline, logo_url, description, benefits, program_url
) VALUES (
  ${escapeSql(a.name)},
  ${escapeSql(a.airline)},
  ${escapeSql(a.logo_url)},
  ${escapeSql(a.description)},
  ${escapeSql(a.benefits ?? [])},
  ${escapeSql(a.program_url)}
);\n`;
    }
  }

  // Lifestyle Brands
  sql += `\n-- 6. Lifestyle Brands\n`;
  if (existsSync(`${DATA_DIR}/lifestyle-brands.json`)) {
    const lifestyle = JSON.parse(readFileSync(`${DATA_DIR}/lifestyle-brands.json`, 'utf-8'));
    for (const l of lifestyle) {
      sql += `INSERT INTO catalog_lifestyle_brands (
  name, category, logo_url, description, benefits, brand_url
) VALUES (
  ${escapeSql(l.name)},
  ${escapeSql(l.category)},
  ${escapeSql(l.logo_url)},
  ${escapeSql(l.description)},
  ${escapeSql(l.benefits ?? [])},
  ${escapeSql(l.brand_url)}
);\n`;
    }
  }

  return sql;
}

function run() {
  const cards = JSON.parse(readFileSync(`${DATA_DIR}/cards.json`, 'utf-8'));
  const half = Math.ceil(cards.length / 2);
  const cardsPart1 = cards.slice(0, half);
  const cardsPart2 = cards.slice(half);

  const phase1Sql = generatePhase1();
  const phase2Sql = generateCardSql(cardsPart1, 2, 5, 1, half);
  const phase3Sql = generateCardSql(cardsPart2, 3, 5, half + 1, cards.length);
  const phase4Sql = generatePhase3(cards);
  const phase5Sql = generatePhase4();

  // Write separate phase files
  writeFileSync(resolve(ROOT_DIR, 'supabase/phase1_schema_mcc.sql'), phase1Sql);
  writeFileSync(resolve(ROOT_DIR, 'supabase/phase2_cards_1_to_41.sql'), phase2Sql);
  writeFileSync(resolve(ROOT_DIR, 'supabase/phase3_cards_42_to_81.sql'), phase3Sql);
  writeFileSync(resolve(ROOT_DIR, 'supabase/phase4_articles_categories.sql'), phase4Sql);
  writeFileSync(resolve(ROOT_DIR, 'supabase/phase5_guides_merchants_loyalty.sql'), phase5Sql);

  // Combine into single phase-divided master file
  const masterSql = `${phase1Sql}\n\n${phase2Sql}\n\n${phase3Sql}\n\n${phase4Sql}\n\n${phase5Sql}`;
  writeFileSync(resolve(ROOT_DIR, 'supabase/captaintorch_seed.sql'), masterSql);

  console.log('✓ Successfully generated 5 separate phase files and updated master seed file.');
}

run();
