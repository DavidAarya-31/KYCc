#!/usr/bin/env node
/**
 * CaptainTorch → KYCc Catalog Scraper
 *
 * Usage:
 *   node scripts/scrape-captaintorch.mjs cards       ← scrape all card summary pages
 *   node scripts/scrape-captaintorch.mjs articles    ← scrape all full review articles
 *   node scripts/scrape-captaintorch.mjs offers      ← scrape all offers
 *   node scripts/scrape-captaintorch.mjs merchants   ← scrape merchant tips
 *   node scripts/scrape-captaintorch.mjs mcc         ← scrape MCC code reference
 *   node scripts/scrape-captaintorch.mjs guides      ← scrape guide content
 *   node scripts/scrape-captaintorch.mjs hotels      ← scrape hotel programs
 *   node scripts/scrape-captaintorch.mjs airlines    ← scrape airline programs
 *   node scripts/scrape-captaintorch.mjs lifestyle   ← scrape lifestyle brands
 *   node scripts/scrape-captaintorch.mjs insert      ← insert all transformed JSON into Supabase
 *   node scripts/scrape-captaintorch.mjs all         ← run scrape + insert in one go
 *
 * Output: scripts/data/transformed/*.json
 */

import { load } from 'cheerio';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE        = 'https://captaintorch.in';
const DELAY_MS    = 1200;
const DATA_DIR    = './scripts/data/transformed';
const RAW_DIR     = './scripts/data/raw';
mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(RAW_DIR,  { recursive: true });

const SUPABASE_URL  = process.env.VITE_SUPABASE_URL  ?? process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ─── HTTP helper ─────────────────────────────────────────────────────────────

const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control':   'no-cache',
};

async function fetchHTML(path, retries = 3) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      console.warn(`  ⚠ Attempt ${attempt}/${retries} failed for ${path}: ${e.message}`);
      if (attempt < retries) await sleep(1500 * attempt);
      else throw e;
    }
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function save(name, data) { writeFileSync(`${DATA_DIR}/${name}.json`, JSON.stringify(data, null, 2), 'utf-8'); }
function load$(html) { return load(html); }

// ─── Text helpers ─────────────────────────────────────────────────────────────

function clean(str = '') { return (str || '').replace(/\s+/g, ' ').trim(); }

function parseFeeType(text = '') {
  const t = text.toLowerCase();
  if (t.includes('lifetime free') || t.includes('ltf'))          return 'LTF';
  if (t.includes('first year free') || t.includes('fyf'))        return 'FYF';
  return 'paid';
}

function parseAmount(text = '') {
  if (!text) return 0;
  // Look for Lakhs notation (e.g. ₹2.4L -> 240000)
  const lakhMatch = text.match(/([\d.]+)\s*L/i);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1]) * 100000);
  const match = text.replace(/,/g, '').match(/[\d]+/);
  return match ? parseInt(match[0], 10) : 0;
}

