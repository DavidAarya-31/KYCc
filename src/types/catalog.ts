export type FeeType = 'LTF' | 'FYF' | 'paid';
export type GuideSection = 'merchants' | 'rewards' | 'hotels' | 'airlines' | 'lifestyle';
export type UpdateType =
  | 'new_card' | 'benefit_change' | 'fee_change'
  | 'offer_update' | 'merchant_tip' | 'terms_change' | 'mcc_update';

export interface CatalogCard {
  id: string;
  slug: string;
  name: string;
  bank: string;
  network: string | null;
  fee_type: FeeType;
  fee_label: string | null;
  annual_fee: number;
  joining_fee: number;
  fee_waiver_spend: number | null;
  fee_waiver_label: string | null;
  forex_markup: string | null;
  point_value: string | null;
  rewards_cycle: string | null;
  short_description: string | null;
  thumbnail_url: string | null;
  card_image_url: string | null;
  affiliate_url: string | null;
  full_review_slug: string | null;
  key_perks: string[];
  joining_benefits: string[];
  renewal_benefits: string[];
  earns_on: string[];
  does_not_earn_on: string[];
  lounge_access: boolean;
  lounge_domestic: string | null;
  lounge_international: string | null;
  is_featured: boolean;
  is_published: boolean;
  launched_at: string | null;
  last_updated_at: string;
  update_notes: string | null;
  created_at: string;
  // Joined
  categories?: CatalogBenefitCategory[];
  merchants?: CatalogMerchantTip[];
}

export interface CatalogBenefitCategory {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface CatalogOffer {
  id: string;
  card_id: string;
  title: string;
  description: string | null;
  merchant: string | null;
  discount_value: string | null;
  min_transaction: number;
  max_discount: number | null;
  expiry_date: string | null;
  no_end_date: boolean;
  is_featured: boolean;
  affiliate_url: string | null;
  created_at: string;
  card?: Pick<CatalogCard, 'id' | 'name' | 'bank' | 'thumbnail_url' | 'slug'>;
}

export interface MCCCode {
  mcc: string;
  description: string;
  category: string | null;
  is_excluded_by_default: boolean;
}

export interface CatalogMerchantTip {
  id: string;
  merchant_name: string;
  merchant_slug: string;
  merchant_emoji: string;
  mcc: string | null;
  category: string | null;
  tip_text: string | null;
  full_tip: string | null;
  best_card_ids: string[];
  exclusions: string | null;
  created_at: string;
  mcc_info?: MCCCode;
  best_cards?: Pick<CatalogCard, 'id' | 'name' | 'bank' | 'thumbnail_url' | 'slug' | 'fee_type'>[];
}

export interface CatalogGuide {
  id: string;
  slug: string;
  title: string;
  section: GuideSection;
  sub_section: string | null;
  summary: string | null;
  content: string | null;
  thumbnail_url: string | null;
  tags: string[];
  is_featured: boolean;
  sort_order: number;
  launched_at: string | null;
  last_updated_at: string;
  created_at: string;
}

export interface CatalogArticle {
  id: string;
  slug: string;
  card_id: string | null;
  title: string;
  author: string;
  published_at: string | null;
  updated_at: string;
  content: string | null;
  summary: string | null;
  thumbnail_url: string | null;
  tags: string[];
  is_published: boolean;
  created_at: string;
  card?: Pick<CatalogCard, 'id' | 'name' | 'bank' | 'slug' | 'fee_type' | 'fee_label' | 'affiliate_url'>;
}

export interface CatalogHotelProgram {
  id: string; name: string; brand: string;
  logo_url: string | null; description: string | null;
  benefits: string[]; linked_card_ids: string[]; program_url: string | null;
}

export interface CatalogAirlineProgram {
  id: string; name: string; airline: string;
  logo_url: string | null; description: string | null;
  benefits: string[]; linked_card_ids: string[]; program_url: string | null;
}

export interface CatalogLifestyleBrand {
  id: string; name: string; category: string | null;
  logo_url: string | null; description: string | null;
  benefits: string[]; linked_card_ids: string[]; brand_url: string | null;
}

export interface SpendCategory {
  name: string;
  mccs: string[];
  rate: number;
  cap_monthly: number | null;
  type: 'points' | 'cashback' | 'miles';
}

export interface CalculatorTier {
  name: string;
  min_quarterly_spend: number;
  point_value_paise: number;
}

export interface CatalogCalculatorConfig {
  id: string;
  card_id: string;
  spend_categories: SpendCategory[];
  base_rate: number;
  point_value_paise: number;
  annual_fee: number;
  fee_waiver_spend: number | null;
  tiers: CalculatorTier[];
  created_at: string;
  card?: CatalogCard;
}

export interface CatalogCardUpdate {
  id: string;
  card_id: string;
  update_type: UpdateType;
  headline: string;
  details: string | null;
  effective_date: string;
  is_significant: boolean;
  created_at: string;
  card?: Pick<CatalogCard, 'id' | 'name' | 'bank' | 'slug' | 'thumbnail_url' | 'fee_type'>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function isNewCard(card: Pick<CatalogCard, 'launched_at'>): boolean {
  if (!card.launched_at) return false;
  return (Date.now() - new Date(card.launched_at).getTime()) / 86_400_000 <= 7;
}

export function isRecentlyUpdated(card: Pick<CatalogCard, 'launched_at' | 'last_updated_at'>): boolean {
  if (isNewCard(card)) return false;
  return (Date.now() - new Date(card.last_updated_at).getTime()) / 86_400_000 <= 7;
}
