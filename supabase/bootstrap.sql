-- Auto-generated bootstrap SQL for a fresh Supabase project.
-- Apply this file in the SQL editor, or regenerate it with `npm run init:new-project`.

-- ============================================================
-- Migration: 20240701_budget_management.sql
-- ============================================================

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  period_type text CHECK (period_type IN ('monthly', 'weekly', 'custom')) NOT NULL,
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text,
  color text,
  is_default boolean DEFAULT false
);

-- BudgetCategories table
CREATE TABLE IF NOT EXISTS budget_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  allocated_amount numeric(12,2) NOT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount numeric(12,2) NOT NULL,
  description text,
  date timestamptz NOT NULL,
  type text CHECK (type IN ('expense', 'income')) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- AuditLogs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Budgets policies
CREATE POLICY "Users can read own budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Users can read own categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- BudgetCategories policies
CREATE POLICY "Users can read own budget_categories"
  ON budget_categories
  FOR SELECT
  TO authenticated
  USING (
    budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own budget_categories"
  ON budget_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own budget_categories"
  ON budget_categories
  FOR UPDATE
  TO authenticated
  USING (
    budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid())
  )
  WITH CHECK (
    budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own budget_categories"
  ON budget_categories
  FOR DELETE
  TO authenticated
  USING (
    budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid())
  );

-- Transactions policies
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- AuditLogs policies
CREATE POLICY "Users can read own audit_logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit_logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_budget_id ON budget_categories(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_category_id ON budget_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_budget_id ON transactions(budget_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Insert default categories for all users
INSERT INTO categories (id, user_id, name, is_default)
SELECT gen_random_uuid(), u.id, c.name, true
FROM auth.users u
CROSS JOIN (VALUES
  ('Other'),
  ('Food & Dining'),
  ('Transportation'),
  ('Shopping'),
  ('Entertainment'),
  ('Utilities'),
  ('Healthcare'),
  ('Education'),
  ('Travel'),
  ('Housing'),
  ('Insurance'),
  ('Personal Care')
) AS c(name)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Migration: 20250626094643_humble_coast.sql
-- ============================================================

/*
  # Credit Card Milestone Tracker Database Schema

  1. New Tables
    - `cards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `card_company` (text)
      - `card_name` (text)
      - `card_network` (text)
      - `anniversary_month` (integer, 1-12)
      - `billing_date` (integer, 1-31)
      - `due_date` (integer, 1-31)
      - `annual_fee` (integer, in cents)
      - `milestone_amount` (integer, in cents)
      - `card_limit` (integer, in cents, nullable)
      - `created_at` (timestamp)

    - `monthly_spends`
      - `id` (uuid, primary key)
      - `card_id` (uuid, foreign key to cards.id)
      - `month` (text, format: YYYY-MM)
      - `year` (integer)
      - `amount_spent` (integer, in cents)
      - Unique constraint on (card_id, month, year)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to access only their own data
*/

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_company text NOT NULL,
  card_name text NOT NULL,
  card_network text NOT NULL,
  anniversary_month integer NOT NULL CHECK (anniversary_month >= 1 AND anniversary_month <= 12),
  billing_date integer NOT NULL CHECK (billing_date >= 1 AND billing_date <= 31),
  due_date integer NOT NULL CHECK (due_date >= 1 AND due_date <= 31),
  annual_fee integer NOT NULL DEFAULT 0,
  milestone_amount integer NOT NULL DEFAULT 0,
  card_limit integer,
  created_at timestamptz DEFAULT now()
);

-- Create monthly_spends table
CREATE TABLE IF NOT EXISTS monthly_spends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  month text NOT NULL,
  year integer NOT NULL,
  amount_spent integer NOT NULL DEFAULT 0,
  UNIQUE(card_id, month, year)
);

-- Enable Row Level Security
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_spends ENABLE ROW LEVEL SECURITY;

-- Cards policies
CREATE POLICY "Users can read own cards"
  ON cards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards"
  ON cards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
  ON cards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards"
  ON cards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Monthly spends policies
CREATE POLICY "Users can read own monthly spends"
  ON monthly_spends
  FOR SELECT
  TO authenticated
  USING (
    card_id IN (
      SELECT id FROM cards WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own monthly spends"
  ON monthly_spends
  FOR INSERT
  TO authenticated
  WITH CHECK (
    card_id IN (
      SELECT id FROM cards WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own monthly spends"
  ON monthly_spends
  FOR UPDATE
  TO authenticated
  USING (
    card_id IN (
      SELECT id FROM cards WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    card_id IN (
      SELECT id FROM cards WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_spends_card_id ON monthly_spends(card_id);
CREATE INDEX IF NOT EXISTS idx_monthly_spends_month_year ON monthly_spends(month, year);

-- ============================================================
-- Migration: 20240702_add_payment_method_to_transactions.sql
-- ============================================================

ALTER TABLE transactions ADD COLUMN payment_method text CHECK (payment_method IN ('credit_card', 'upi', 'cash', 'debit_card'));
ALTER TABLE transactions ADD COLUMN card_id uuid REFERENCES cards(id);

-- If you want to enforce card_id only for credit card transactions,
-- uncomment and adapt the constraint below after verifying existing data.
-- ALTER TABLE transactions ADD CONSTRAINT card_id_only_for_credit_card CHECK (
--   (payment_method = 'credit_card' AND card_id IS NOT NULL) OR
--   (payment_method IS DISTINCT FROM 'credit_card')
-- );

-- ============================================================
-- Migration: 20260619000100_default_categories_for_new_users.sql
-- ============================================================

-- Keep default budget categories available for every user, including users
-- created after the original budget migration was applied.

CREATE OR REPLACE FUNCTION public.create_default_categories_for_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, is_default)
  SELECT NEW.id, default_category.name, true
  FROM (VALUES
    ('Other'),
    ('Food & Dining'),
    ('Transportation'),
    ('Shopping'),
    ('Entertainment'),
    ('Utilities'),
    ('Healthcare'),
    ('Education'),
    ('Travel'),
    ('Housing'),
    ('Insurance'),
    ('Personal Care')
  ) AS default_category(name)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.categories existing
    WHERE existing.user_id = NEW.id
      AND lower(existing.name) = lower(default_category.name)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_default_categories ON auth.users;

CREATE TRIGGER on_auth_user_created_default_categories
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_default_categories_for_user();

-- Backfill any missing default categories for existing users idempotently.
INSERT INTO public.categories (user_id, name, is_default)
SELECT users.id, default_category.name, true
FROM auth.users users
CROSS JOIN (VALUES
  ('Other'),
  ('Food & Dining'),
  ('Transportation'),
  ('Shopping'),
  ('Entertainment'),
  ('Utilities'),
  ('Healthcare'),
  ('Education'),
  ('Travel'),
  ('Housing'),
  ('Insurance'),
  ('Personal Care')
) AS default_category(name)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.categories existing
  WHERE existing.user_id = users.id
    AND lower(existing.name) = lower(default_category.name)
);

-- The frontend creates one budget per category and expects this column.
ALTER TABLE public.budgets
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

UPDATE public.budgets budget
SET category_id = category.id
FROM public.categories category
WHERE budget.category_id IS NULL
  AND category.user_id = budget.user_id
  AND lower(category.name) = 'other';

ALTER TABLE public.budgets
ALTER COLUMN category_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON public.budgets(category_id);
