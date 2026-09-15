import { supabase } from './supabase';
import type {
  CatalogCard, CatalogOffer, MCCCode, CatalogMerchantTip,
  CatalogGuide, CatalogArticle, CatalogHotelProgram,
  CatalogAirlineProgram, CatalogLifestyleBrand,
  CatalogCalculatorConfig, CatalogCardUpdate,
} from '../types/catalog';

// ─── Cards ────────────────────────────────────────────────────────────────────

export async function getCatalogCards(filters?: {
  bank?: string; fee_type?: string; featured?: boolean; search?: string;
}) {
  let q = supabase
    .from('catalog_cards')
    .select(`*, catalog_card_categories(catalog_benefit_categories(*))`)
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('launched_at', { ascending: false });

  if (filters?.bank)     q = q.eq('bank', filters.bank);
  if (filters?.fee_type) q = q.eq('fee_type', filters.fee_type);
  if (filters?.featured) q = q.eq('is_featured', true);
  if (filters?.search)   q = q.or(`name.ilike.%${filters.search}%,bank.ilike.%${filters.search}%`);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(c => ({
    ...c,
    categories: c.catalog_card_categories?.map((cc: any) => cc.catalog_benefit_categories) ?? [],
  })) as CatalogCard[];
}

export async function getCatalogCardBySlug(slug: string): Promise<CatalogCard> {
  const { data, error } = await supabase
    .from('catalog_cards')
    .select(`*, catalog_card_categories(catalog_benefit_categories(*)), catalog_card_mcc_rewards(*, mcc_codes(*))`)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
  if (error) throw error;

  const card = {
    ...data,
    categories: data.catalog_card_categories?.map((cc: any) => cc.catalog_benefit_categories) ?? [],
  } as CatalogCard;

  const { data: merchants } = await supabase
    .from('catalog_merchant_tips')
    .select('*')
    .contains('best_card_ids', [card.id]);
  card.merchants = (merchants ?? []) as CatalogMerchantTip[];

  return card;
}

export async function getNewCards(days = 7, limit = 6): Promise<CatalogCard[]> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('catalog_cards')
    .select(`*, catalog_card_categories(catalog_benefit_categories(*))`)
    .eq('is_published', true)
    .gte('launched_at', since)
    .order('launched_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(c => ({
    ...c,
    categories: c.catalog_card_categories?.map((cc: any) => cc.catalog_benefit_categories) ?? [],
  })) as CatalogCard[];
}

export async function getWeeklyUpdates(limit = 15): Promise<CatalogCardUpdate[]> {
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from('catalog_card_updates')
    .select(`*, catalog_cards(id, name, bank, slug, thumbnail_url, fee_type)`)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(u => ({ ...u, card: u.catalog_cards })) as CatalogCardUpdate[];
}

// ─── Offers ───────────────────────────────────────────────────────────────────

export async function getCatalogOffers(filters?: {
  card_id?: string; featured?: boolean; active?: boolean;
}): Promise<CatalogOffer[]> {
  let q = supabase
    .from('catalog_offers')
    .select(`*, catalog_cards(id, name, bank, thumbnail_url, slug)`)
    .order('is_featured', { ascending: false })
    .order('expiry_date', { ascending: true, nullsFirst: false });

  if (filters?.card_id)  q = q.eq('card_id', filters.card_id);
  if (filters?.featured) q = q.eq('is_featured', true);
  if (filters?.active) {
    const today = new Date().toISOString().split('T')[0];
    q = q.or(`expiry_date.gte.${today},no_end_date.eq.true`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(o => ({ ...o, card: o.catalog_cards })) as CatalogOffer[];
}

// ─── MCC ─────────────────────────────────────────────────────────────────────

export async function getMCCCodes(search?: string, category?: string): Promise<MCCCode[]> {
  let q = supabase.from('mcc_codes').select('*').order('mcc');
  if (search)                    q = q.or(`mcc.ilike.%${search}%,description.ilike.%${search}%`);
  if (category && category !== 'all') q = q.eq('category', category);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as MCCCode[];
}

export async function getBestCardsForMCC(mcc: string) {
  const { data, error } = await supabase
    .from('catalog_card_mcc_rewards')
    .select(`*, catalog_cards(id, name, bank, thumbnail_url, slug, fee_type, fee_label, annual_fee)`)
    .eq('mcc', mcc)
    .order('reward_rate', { ascending: false })
    .limit(5);
  if (error) throw error;
  return data ?? [];
}

// ─── Guides ───────────────────────────────────────────────────────────────────

export async function getGuides(section?: string): Promise<CatalogGuide[]> {
  let q = supabase.from('catalog_guides').select('*').order('sort_order').order('created_at');
  if (section) q = q.eq('section', section);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as CatalogGuide[];
}

// ─── Merchants ────────────────────────────────────────────────────────────────

export async function getMerchantTips(category?: string): Promise<CatalogMerchantTip[]> {
  let q = supabase.from('catalog_merchant_tips').select(`*, mcc_codes(*)`).order('merchant_name');
  if (category && category !== 'all') q = q.eq('category', category);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(m => ({ ...m, mcc_info: m.mcc_codes })) as CatalogMerchantTip[];
}

export async function getMerchantTipBySlug(slug: string): Promise<CatalogMerchantTip> {
  const { data, error } = await supabase
    .from('catalog_merchant_tips')
    .select(`*, mcc_codes(*)`)
    .eq('merchant_slug', slug)
    .single();
  if (error) throw error;
  return { ...data, mcc_info: data.mcc_codes } as CatalogMerchantTip;
}

// ─── Articles ─────────────────────────────────────────────────────────────────

export async function getArticleBySlug(slug: string): Promise<CatalogArticle> {
  const { data, error } = await supabase
    .from('catalog_articles')
    .select(`*, catalog_cards(id, name, bank, slug, fee_type, fee_label, affiliate_url)`)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
  if (error) throw error;
  return { ...data, card: data.catalog_cards } as CatalogArticle;
}

// ─── Programs ─────────────────────────────────────────────────────────────────

export async function getHotelPrograms(): Promise<CatalogHotelProgram[]> {
  const { data, error } = await supabase.from('catalog_hotel_programs').select('*').order('name');
  if (error) throw error;
  return (data ?? []) as CatalogHotelProgram[];
}

export async function getAirlinePrograms(): Promise<CatalogAirlineProgram[]> {
  const { data, error } = await supabase.from('catalog_airline_programs').select('*').order('name');
  if (error) throw error;
  return (data ?? []) as CatalogAirlineProgram[];
}

export async function getLifestyleBrands(): Promise<CatalogLifestyleBrand[]> {
  const { data, error } = await supabase.from('catalog_lifestyle_brands').select('*').order('name');
  if (error) throw error;
  return (data ?? []) as CatalogLifestyleBrand[];
}

// ─── Calculator ───────────────────────────────────────────────────────────────

export async function getCalculatorConfig(cardSlug: string): Promise<CatalogCalculatorConfig> {
  const { data, error } = await supabase
    .from('catalog_calculator_configs')
    .select(`*, catalog_cards!inner(*)`)
    .eq('catalog_cards.slug', cardSlug)
    .single();
  if (error) throw error;
  return { ...data, card: data.catalog_cards } as CatalogCalculatorConfig;
}

export async function getAllCalculatorCards(): Promise<CatalogCard[]> {
  const { data, error } = await supabase
    .from('catalog_calculator_configs')
    .select(`catalog_cards(id, name, bank, slug, fee_type, fee_label)`);
  if (error) throw error;
  return (data ?? []).map((d: any) => d.catalog_cards) as CatalogCard[];
}