function slugify(text = '') {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseDate(text = '') {
  try {
    const cleaned = text.replace(/^expires\s*/i, '').trim();
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch {}
  return null;
}

// ─── SCRAPER 1: Card listing (/cards) ────────────────────────────────────────

async function scrapeCardList() {
  console.log('\n📋 Scraping card listing from /cards...');
  const html = await fetchHTML('/cards');
  writeFileSync(`${RAW_DIR}/cards-listing.html`, html);
  const $ = load$(html);

  const cardsMap = new Map();

  // Each card card on /cards is inside a container with summary/apply links
  $('a[href^="/cards/"]').each((_, el) => {
    const $a = $(el);
    const href = $a.attr('href') ?? '';
    const slug = href.replace('/cards/', '').replace(/\/$/, '').trim();
    if (!slug || slug === 'cards' || slug === 'new' || cardsMap.has(slug)) return;

    // Find the enclosing card container
    const $card = $a.closest('.rounded-xl, .flex-col, .shadow-md');
    if (!$card.length) return;

    const name = clean($card.find('h2, h3').first().text());
    const bankText = clean($card.find('p:contains("by ")').first().text()).replace(/^by\s*/i, '');
    const feeBadge = clean($card.find('span.rounded-full').first().text());
    
    // Categories tags
    const categories = $card.find('span.rounded-full')
      .map((_, t) => clean($(t).text()))
      .get()
      .filter(t => t && t !== feeBadge && !t.toLowerCase().includes('free') && !t.startsWith('₹'));

    // Key perks list items
    const perks = $card.find('ul li').map((_, li) => clean($(li).text().replace(/^✦\s*/, ''))).get().filter(Boolean);

    // Review link
    const reviewHref = $card.find('a[href^="/articles/"]').first().attr('href') ?? '';
    const fullReviewSlug = reviewHref.replace('/articles/', '').replace(/\/$/, '') || null;

    // Apply link
    const applyHref = $card.find('a:contains("Apply")').first().attr('href') ?? null;

    // Image
    const imgUrl = $card.find('img').first().attr('src') ?? null;

    if (name && slug) {
      cardsMap.set(slug, {
        slug,
        name,
        bank: bankText || 'Unknown Bank',
        fee_type: parseFeeType(feeBadge),
        fee_label: feeBadge || null,
        categories,
        key_perks: perks,
        thumbnail_url: imgUrl,
        affiliate_url: applyHref,
        full_review_slug: fullReviewSlug,
        _detail_url: `/cards/${slug}`,
      });
    }
  });

  const cards = Array.from(cardsMap.values());
  console.log(`  Found ${cards.length} cards in listing`);
  save('cards-list', cards);
  return cards;
}

// ─── SCRAPER 2: Card detail page (/cards/[slug]) ─────────────────────────────

async function scrapeCardDetail(slug) {
  const html = await fetchHTML(`/cards/${slug}`);
  const $ = load$(html);

  // Card Name
  const name = clean($('h1').first().text());
  
  // Bank & Network
  const bankLine = clean($('h1').next('p').text() || $('p:contains("by ")').first().text());
  let bank = null;
  let network = null;
  if (bankLine) {
    const cleaned = bankLine.replace(/^by\s*/i, '');
    const parts = cleaned.split('·').map(s => s.trim());
    bank = parts[0] || null;
    network = parts[1] || null;
  }

  // Fee Badge
  const feeBadge = clean($('span.rounded-full:contains("Free"), span.rounded-full:contains("₹"), span.rounded-full:contains("Waiver")').first().text());
  
  // Thumbnail
  const thumbnailUrl = $('main img').first().attr('src') ?? null;
  
  // Short description
  const shortDesc = clean($('p.leading-relaxed').first().text() || $('p.text-sm.text-gray-600').first().text());

  // Forex & Point Value badges
  let forexMarkup = null;
  let pointValue = null;
  $('div:contains("Forex:"), div:contains("RP ="), div:contains("1 RP")').each((_, el) => {
    const text = clean($(el).text());
    if (text.includes('Forex:')) forexMarkup = text.replace(/^Forex:\s*/i, '').trim();
    else if (text.includes('RP =') || text.includes('1 RP')) pointValue = text;
  });

  // Lists in sections
  const keyPerks = findListAfterHeading($, ['Key Perks', 'Perks']).map(s => s.replace(/^✦\s*/, ''));
  const joiningBenefits = findListAfterHeading($, ['Joining Benefits']).map(s => s.replace(/^[★+]\s*/, ''));
  const renewalBenefits = findListAfterHeading($, ['Renewal Benefits']).map(s => s.replace(/^[★+]\s*/, ''));
  const earnsOn = findListAfterHeading($, ['Earns On']).map(s => s.replace(/^[+]\s*/, ''));
  const doesNotEarnOn = findListAfterHeading($, ['Does Not Earn On', 'Exclusions']).map(s => s.replace(/^[✗-]\s*/, ''));

  // Reward Categories
  let rewardCategories = [];
  $('h2:contains("Reward Categories")').closest('div').find('span.rounded-full').each((_, el) => {
    const cat = clean($(el).text());
    if (cat) rewardCategories.push(cat);
  });

  // Card Details key-values
  const cardDetails = {};
  $('h2:contains("Card Details")').closest('div').find('.divide-y > div, tr').each((_, row) => {
    const label = clean($(row).find('span, td').first().text()).toLowerCase();
    const val = clean($(row).find('span, td').last().text());
    if (label && val && label !== val) {
      cardDetails[label] = val;
    }
  });

  // Best Merchants
  const merchants = [];
  $('a[href^="/guide/merchants/"]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') ?? '';
    const mSlug = href.replace('/guide/merchants/', '').replace(/\/$/, '');
    const mName = clean($el.find('p.font-semibold, h3, h4, strong').first().text() || $el.text());
    const mDesc = clean($el.find('p.truncate, p.text-xs').first().text());
    const emoji = clean($el.find('span.text-lg, span.shrink-0').first().text()) || '🛍️';
    if (mSlug && mName) {
      merchants.push({
        merchant_name: mName,
        merchant_slug: mSlug,
        merchant_emoji: emoji,
        tip_text: mDesc,
      });
    }
  });

  // Review & Apply links
  const reviewHref = $('a[href^="/articles/"]').first().attr('href') ?? '';
  const fullReviewSlug = reviewHref.replace('/articles/', '').replace(/\/$/, '') || null;
  const affiliateUrl = $('a[href*="apply"], a:contains("Apply")').first().attr('href') ?? null;

  return {
    slug,
    name: name || slug,
    bank: bank || cardDetails['bank'] || null,
    network: network || cardDetails['network'] || null,
    fee_type: parseFeeType(feeBadge || cardDetails['annual fee'] || ''),
    fee_label: feeBadge || cardDetails['annual fee'] || null,
    annual_fee: parseAmount(cardDetails['annual fee'] ?? '0'),
    joining_fee: parseAmount(cardDetails['joining fee'] ?? '0'),
    fee_waiver_label: cardDetails['fee waiver'] || null,
    fee_waiver_spend: parseAmount(cardDetails['fee waiver'] ?? '0') || null,
    forex_markup: forexMarkup || cardDetails['forex markup'] || null,
    point_value: pointValue || cardDetails['point value'] || null,
    rewards_cycle: cardDetails['rewards cycle'] || null,
    short_description: shortDesc || null,
    thumbnail_url: thumbnailUrl || null,
    affiliate_url: affiliateUrl || null,
    full_review_slug: fullReviewSlug,
    key_perks: keyPerks,
    joining_benefits: joiningBenefits,
    renewal_benefits: renewalBenefits,
    earns_on: earnsOn,
    does_not_earn_on: doesNotEarnOn,
    reward_categories: rewardCategories,
    is_featured: false,
    is_published: true,
    _merchants: merchants,
  };
}

