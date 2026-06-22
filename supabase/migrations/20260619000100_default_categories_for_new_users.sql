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
