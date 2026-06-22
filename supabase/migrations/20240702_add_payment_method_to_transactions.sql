-- Add payment_method and card_id to transactions
ALTER TABLE transactions ADD COLUMN payment_method text CHECK (payment_method IN ('credit_card', 'upi', 'cash', 'debit_card'));
ALTER TABLE transactions ADD COLUMN card_id uuid REFERENCES cards(id);

-- Optional: If you want to enforce that card_id is only set when payment_method is 'credit_card', you can add a check constraint (Postgres 12+):
-- ALTER TABLE transactions ADD CONSTRAINT card_id_only_for_credit_card CHECK (
--   (payment_method = 'credit_card' AND card_id IS NOT NULL) OR (payment_method != 'credit_card' AND card_id IS NULL) OR payment_method IS NULL
-- ); 