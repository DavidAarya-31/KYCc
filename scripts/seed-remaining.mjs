import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT_DIR, 'scripts/data/transformed');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function upsert(table, rows, conflict) {
  if (!rows || !rows.length) return;
  const { data, error } = await supabase.from(table).upsert(rows, { onConflict: conflict, ignoreDuplicates: false });
  if (error) {
    console.warn(`  ⚠ Upsert ${table} notice:`, error.message);
    return false;
  } else {
    console.log(`  ✓ Successfully upserted ${rows.length} rows to ${table}`);
    return true;
  }
}

async function run() {
  console.log('Ingesting remaining catalog data into Supabase...');

  // Get card id map
  const { data: dbCards } = await supabase.from('catalog_cards').select('id, slug');
  const cardIdMap = Object.fromEntries((dbCards || []).map(c => [c.slug, c.id]));
  console.log(`Found ${Object.keys(cardIdMap).length} cards in DB`);

  // Get category map
  const { data: dbCats } = await supabase.from('catalog_benefit_categories').select('id, name');
  const catMap = Object.fromEntries((dbCats || []).map(c => [c.name.toLowerCase(), c.id]));
  console.log(`Found ${Object.keys(catMap).length} categories in DB`);

  // 1. Card Categories
  if (existsSync(`${DATA_DIR}/cards.json`)) {
    const cards = JSON.parse(readFileSync(`${DATA_DIR}/cards.json`, 'utf-8'));
    const joinRows = [];
    for (const card of cards) {
      const cardId = cardIdMap[card.slug];
      if (!cardId) continue;
      for (const catName of (card.reward_categories ?? card.categories ?? [])) {
        const catId = catMap[catName.toLowerCase()];
        if (catId) joinRows.push({ card_id: cardId, category_id: catId });
      }
    }
    if (joinRows.length) {
      await upsert('catalog_card_categories', joinRows, 'card_id,category_id');
    }
  }

  // 2. Articles
  if (existsSync(`${DATA_DIR}/articles.json`)) {
    const articles = JSON.parse(readFileSync(`${DATA_DIR}/articles.json`, 'utf-8'));
    const articleRows = articles.map(a => ({
      slug:          a.slug,
      card_id:       a.card_slug ? cardIdMap[a.card_slug] ?? null : null,
      title:         a.title,
      author:        a.author ?? 'CaptainTorch Team',
      published_at:  a.published_at,
      content:       a.content,
      summary:       a.summary ?? null,
      thumbnail_url: a.thumbnail_url,
      tags:          a.tags ?? [],
      is_published:  true,
    }));
    await upsert('catalog_articles', articleRows, 'slug');
  }

  // 3. Offers
  if (existsSync(`${DATA_DIR}/offers.json`)) {
    const offers = JSON.parse(readFileSync(`${DATA_DIR}/offers.json`, 'utf-8'));
    const offerRows = offers.map(o => {
      const cardId = o._card_name
        ? Object.entries(cardIdMap).find(([slug]) => slug.includes(o._card_name.toLowerCase()))?.[1] ?? null
        : null;
      return {
        card_id:        cardId,
        title:          o.title,
        description:    o.description,
        merchant:       o.merchant,
        discount_value: o.discount_value,
        expiry_date:    o.expiry_date,
        no_end_date:    o.no_end_date ?? false,
        is_featured:    o.is_featured ?? false,
        affiliate_url:  o.affiliate_url,
      };
    });
    await upsert('catalog_offers', offerRows, 'title');
  }

  // 4. Merchant Tips
  if (existsSync(`${DATA_DIR}/merchants.json`)) {
    const merchants = JSON.parse(readFileSync(`${DATA_DIR}/merchants.json`, 'utf-8'));
    const merchantRows = merchants.map(m => ({
      merchant_name:  m.merchant_name,
      merchant_slug:  m.merchant_slug,
      merchant_emoji: m.merchant_emoji ?? '🏪',
      mcc:            m.mcc ?? null,
      category:       m.category ?? null,
      tip_text:       m.tip_text ?? null,
      full_tip:       m.full_tip ?? null,
      exclusions:     m.exclusions ?? null,
      best_card_ids:  (m._best_card_slugs ?? []).map(s => cardIdMap[s]).filter(Boolean),
    }));
    await upsert('catalog_merchant_tips', merchantRows, 'merchant_slug');
  }

  // 5. Guides
  if (existsSync(`${DATA_DIR}/guides.json`)) {
    const guides = JSON.parse(readFileSync(`${DATA_DIR}/guides.json`, 'utf-8'));
    await upsert('catalog_guides', guides, 'slug');
  }

  // 6. Hotel Programs
  if (existsSync(`${DATA_DIR}/hotel-programs.json`)) {
    const programs = JSON.parse(readFileSync(`${DATA_DIR}/hotel-programs.json`, 'utf-8'));
    await upsert('catalog_hotel_programs', programs, 'name');
  }

  // 7. Airline Programs
  if (existsSync(`${DATA_DIR}/airline-programs.json`)) {
    const programs = JSON.parse(readFileSync(`${DATA_DIR}/airline-programs.json`, 'utf-8'));
    await upsert('catalog_airline_programs', programs, 'name');
  }

  // 8. Lifestyle Brands
  if (existsSync(`${DATA_DIR}/lifestyle-brands.json`)) {
    const brands = JSON.parse(readFileSync(`${DATA_DIR}/lifestyle-brands.json`, 'utf-8'));
    await upsert('catalog_lifestyle_brands', brands, 'name');
  }

  console.log('\nAll remaining tables checked.');
}

run();