function findListAfterHeading($, headings) {
  for (const h of headings) {
    const $h = $(`h2:contains("${h}"), h3:contains("${h}")`).first();
    if ($h.length) {
      const $parent = $h.closest('div');
      const items = $parent.find('ul li').map((_, li) => clean($(li).text())).get().filter(Boolean);
      if (items.length) return items;
    }
  }
  return [];
}

// ─── SCRAPER 3: All cards (list → detail for each) ───────────────────────────

async function scrapeAllCards() {
  const cardList = await scrapeCardList();
  const results  = [];

  for (let i = 0; i < cardList.length; i++) {
    const card = cardList[i];
    console.log(`  [${i + 1}/${cardList.length}] Scraping details for ${card.name} (${card.slug})...`);
    try {
      const detail = await scrapeCardDetail(card.slug);
      results.push({
        ...card,
        ...detail,
        // merge perks if detail had empty ones
        key_perks: detail.key_perks?.length ? detail.key_perks : card.key_perks,
        categories: detail.reward_categories?.length ? detail.reward_categories : card.categories,
      });
    } catch (e) {
      console.warn(`    ✗ Failed: ${e.message}`);
      results.push(card);
    }
    await sleep(DELAY_MS);
  }

  save('cards', results);
  console.log(`  ✓ Saved ${results.length} cards to scripts/data/transformed/cards.json`);
  return results;
}

// ─── SCRAPER 4: Articles (/articles/[slug]) ───────────────────────────────────

async function scrapeAllArticles() {
  console.log('\n📄 Scraping articles...');

  let articleSlugs = new Set();
  
  // 1. Slugs from cards.json
  if (existsSync(`${DATA_DIR}/cards.json`)) {
    const cards = JSON.parse(readFileSync(`${DATA_DIR}/cards.json`, 'utf-8'));
    for (const c of cards) {
      if (c.full_review_slug) articleSlugs.add(c.full_review_slug);
    }
  }

  // 2. Discover articles from /blog or /cards
  try {
    const blogHtml = await fetchHTML('/blog');
    const $b = load$(blogHtml);
    $b('a[href^="/articles/"]').each((_, el) => {
      const slug = $b(el).attr('href')?.replace('/articles/', '').replace(/\/$/, '');
      if (slug) articleSlugs.add(slug);
    });
  } catch {}

  const articles = [];
  const slugList = Array.from(articleSlugs);
  console.log(`  Found ${slugList.length} articles to scrape`);

  for (let i = 0; i < slugList.length; i++) {
    const slug = slugList[i];
    console.log(`  [${i + 1}/${slugList.length}] Scraping article: ${slug}...`);
    try {
      const html = await fetchHTML(`/articles/${slug}`);
      const $ = load$(html);

      const title = clean($('h1').first().text());
      const author = clean($('[class*="author"], p:contains("Yash"), p:contains("Author")').first().text()) || 'CaptainTorch Team';
      const dateStr = $('time, [class*="date"]').first().text() || null;
      const thumbnail = $('article img, main img').first().attr('src') ?? null;
      const affiliateUrl = $('a[href*="apply"], a:contains("Apply")').first().attr('href') ?? null;

      // Card slug from link
      const cardHref = $('a[href^="/cards/"]').first().attr('href') ?? '';
      const cardSlug = cardHref.replace('/cards/', '').replace(/\/$/, '') || null;

      const mainEl = $('article, main').first();
      // Remove navigation/footer elements
      mainEl.find('nav, footer, button[aria-label="Share this page"]').remove();
      const content = htmlToMarkdown($, mainEl);

      const tags = $('span.rounded-full').map((_, el) => clean($(el).text())).get().filter(Boolean);

      if (title) {
        articles.push({
          slug,
          card_slug: cardSlug,
          title,
          author,
          published_at: parseDate(dateStr) || new Date().toISOString().split('T')[0],
          content,
          thumbnail_url: thumbnail,
          tags,
          affiliate_url: affiliateUrl,
          is_published: true,
        });
      }
    } catch (e) {
      console.warn(`    ✗ Failed ${slug}: ${e.message}`);
    }
    await sleep(DELAY_MS);
  }

  save('articles', articles);
  console.log(`  ✓ Saved ${articles.length} articles to scripts/data/transformed/articles.json`);
  return articles;
}

