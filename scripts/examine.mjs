// scripts/examine.mjs
// Run: node scripts/examine.mjs
// Writes raw HTML for sample pages so you can inspect selectors before writing the main scraper

import { writeFileSync, mkdirSync } from 'fs';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
};

const BASE = 'https://captaintorch.in';
const PAGES = [
  { name: 'cards-listing',  path: '/cards' },
  { name: 'card-detail',    path: '/cards/equitas-selfe-credit-card' },
  { name: 'offers',         path: '/offers' },
  { name: 'guides',         path: '/guide' },
  { name: 'merchants',      path: '/guide/merchants' },
  { name: 'mcc-guide',      path: '/guide/rewards/mcc-guide' },
  { name: 'tools',          path: '/tools' },
  { name: 'hotels',         path: '/guide/hotels' },
  { name: 'airlines',       path: '/guide/airlines' },
  { name: 'lifestyle',      path: '/guide/lifestyle' },
];

mkdirSync('scripts/data/raw', { recursive: true });
mkdirSync('scripts/data/transformed', { recursive: true });

for (const page of PAGES) {
  try {
    console.log(`Fetching ${page.path}...`);
    const res = await fetch(`${BASE}${page.path}`, { headers: HEADERS });
    const html = await res.text();
    writeFileSync(`scripts/data/raw/${page.name}.html`, html, 'utf-8');
    console.log(`  ✓ Saved ${page.name}.html (${html.length} bytes)`);
    await new Promise(r => setTimeout(r, 1500)); // 1.5s delay
  } catch (e) {
    console.error(`  ✗ Failed ${page.path}:`, e.message);
  }
}
console.log('\nDone. Open scripts/data/raw/*.html files to examine the DOM structure.');
