import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
  console.log('Checking Supabase connection to:', url);
  const tables = [
    'catalog_cards',
    'catalog_benefit_categories',
    'catalog_card_categories',
    'catalog_offers',
    'mcc_codes',
    'catalog_merchant_tips',
    'catalog_articles',
    'catalog_guides',
    'catalog_hotel_programs',
    'catalog_airline_programs',
    'catalog_lifestyle_brands'
  ];

  for (const t of tables) {
    const { data, count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ Table ${t}: ${error.message} (${error.code || ''})`);
    } else {
      console.log(`✅ Table ${t}: exists (count: ${count ?? 0})`);
    }
  }
}

check();