function htmlToMarkdown($, $el) {
  let md = '';
  $el.contents().each((_, node) => {
    if (node.type === 'text') {
      md += node.data;
    } else if (node.type === 'tag') {
      const tag = node.tagName.toLowerCase();
      const text = $(node).text();
      if (['h1','h2','h3','h4'].includes(tag)) {
        const level = parseInt(tag[1], 10);
        md += '\n\n' + '#'.repeat(level) + ' ' + clean(text) + '\n\n';
      } else if (tag === 'p') {
        md += '\n\n' + clean(text);
      } else if (tag === 'li') {
        md += '\n- ' + clean(text);
      } else if (tag === 'strong' || tag === 'b') {
        md += `**${clean(text)}**`;
      } else if (tag === 'em' || tag === 'i') {
        md += `*${clean(text)}*`;
      } else if (tag === 'code') {
        md += '`' + clean(text) + '`';
      } else if (tag === 'a') {
        const href = $(node).attr('href') ?? '';
        md += `[${clean(text)}](${href})`;
      } else if (tag === 'br') {
        md += '\n';
      } else if (tag === 'hr') {
        md += '\n\n---\n\n';
      } else if (tag === 'table') {
        md += '\n\n' + tableToMarkdown($, $(node)) + '\n\n';
      } else {
        md += htmlToMarkdown($, $(node));
      }
    }
  });
  return md.replace(/\n{3,}/g, '\n\n').trim();
}

function tableToMarkdown($, $table) {
  const rows = [];
  $table.find('tr').each((_, tr) => {
    const cells = $(tr).find('th, td').map((_, td) => clean($(td).text())).get();
    if (cells.length) {
      rows.push('| ' + cells.join(' | ') + ' |');
      if ($(tr).find('th').length) rows.push('| ' + cells.map(() => '---').join(' | ') + ' |');
    }
  });
  return rows.join('\n');
}

// ─── SCRAPER 5: Offers (/offers) ─────────────────────────────────────────────

async function scrapeOffers() {
  console.log('\n🎁 Scraping offers from /offers...');
  const html = await fetchHTML('/offers');
  writeFileSync(`${RAW_DIR}/offers.html`, html);
  const $ = load$(html);
  const offers = [];

  $('.rounded-xl.shadow-md').each((_, el) => {
    const $el = $(el);
    const title = clean($el.find('h2').first().text());
    const cardBankText = clean($el.find('p.text-xs').first().text());
    const desc = clean($el.find('p.text-sm.text-gray-700').first().text());
    const expiryBadge = clean($el.find('span.rounded-full').first().text());
    const noEndDate = expiryBadge.toLowerCase().includes('no end');
    const expiryDate = noEndDate ? null : parseDate(expiryBadge);
    const applyHref = $el.find('a:contains("Apply"), a[href*="http"]').first().attr('href') ?? null;
    
    // Extract card name or merchant
    let cardName = null;
    let merchant = null;
    if (cardBankText) {
      const parts = cardBankText.split('·').map(s => s.trim());
      cardName = parts[0] || null;
    } else {
      merchant = title;
    }

    if (title) {
      offers.push({
        title,
        description: desc || null,
        merchant: merchant || (cardName ? null : title),
        discount_value: null,
        expiry_date: expiryDate,
        no_end_date: noEndDate,
        is_featured: false,
        affiliate_url: applyHref,
        _card_name: cardName,
      });
    }
  });

  save('offers', offers);
  console.log(`  ✓ Saved ${offers.length} offers to scripts/data/transformed/offers.json`);
  return offers;
}

