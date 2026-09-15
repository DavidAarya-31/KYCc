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
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

function generate() {
  const cards = JSON.parse(readFileSync(`${DATA_DIR}/cards.json`, 'utf-8'));
  const articles = JSON.parse(readFileSync(`${DATA_DIR}/articles.json`, 'utf-8'));

  // 1. Card Categories Only
  let catSql = `-- =============================================================================
-- PHASE 4A: Card ↔ Benefit Category Mappings
-- =============================================================================

INSERT INTO catalog_card_categories (card_id, category_id)
SELECT c.id, cat.id
FROM (
  VALUES
`;
  const pairs = [];
  for (const c of cards) {
    const cats = c.reward_categories ?? c.categories ?? [];
    for (const cat of cats) {
      pairs.push(`  (${escapeSql(c.slug)}, ${escapeSql(cat)})`);
    }
  }
  catSql += pairs.join(',\n');
  catSql += `
) AS t(card_slug, cat_name)
JOIN catalog_cards c ON c.slug = t.card_slug
JOIN catalog_benefit_categories cat ON LOWER(cat.name) = LOWER(t.cat_name)
ON CONFLICT (card_id, category_id) DO NOTHING;
`;
  writeFileSync(resolve(ROOT_DIR, 'supabase/phase4a_card_categories.sql'), catSql);

  // 2. Articles Only
  let artSql = `-- =============================================================================
-- PHASE 4B: 21 Card Review Articles
-- =============================================================================\n\n`;

  for (const a of articles) {
    artSql += `INSERT INTO catalog_articles (
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
  writeFileSync(resolve(ROOT_DIR, 'supabase/phase4b_articles.sql'), artSql);

  console.log('✓ Wrote phase4a_card_categories.sql and phase4b_articles.sql');
}

generate();
