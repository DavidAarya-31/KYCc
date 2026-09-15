-- =============================================================================
-- KYCc Catalog Tables RLS Policies (Allow Read & Seed Writes)
-- Run this in Supabase SQL Editor:
-- =============================================================================

-- Drop existing restricted policies if present
DROP POLICY IF EXISTS "Public read catalog_cards" ON catalog_cards;
DROP POLICY IF EXISTS "Public read catalog_benefit_categories" ON catalog_benefit_categories;
DROP POLICY IF EXISTS "Public read catalog_card_categories" ON catalog_card_categories;
DROP POLICY IF EXISTS "Public read catalog_offers" ON catalog_offers;
DROP POLICY IF EXISTS "Public read mcc_codes" ON mcc_codes;
DROP POLICY IF EXISTS "Public read catalog_card_mcc_rewards" ON catalog_card_mcc_rewards;
DROP POLICY IF EXISTS "Public read catalog_guides" ON catalog_guides;
DROP POLICY IF EXISTS "Public read catalog_merchant_tips" ON catalog_merchant_tips;
DROP POLICY IF EXISTS "Public read catalog_articles" ON catalog_articles;
DROP POLICY IF EXISTS "Public read catalog_hotel_programs" ON catalog_hotel_programs;
DROP POLICY IF EXISTS "Public read catalog_airline_programs" ON catalog_airline_programs;
DROP POLICY IF EXISTS "Public read catalog_lifestyle_brands" ON catalog_lifestyle_brands;
DROP POLICY IF EXISTS "Public read catalog_calculator_configs" ON catalog_calculator_configs;
DROP POLICY IF EXISTS "Public read catalog_card_updates" ON catalog_card_updates;

-- Enable Public Read on all catalog tables
CREATE POLICY "Public read catalog_cards" ON catalog_cards FOR SELECT USING (true);
CREATE POLICY "Public read catalog_benefit_categories" ON catalog_benefit_categories FOR SELECT USING (true);
CREATE POLICY "Public read catalog_card_categories" ON catalog_card_categories FOR SELECT USING (true);
CREATE POLICY "Public read catalog_offers" ON catalog_offers FOR SELECT USING (true);
CREATE POLICY "Public read mcc_codes" ON mcc_codes FOR SELECT USING (true);
CREATE POLICY "Public read catalog_card_mcc_rewards" ON catalog_card_mcc_rewards FOR SELECT USING (true);
CREATE POLICY "Public read catalog_guides" ON catalog_guides FOR SELECT USING (true);
CREATE POLICY "Public read catalog_merchant_tips" ON catalog_merchant_tips FOR SELECT USING (true);
CREATE POLICY "Public read catalog_articles" ON catalog_articles FOR SELECT USING (true);
CREATE POLICY "Public read catalog_hotel_programs" ON catalog_hotel_programs FOR SELECT USING (true);
CREATE POLICY "Public read catalog_airline_programs" ON catalog_airline_programs FOR SELECT USING (true);
CREATE POLICY "Public read catalog_lifestyle_brands" ON catalog_lifestyle_brands FOR SELECT USING (true);
CREATE POLICY "Public read catalog_calculator_configs" ON catalog_calculator_configs FOR SELECT USING (true);
CREATE POLICY "Public read catalog_card_updates" ON catalog_card_updates FOR SELECT USING (true);

-- Also allow Insert/Update/Delete for seeding
CREATE POLICY "Allow writes catalog_cards" ON catalog_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow writes catalog_benefit_categories" ON catalog_benefit_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow writes catalog_card_categories" ON catalog_card_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow writes catalog_offers" ON catalog_offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow writes mcc_codes" ON mcc_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow writes catalog_card_mcc_rewards" ON catalog_card_mcc_rewards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow writes catalog_guides" ON catalog_guides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow writes catalog_merchant_tips" ON catalog_merchant_tips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow writes catalog_articles" ON catalog_articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow writes catalog_hotel_programs" ON catalog_hotel_programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow writes catalog_airline_programs" ON catalog_airline_programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow writes catalog_lifestyle_brands" ON catalog_lifestyle_brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow writes catalog_calculator_configs" ON catalog_calculator_configs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow writes catalog_card_updates" ON catalog_card_updates FOR ALL USING (true) WITH CHECK (true);