// ─── SCRAPER 6: Merchant Tips ─────────────────────────────────────────────────

async function scrapeMerchants() {
  console.log('\n🏪 Scraping merchant tips from /guide/merchants...');
  const html = await fetchHTML('/guide/merchants');
  writeFileSync(`${RAW_DIR}/merchants.html`, html);
  const $ = load$(html);
  const detailSlugs = new Set();

  $('a[href^="/guide/merchants/"]').each((_, el) => {
    const slug = $(el).attr('href')?.replace('/guide/merchants/', '').replace(/\/$/, '');
    if (slug) detailSlugs.add(slug);
  });

  const merchants = [];
  const slugList = Array.from(detailSlugs);
  console.log(`  Found ${slugList.length} merchants to scrape`);

  for (let i = 0; i < slugList.length; i++) {
    const slug = slugList[i];
    console.log(`  [${i + 1}/${slugList.length}] Scraping merchant: ${slug}...`);
    try {
      const dHtml = await fetchHTML(`/guide/merchants/${slug}`);
      const d$ = load$(dHtml);

      const merchantName = clean(d$('h1').first().text()) || slug;
      const emoji = clean(d$('span.text-3xl, span.text-4xl').first().text()) || '🛍️';
      const tipText = clean(d$('p.text-sm.text-gray-600, p.leading-relaxed').first().text());

      // MCC codes mentioned
      const mccMatches = dHtml.match(/MCC[\s:]*(\d{4})/gi) ?? [];
      const primaryMCC = mccMatches[0]?.replace(/MCC[\s:]*/i, '').trim() ?? null;

      // Category
      const category = clean(d$('span.rounded-full').first().text()).toLowerCase() || null;

      // Full content
      const contentEl = d$('main').first();
      contentEl.find('nav, footer, button').remove();
      const fullTip = htmlToMarkdown(d$, contentEl);

      // Best card slugs
      const bestCardSlugs = [];
      d$('a[href^="/cards/"]').each((_, a) => {
        const cs = d$(a).attr('href')?.replace('/cards/', '').replace(/\/$/, '');
        if (cs && !bestCardSlugs.includes(cs)) bestCardSlugs.push(cs);
      });

      merchants.push({
        merchant_name: merchantName,
        merchant_slug: slug,
        merchant_emoji: emoji,
        mcc: primaryMCC,
        category,
        tip_text: tipText || null,
        full_tip: fullTip || null,
        exclusions: null,
        _best_card_slugs: bestCardSlugs,
      });
    } catch (e) {
      console.warn(`    ✗ Failed ${slug}: ${e.message}`);
    }
    await sleep(DELAY_MS);
  }

  save('merchants', merchants);
  console.log(`  ✓ Saved ${merchants.length} merchants to scripts/data/transformed/merchants.json`);
  return merchants;
}

// ─── SCRAPER 7: MCC Codes ────────────────────────────────────────────────────

async function scrapeMCCCodes() {
  console.log('\n🏷️ Extracting MCC codes...');
  const codes = [];

  try {
    // Fetch the client bundle chunk where CaptainTorch defines its full structured MCC database
    const chunkHtml = await fetchHTML('/_next/static/chunks/808-38892593d9d3109e.js');
    const regex = /\{code:"(\d{4})",category:"([^"]*)",desc:"([^"]*)"(?:,examples:"([^"]*)")?\}/g;
    let match;
    while ((match = regex.exec(chunkHtml)) !== null) {
      codes.push({
        mcc: match[1],
        description: `${match[2]} · ${match[3]}${match[4] ? ' (' + match[4] + ')' : ''}`,
        category: match[2].toLowerCase(),
        is_excluded_by_default: false,
      });
    }
  } catch (e) {
    console.warn('  ⚠ Failed to extract from chunk:', e.message);
  }

  if (codes.length === 0) {
    // Fallback static high-frequency MCCs
    const FALLBACK_MCCS = [
      { mcc: '5411', description: 'Grocery Stores and Supermarkets', category: 'grocery' },
      { mcc: '5812', description: 'Eating Places and Restaurants', category: 'dining' },
      { mcc: '5814', description: 'Fast Food Restaurants', category: 'dining' },
      { mcc: '5691', description: "Men's and Women's Clothing Stores", category: 'apparel' },
      { mcc: '5541', description: 'Service Stations / Fuel', category: 'fuel' },
      { mcc: '4900', description: 'Utilities - Electric, Gas, Water, Sanitary', category: 'utility' },
      { mcc: '4814', description: 'Telecommunication Services', category: 'utility' },
      { mcc: '7011', description: 'Hotels, Motels, Resorts', category: 'hotels' },
      { mcc: '4511', description: 'Airlines and Air Carriers', category: 'travel' },
      { mcc: '7832', description: 'Motion Picture Theatres', category: 'entertainment' },
    ];
    codes.push(...FALLBACK_MCCS.map(m => ({ ...m, is_excluded_by_default: false })));
  }

  save('mcc-codes', codes);
  console.log(`  ✓ Saved ${codes.length} MCC codes to scripts/data/transformed/mcc-codes.json`);
  return codes;
}

