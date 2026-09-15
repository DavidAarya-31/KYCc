import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function checkUserData() {
  console.log('--- Checking User Data Tables in Supabase ---');
  const tables = ['cards', 'transactions', 'categories', 'budgets', 'goals', 'account_balances'];

  for (const t of tables) {
    const { data, count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ Table ${t}: ${error.message} (code: ${error.code})`);
    } else {
      console.log(`✅ Table ${t}: exists (row count visible to anon: ${count ?? 0})`);
    }
  }
}

checkUserData();
