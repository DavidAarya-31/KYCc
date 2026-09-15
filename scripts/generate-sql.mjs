import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT_DIR, 'scripts/data/transformed');

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

function generate() {
  let sql = `-- =============================================================================
-- KYCc — CaptainTorch Catalog Schema & Full Seed Data
-- Run this entire script in your Supabase Dashboard -> SQL Editor
-- =============================================================================

-- 1. Schema Definitions (Tables, Indexes, RLS)
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

-- Enable RLS on all tables
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

-- Read policies for public access
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

-- =============================================================================
-- 2. Seed Benefit Categories
-- =============================================================================
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

-- =============================================================================
-- 3. Seed Comprehensive MCC Codes
-- =============================================================================
`;

  // Standard full MCC list
  const standardMccs = [
    { mcc: '5411', description: 'Grocery Stores and Supermarkets', category: 'grocery', is_excluded_by_default: false },
    { mcc: '5812', description: 'Eating Places and Restaurants', category: 'dining', is_excluded_by_default: false },
    { mcc: '5814', description: 'Fast Food Restaurants', category: 'dining', is_excluded_by_default: false },
    { mcc: '5651', description: 'Family Clothing Stores', category: 'apparel', is_excluded_by_default: false },
    { mcc: '5691', description: "Men's and Women's Clothing Stores / Misc Apparel", category: 'apparel', is_excluded_by_default: false },
    { mcc: '5699', description: 'Miscellaneous and Specialty Retail', category: 'shopping', is_excluded_by_default: false },
    { mcc: '5399', description: 'Misc General Merchandise / Online Marketplace', category: 'shopping', is_excluded_by_default: false },
    { mcc: '5311', description: 'Department Stores', category: 'shopping', is_excluded_by_default: false },
    { mcc: '5262', description: 'Marketplaces / E-Commerce Online Platforms', category: 'shopping', is_excluded_by_default: false },
    { mcc: '5944', description: 'Jewelry, Watch, Clock, and Silverware Stores', category: 'jewelry', is_excluded_by_default: false },
    { mcc: '5947', description: 'Gift, Card, Novelty, and Souvenir Shops', category: 'gift_cards', is_excluded_by_default: false },
    { mcc: '5499', description: 'Misc Food Stores - Convenience Stores & Quick Commerce', category: 'grocery', is_excluded_by_default: false },
    { mcc: '5541', description: 'Service Stations / Fuel', category: 'fuel', is_excluded_by_default: false },
    { mcc: '5542', description: 'Automated Fuel Dispensers', category: 'fuel', is_excluded_by_default: false },
    { mcc: '4900', description: 'Utilities - Electric, Gas, Water, Sanitary', category: 'utility', is_excluded_by_default: false },
    { mcc: '4814', description: 'Telecommunication Services', category: 'utility', is_excluded_by_default: false },
    { mcc: '7011', description: 'Hotels, Motels, Resorts', category: 'hotels', is_excluded_by_default: false },
    { mcc: '4511', description: 'Airlines and Air Carriers', category: 'travel', is_excluded_by_default: false },
    { mcc: '7832', description: 'Motion Picture Theatres', category: 'entertainment', is_excluded_by_default: false },
    { mcc: '4121', description: 'Taxicabs and Limousines (Ride Hailing)', category: 'travel', is_excluded_by_default: false },
    { mcc: '5732', description: 'Electronic Sales', category: 'electronics', is_excluded_by_default: false },
    { mcc: '5999', description: 'Miscellaneous and Specialty Retail Stores', category: 'shopping', is_excluded_by_default: false },
    { mcc: '6540', description: 'POI Funding Transactions / Wallet Reload', category: 'wallet', is_excluded_by_default: true },
    { mcc: '6513', description: 'Real Estate Agents / Rent Payments', category: 'rent', is_excluded_by_default: true },
    { mcc: '6211', description: 'Security Brokers / Dealers (Trading & Investments)', category: 'investments', is_excluded_by_default: true },
    { mcc: '6300', description: 'Insurance Underwriting, Premiums', category: 'insurance', is_excluded_by_default: false },
    { mcc: '8211', description: 'Elementary and Secondary Schools', category: 'education', is_excluded_by_default: true },
    { mcc: '8220', description: 'Colleges, Universities', category: 'education', is_excluded_by_default: true },
    { mcc: '9399', description: 'Government Services - Not Elsewhere Classified', category: 'government', is_excluded_by_default: true },
    { mcc: '9311', description: 'Tax Payments', category: 'government', is_excluded_by_default: true },
  ];

  const mccMap = new Map();
  for (const m of standardMccs) {
    mccMap.set(m.mcc, m);
  }

  // Also check if merchants.json has any additional MCCs
  if (existsSync(`${DATA_DIR}/merchants.json`)) {
    const merchants = JSON.parse(readFileSync(`${DATA_DIR}/merchants.json`, 'utf-8'));
    for (const m of merchants) {
      if (m.mcc && !mccMap.has(m.mcc)) {
        mccMap.set(m.mcc, {
          mcc: m.mcc,
          description: `${m.merchant_name} Merchant Category`,
          category: 'shopping',
          is_excluded_by_default: false,
        });
      }
    }
  }

  for (const m of mccMap.values()) {
    sql += `INSERT INTO mcc_codes (mcc, description, category, is_excluded_by_default) VALUES (${escapeSql(m.mcc)}, ${escapeSql(m.description)}, ${escapeSql(m.category)}, ${escapeSql(m.is_excluded_by_default ?? false)}) ON CONFLICT (mcc) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, is_excluded_by_default = EXCLUDED.is_excluded_by_default;\n`;
  }

  // Cards
  sql += `\n-- =============================================================================\n-- 4. Seed Catalog Cards (81 Cards)\n-- =============================================================================\n`;
  let cards = [];
  if (existsSync(`${DATA_DIR}/cards.json`)) {
    cards = JSON.parse(readFileSync(`${DATA_DIR}/cards.json`, 'utf-8'));
    for (const c of cards) {
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
  }

  // Card Categories join
  sql += `\n-- =============================================================================\n-- 5. Seed Card Categories Join\n-- =============================================================================\n`;
  for (const c of cards) {
    const cats = c.reward_categories ?? c.categories ?? [];
    for (const cat of cats) {
      sql += `INSERT INTO catalog_card_categories (card_id, category_id)
SELECT c.id, cat.id FROM catalog_cards c, catalog_benefit_categories cat
WHERE c.slug = ${escapeSql(c.slug)} AND LOWER(cat.name) = LOWER(${escapeSql(cat)})
ON CONFLICT (card_id, category_id) DO NOTHING;\n`;
    }
  }

  // Articles
  sql += `\n-- =============================================================================\n-- 6. Seed Articles (21 Articles)\n-- =============================================================================\n`;
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

  // Offers
  sql += `\n-- =============================================================================\n-- 7. Seed Offers\n-- =============================================================================\n`;
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
  sql += `\n-- =============================================================================\n-- 8. Seed Merchant Tips\n-- =============================================================================\n`;
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
  sql += `\n-- =============================================================================\n-- 9. Seed Guides\n-- =============================================================================\n`;
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
  sql += `\n-- =============================================================================\n-- 10. Seed Hotel Loyalty Programs\n-- =============================================================================\n`;
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
  sql += `\n-- =============================================================================\n-- 11. Seed Airline Loyalty Programs\n-- =============================================================================\n`;
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
  sql += `\n-- =============================================================================\n-- 12. Seed Lifestyle Brands\n-- =============================================================================\n`;
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

  const outPath = resolve(ROOT_DIR, 'supabase/captaintorch_seed.sql');
  writeFileSync(outPath, sql, 'utf-8');
  console.log(`✓ Wrote complete SQL script to ${outPath}`);
}

generate();