// ─── SCRAPER 8: Guide content ─────────────────────────────────────────────────

async function scrapeGuides() {
  console.log('\n📚 Scraping guide content...');
  const GUIDE_PAGES = [
    { slug: 'utility-payments',  section: 'rewards',   sub: 'utility-payments',  path: '/guide/rewards/utility-payments' },
    { slug: 'cc-bill-via-dc',    section: 'rewards',   sub: 'cc-bill-via-dc',    path: '/guide/rewards/cc-bill-via-dc' },
    { slug: 'hotels-index',      section: 'hotels',    sub: null,                path: '/guide/hotels' },
    { slug: 'airlines-index',    section: 'airlines',  sub: null,                path: '/guide/airlines' },
    { slug: 'lifestyle-index',   section: 'lifestyle', sub: null,                path: '/guide/lifestyle' },
  ];

  const guides = [];

  for (let i = 0; i < GUIDE_PAGES.length; i++) {
    const guide = GUIDE_PAGES[i];
    console.log(`  Scraping guide: ${guide.path}`);
    try {
      const html = await fetchHTML(guide.path);
      const $ = load$(html);
      const title = clean($('h1').first().text()) || guide.slug;
      const mainEl = $('main').first();
      mainEl.find('nav, footer, button').remove();
      const content = htmlToMarkdown($, mainEl);
      const summary = clean($('meta[name="description"]').attr('content') ?? $('p').first().text());

      guides.push({
        slug: guide.slug,
        title,
        section: guide.section,
        sub_section: guide.sub,
        summary: summary || null,
        content: content || null,
        is_featured: false,
        sort_order: i,
      });
    } catch (e) {
      console.warn(`    ✗ Failed ${guide.path}: ${e.message}`);
    }
    await sleep(DELAY_MS);
  }

  save('guides', guides);
  console.log(`  ✓ Saved ${guides.length} guide pages to scripts/data/transformed/guides.json`);
  return guides;
}

// ─── SCRAPER 9: Hotel Programs ────────────────────────────────────────────────

async function scrapeHotels() {
  console.log('\n🏨 Scraping hotel programs from /guide/hotels...');
  const html = await fetchHTML('/guide/hotels');
  writeFileSync(`${RAW_DIR}/hotels.html`, html);
  const $ = load$(html);
  const programs = [];

  $('.rounded-lg.shadow-md').each((_, el) => {
    const $el = $(el);
    const name = clean($el.find('h2').first().text());
    const desc = clean($el.find('p').first().text());
    const emoji = clean($el.find('span.text-3xl').first().text());
    const brand = name.split(' ')[0] || name;
    if (name) {
      programs.push({
        name,
        brand,
        description: desc || null,
        benefits: [],
        program_url: null,
      });
    }
  });

  save('hotel-programs', programs);
  console.log(`  ✓ Saved ${programs.length} hotel programs to scripts/data/transformed/hotel-programs.json`);
  return programs;
}

// ─── SCRAPER 10: Airline Programs ────────────────────────────────────────────

async function scrapeAirlines() {
  console.log('\n✈️ Scraping airline programs from /guide/airlines...');
  const html = await fetchHTML('/guide/airlines');
  writeFileSync(`${RAW_DIR}/airlines.html`, html);
  const $ = load$(html);
  const programs = [];

  $('.rounded-lg.shadow-md').each((_, el) => {
    const $el = $(el);
    const name = clean($el.find('h2').first().text());
    const desc = clean($el.find('p').first().text());
    const airline = name.split(' ')[0] || name;
    if (name) {
      programs.push({
        name,
        airline,
        description: desc || null,
        benefits: [],
        program_url: null,
      });
    }
  });

  save('airline-programs', programs);
  console.log(`  ✓ Saved ${programs.length} airline programs to scripts/data/transformed/airline-programs.json`);
  return programs;
}

