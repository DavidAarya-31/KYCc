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