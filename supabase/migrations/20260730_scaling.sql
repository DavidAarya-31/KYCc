-- Add month column to budgets
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS month text;

-- Transactions (most queried table)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id       ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created  ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_card_created  ON transactions(card_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at    ON transactions(created_at DESC);

-- Cards
CREATE INDEX IF NOT EXISTS idx_cards_user_id              ON cards(user_id);

-- Budgets
CREATE INDEX IF NOT EXISTS idx_budgets_user_id            ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month         ON budgets(user_id, month);

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_user_id         ON categories(user_id);

-- Other tables from migrations
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id         ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_budget_id ON budget_categories(budget_id);

-- Enable RLS if not already enabled
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_spends ENABLE ROW LEVEL SECURITY;

-- Ensure all 4 operation policies exist, scoped to auth.uid()
-- cards
DO $$ BEGIN
  CREATE POLICY "users_select_own_cards" ON cards FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_insert_own_cards" ON cards FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_update_own_cards" ON cards FOR UPDATE TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_delete_own_cards" ON cards FOR DELETE TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- transactions
DO $$ BEGIN
  CREATE POLICY "users_select_own_transactions" ON transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_insert_own_transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_update_own_transactions" ON transactions FOR UPDATE TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_delete_own_transactions" ON transactions FOR DELETE TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- budgets
DO $$ BEGIN
  CREATE POLICY "users_select_own_budgets" ON budgets FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_insert_own_budgets" ON budgets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_update_own_budgets" ON budgets FOR UPDATE TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_delete_own_budgets" ON budgets FOR DELETE TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- categories
DO $$ BEGIN
  CREATE POLICY "users_select_own_categories" ON categories FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_insert_own_categories" ON categories FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_update_own_categories" ON categories FOR UPDATE TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_delete_own_categories" ON categories FOR DELETE TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- audit_logs
DO $$ BEGIN
  CREATE POLICY "users_select_own_audit_logs" ON audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_insert_own_audit_logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_update_own_audit_logs" ON audit_logs FOR UPDATE TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_delete_own_audit_logs" ON audit_logs FOR DELETE TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- budget_categories (has no user_id, check through budget_id)
DO $$ BEGIN
  CREATE POLICY "users_select_own_budget_categories" ON budget_categories FOR SELECT TO authenticated USING (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_insert_own_budget_categories" ON budget_categories FOR INSERT TO authenticated WITH CHECK (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_update_own_budget_categories" ON budget_categories FOR UPDATE TO authenticated USING (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_delete_own_budget_categories" ON budget_categories FOR DELETE TO authenticated USING (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- monthly_spends (has no user_id, check through card_id)
DO $$ BEGIN
  CREATE POLICY "users_select_own_monthly_spends" ON monthly_spends FOR SELECT TO authenticated USING (card_id IN (SELECT id FROM cards WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_insert_own_monthly_spends" ON monthly_spends FOR INSERT TO authenticated WITH CHECK (card_id IN (SELECT id FROM cards WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_update_own_monthly_spends" ON monthly_spends FOR UPDATE TO authenticated USING (card_id IN (SELECT id FROM cards WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users_delete_own_monthly_spends" ON monthly_spends FOR DELETE TO authenticated USING (card_id IN (SELECT id FROM cards WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- AI usage tracking + rate limiting
CREATE TABLE IF NOT EXISTS ai_usage (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  function_name TEXT NOT NULL,
  tokens_used   INTEGER DEFAULT 0,
  cost_usd      NUMERIC(10,6) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "users_read_own_ai_usage" ON ai_usage FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_fn_created
  ON ai_usage(user_id, function_name, created_at DESC);

-- Rate limit check function
CREATE OR REPLACE FUNCTION check_ai_rate_limit(
  p_user_id       UUID,
  p_function_name TEXT,
  p_daily_limit   INTEGER DEFAULT 10
) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER AS $inner$
  SELECT COUNT(*) < p_daily_limit
  FROM ai_usage
  WHERE user_id       = p_user_id
    AND function_name = p_function_name
    AND created_at    > NOW() - INTERVAL '24 hours';
$inner$;