// ─── SCRAPER 11: Lifestyle Brands ────────────────────────────────────────────

async function scrapeLifestyle() {
  console.log('\n💪 Scraping lifestyle brands from /guide/lifestyle...');
  const html = await fetchHTML('/guide/lifestyle');
  writeFileSync(`${RAW_DIR}/lifestyle.html`, html);
  const $ = load$(html);
  const brands = [];

  $('.rounded-lg.shadow-md').each((_, el) => {
    const $el = $(el);
    const name = clean($el.find('h2').first().text());
    const desc = clean($el.find('p').first().text());
    const reviewHref = $el.find('a[href*="/guide/lifestyle/"]').attr('href') ?? null;
    if (name) {
      brands.push({
        name,
        category: name.toLowerCase().includes('movie') ? 'Entertainment' : 'Fitness & Wellness',
        description: desc || null,
        benefits: [],
        brand_url: reviewHref ? `${BASE}${reviewHref}` : null,
      });
    }
  });

  save('lifestyle-brands', brands);
  console.log(`  ✓ Saved ${brands.length} lifestyle brands to scripts/data/transformed/lifestyle-brands.json`);
  return brands;
}

// ─── INSERT: Supabase ─────────────────────────────────────────────────────────

async function insertAll() {
  if (!supabase) {
    console.error('❌ Supabase client is not initialized. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are in .env');
    return;
  }

  console.log('\n⬆️ Inserting transformed data into Supabase...');

  // 1. Categories
  const CATEGORIES = [
    { name: 'Apparel', icon: '👗', color: 'pink' },
    { name: 'Utility', icon: '⚡', color: 'yellow' },
    { name: 'Grocery', icon: '🛒', color: 'green' },
    { name: 'Online', icon: '🛍️', color: 'purple' },
    { name: 'Travel', icon: '✈️', color: 'blue' },
    { name: 'Dining', icon: '🍽️', color: 'orange' },
    { name: 'International', icon: '🌍', color: 'teal' },
    { name: 'Hotels', icon: '🏨', color: 'indigo' },
    { name: 'Fuel', icon: '⛽', color: 'red' },
    { name: 'Entertainment', icon: '🎬', color: 'violet' },
    { name: 'Fitness', icon: '💪', color: 'lime' },
  ];
  await upsert('catalog_benefit_categories', CATEGORIES, 'name');
  const { data: catRows } = await supabase.from('catalog_benefit_categories').select('id, name');
  const catMap = Object.fromEntries((catRows || []).map(c => [c.name.toLowerCase(), c.id]));

  // 2. MCC codes
  if (existsSync(`${DATA_DIR}/mcc-codes.json`)) {
    const codes = JSON.parse(readFileSync(`${DATA_DIR}/mcc-codes.json`, 'utf-8'));
    if (codes.length) await upsert('mcc_codes', codes, 'mcc');
    console.log(`  ✓ Upserted ${codes.length} MCC codes`);
  }

  // 3. Cards
  let cardIdMap = {};
  if (existsSync(`${DATA_DIR}/cards.json`)) {
    const cards = JSON.parse(readFileSync(`${DATA_DIR}/cards.json`, 'utf-8'));

    const cardRows = cards.map(c => ({
      slug:              c.slug,
      name:              c.name,
      bank:              c.bank,
      network:           c.network,
      fee_type:          c.fee_type,
      fee_label:         c.fee_label,
      annual_fee:        c.annual_fee ?? 0,
      joining_fee:       c.joining_fee ?? 0,
      fee_waiver_spend:  c.fee_waiver_spend,
      fee_waiver_label:  c.fee_waiver_label,
      forex_markup:      c.forex_markup,
      point_value:       c.point_value,
      rewards_cycle:     c.rewards_cycle,
      short_description: c.short_description,
      thumbnail_url:     c.thumbnail_url,
      affiliate_url:     c.affiliate_url,
      full_review_slug:  c.full_review_slug,
      key_perks:         c.key_perks        ?? [],
      joining_benefits:  c.joining_benefits ?? [],
      renewal_benefits:  c.renewal_benefits ?? [],
      earns_on:          c.earns_on         ?? [],
      does_not_earn_on:  c.does_not_earn_on ?? [],
      is_featured:       c.is_featured      ?? false,
      is_published:      true,
      launched_at:       new Date().toISOString().split('T')[0],
    }));

    await upsert('catalog_cards', cardRows, 'slug');

    const { data: dbCards } = await supabase.from('catalog_cards').select('id, slug');
    cardIdMap = Object.fromEntries((dbCards || []).map(c => [c.slug, c.id]));

    // Card ↔ category join
    const joinRows = [];
    for (const card of cards) {
      const cardId = cardIdMap[card.slug];
      if (!cardId) continue;
      for (const catName of (card.reward_categories ?? card.categories ?? [])) {
        const catId = catMap[catName.toLowerCase()];
        if (catId) joinRows.push({ card_id: cardId, category_id: catId });
      }
    }
    if (joinRows.length) await upsert('catalog_card_categories', joinRows, 'card_id,category_id');

    console.log(`  ✓ Upserted ${cardRows.length} cards`);
  }

  // 4. Articles
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
    console.log(`  ✓ Upserted ${articleRows.length} articles`);
  }

  // 5. Offers
  if (existsSync(`${DATA_DIR}/offers.json`)) {
    const offers = JSON.parse(readFileSync(`${DATA_DIR}/offers.json`, 'utf-8'));
    const offerRows = offers.map(o => {
      const cardId = o._card_name
        ? Object.entries(cardIdMap).find(([slug]) => slug.includes(slugify(o._card_name)))?.[1] ?? null
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
    console.log(`  ✓ Upserted ${offerRows.length} offers`);
  }

  // 6. Merchant tips
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
    console.log(`  ✓ Upserted ${merchantRows.length} merchant tips`);
  }

  // 7. Guides
  if (existsSync(`${DATA_DIR}/guides.json`)) {
    const guides = JSON.parse(readFileSync(`${DATA_DIR}/guides.json`, 'utf-8'));
    await upsert('catalog_guides', guides, 'slug');
    console.log(`  ✓ Upserted ${guides.length} guides`);
  }

  // 8. Hotel programs
  if (existsSync(`${DATA_DIR}/hotel-programs.json`)) {
    const programs = JSON.parse(readFileSync(`${DATA_DIR}/hotel-programs.json`, 'utf-8'));
    await upsert('catalog_hotel_programs', programs, 'name');
    console.log(`  ✓ Upserted ${programs.length} hotel programs`);
  }

  // 9. Airline programs
  if (existsSync(`${DATA_DIR}/airline-programs.json`)) {
    const programs = JSON.parse(readFileSync(`${DATA_DIR}/airline-programs.json`, 'utf-8'));
    await upsert('catalog_airline_programs', programs, 'name');
    console.log(`  ✓ Upserted ${programs.length} airline programs`);
  }

  // 10. Lifestyle brands
  if (existsSync(`${DATA_DIR}/lifestyle-brands.json`)) {
    const brands = JSON.parse(readFileSync(`${DATA_DIR}/lifestyle-brands.json`, 'utf-8'));
    await upsert('catalog_lifestyle_brands', brands, 'name');
    console.log(`  ✓ Upserted ${brands.length} lifestyle brands`);
  }

  console.log('\n✅ Data insertion step complete.');
}

async function upsert(table, rows, conflict) {
  if (!rows || !rows.length) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflict, ignoreDuplicates: false });
  if (error) {
    console.warn(`  ⚠ Upsert ${table} notice:`, error.message);
  }
}

// ─── CLI Router ───────────────────────────────────────────────────────────────

const command = process.argv[2] ?? 'help';

const commands = {
  cards:     scrapeAllCards,
  articles:  scrapeAllArticles,
  offers:    scrapeOffers,
  merchants: scrapeMerchants,
  mcc:       scrapeMCCCodes,
  guides:    scrapeGuides,
  hotels:    scrapeHotels,
  airlines:  scrapeAirlines,
  lifestyle: scrapeLifestyle,
  insert:    insertAll,
  all: async () => {
    await scrapeAllCards();
    await scrapeAllArticles();
    await scrapeOffers();
    await scrapeMerchants();
    await scrapeMCCCodes();
    await scrapeGuides();
    await scrapeHotels();
    await scrapeAirlines();
    await scrapeLifestyle();
    await insertAll();
  },
};

if (command === 'help' || !commands[command]) {
  console.log(`
CaptainTorch scraper

Usage:
  node scripts/scrape-captaintorch.mjs <command>

Commands:
  cards       Scrape all card summary pages
  articles    Scrape all full review articles
  offers      Scrape all active offers
  merchants   Scrape merchant tips + detail pages
  mcc         Scrape MCC code reference table
  guides      Scrape guide content pages
  hotels      Scrape hotel loyalty programs
  airlines    Scrape airline programs
  lifestyle   Scrape lifestyle brands
  insert      Insert all scraped JSON into Supabase
  all         Run everything in one go
`);
} else {
  commands[command]().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
  });
}
