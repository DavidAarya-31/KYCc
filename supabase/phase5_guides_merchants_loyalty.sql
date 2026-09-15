-- =============================================================================
-- PHASE 5 / 5: Offers, Merchant Tips, Strategy Guides, Hotels, Airlines, Lifestyle
-- =============================================================================

-- 1. Active Offers
INSERT INTO catalog_offers (
  title, description, merchant, discount_value, expiry_date, no_end_date, is_featured, affiliate_url
) VALUES (
  'BOB Etihad Guest Premium: 15,000 Bonus Miles',
  'Get up to 15,000 Etihad Guest Miles as a welcome bonus: 10,000 Miles on ₹25,000 spend within 60 days, plus 5,000 bonus Miles on ₹50,000 cumulative spend within 60 days of card issuance.',
  NULL,
  NULL,
  '2026-08-30',
  FALSE,
  FALSE,
  'https://captaintorch.in/go/bob-etihad'
);
INSERT INTO catalog_offers (
  title, description, merchant, discount_value, expiry_date, no_end_date, is_featured, affiliate_url
) VALUES (
  'Accor Plus',
  '2000 Bonus points for New membership purchase on website, 2000 Bonus points for renewal through customer care or email communication.',
  'Accor Plus',
  NULL,
  NULL,
  TRUE,
  FALSE,
  NULL
);

-- 2. Merchant Tips
INSERT INTO catalog_merchant_tips (
  merchant_name, merchant_slug, merchant_emoji, mcc, category, tip_text, full_tip, exclusions
) VALUES (
  'Ajio',
  'ajio',
  '🛍️',
  '5651',
  NULL,
  NULL,
  'ShoppingApparelFashion# Ajio

[Shop Now ↗](https://ajiio.in/0v8b8g7)

Online fashion retailer selling clothing and accessories. Apparel MCCs (5651, 5691) ·includes gold coin purchases.* Referral link · you get the same benefits, we may earn a small commission⚠️Merchant MCC codes are subject to change without notice. [Contact us on X](https://x.com/SartanparaYash) to report any changes so we can keep this accurate.Tips & Strategy💡Direct swipe on Ajio: OTP page shows "RELIANCE RETAIL LTD" (all caps, MCC 5651) or "Ajio com" (MCC 5691) · both eligible for 5X on Equitas Selfe (10% valueback at Diamond tier).💡RuPay CC on UPI: Select the UPI payment option, then pay via any UPI app to ajio1.payu@hdfcbank · codes as MCC 5691.💡Gold coins on Ajio code as Apparel (MCC 5651 or 5691) · use Selfe to earn 10% valueback on every gold purchase with no published monthly cap.💡Big Fashion Festival and End of Reason Sale: push spend above ₹3L in one quarter to unlock Diamond tier and maximise 10% valueback.Eligible MCCs & Card Picks5651Family Clothing Stores ·"RELIANCE RETAIL LTD" (all caps) on OTP[AU Lit Credit Card5%→](/cards/au-lit)[SBI Cashback Credit Card5%→](/cards/sbi-cashback)[PhonePe SBI Card SELECT BLACK5%→](/cards/sbi-phonepe-select-black)5691Misc. Apparel ·"Ajio com" on OTP · also via RuPay CC on UPI (ajio1.payu@hdfcbank)[Axis Bank Neo Credit Card10X→](/cards/axis-neo)[AU Lit Credit Card5%→](/cards/au-lit)[SBI Cashback Credit Card5%→](/cards/sbi-cashback)',
  NULL
) ON CONFLICT (merchant_slug) DO UPDATE SET
  merchant_name = EXCLUDED.merchant_name,
  merchant_emoji = EXCLUDED.merchant_emoji,
  mcc = EXCLUDED.mcc,
  category = EXCLUDED.category,
  tip_text = EXCLUDED.tip_text,
  full_tip = EXCLUDED.full_tip,
  exclusions = EXCLUDED.exclusions;
INSERT INTO catalog_merchant_tips (
  merchant_name, merchant_slug, merchant_emoji, mcc, category, tip_text, full_tip, exclusions
) VALUES (
  'Amazon',
  'amazon',
  '🛍️',
  '5399',
  NULL,
  NULL,
  'ShoppingElectronicsGroceryGift Cards# Amazon

[Shop Now ↗](https://amzn.to/4tuelGj)

E-commerce marketplace selling electronics, books, groceries, and more. Codes as MCC 5399 ("ASSPL") for most purchases, 5699 for general retail, and 5262 ("AMAZON PAY INDIA PRIVATET") sometimes. MCC 5947 for gift cards.* Referral link · you get the same benefits, we may earn a small commission⚠️Merchant MCC codes are subject to change without notice. [Contact us on X](https://x.com/SartanparaYash) to report any changes so we can keep this accurate.Tips & Strategy💡Most Amazon purchases code as MCC 5399 ("ASSPL" on OTP) · Equitas Selfe earns 5X (grocery MCC), HDFC Regalia Gold, BoB Eterna, and YES RESERV are also top picks here.💡"AMAZON PAY INDIA PRIVATET" on OTP sometimes codes as MCC 5262 (Marketplace) instead of 5699 · BoB Eterna earns on both.💡Amazon Gift Cards code as MCC 5947 · HDFC Regalia Gold, BoB Eterna, and YES RESERV earn rewards on this MCC.💡Bank of Baroda is a reliable primary partner for Amazon Great Indian Festival · stack the 10% bank offer with 3.75% BoB Eterna rewards for an effective ~13.75% off.Eligible MCCs & Card Picks5399Misc. General Merchandise ·"ASSPL" on OTP[HDFC MoneyBack+ Credit Card10X→](/cards/hdfc-moneyback-plus)[SBI SimplyCLICK Credit Card10X→](/cards/sbi-simplyclick)[SBI Cashback Credit Card5%→](/cards/sbi-cashback)5262Marketplace ·"AMAZON PAY" on OTP (sometimes) and settle as Amazon pay india private in recent transactions.

No card earns on this MCC · verify exclusions before using5699Misc. & Specialty Retail ·general Amazon purchases[AU Lit Credit Card5%→](/cards/au-lit)[Swiggy HDFC Bank Credit Card5%→](/cards/hdfc-swiggy)5947Gift/Novelty ·"Amazon Gift card" on OTP[BoB Eterna Credit Card3.75%→](/cards/bob-eterna)[YES RESERV Credit Card3%→](/cards/yes-reserv)[HDFC Regalia Gold Credit Card1.25%→](/cards/hdfc-regalia-gold)',
  NULL
) ON CONFLICT (merchant_slug) DO UPDATE SET
  merchant_name = EXCLUDED.merchant_name,
  merchant_emoji = EXCLUDED.merchant_emoji,
  mcc = EXCLUDED.mcc,
  category = EXCLUDED.category,
  tip_text = EXCLUDED.tip_text,
  full_tip = EXCLUDED.full_tip,
  exclusions = EXCLUDED.exclusions;
INSERT INTO catalog_merchant_tips (
  merchant_name, merchant_slug, merchant_emoji, mcc, category, tip_text, full_tip, exclusions
) VALUES (
  'Flipkart',
  'flipkart',
  '🛍️',
  '5699',
  NULL,
  NULL,
  'ShoppingElectronicsGroceryFashion# Flipkart

[Shop Now ↗](https://fktr.in/HzMUNYr)

E-commerce marketplace selling electronics, fashion, groceries, and more. Codes across multiple MCCs depending on purchase type · 5699 (general), 5411 (Grocery/Supermart), 5944 (Jewelry/Watches), 5262 (Marketplace), 5947 (Gift Cards).* Referral link · you get the same benefits, we may earn a small commission⚠️Merchant MCC codes are subject to change without notice. [Contact us on X](https://x.com/SartanparaYash) to report any changes so we can keep this accurate.Tips & Strategy💡General Flipkart shopping (electronics, mobiles, appliances) codes as MCC 5699 · OTP shows "FlipkartInternetPrivate". BoB Eterna earns 3.75% as an online spend.💡Flipkart Supermart (grocery orders) codes as MCC 5411 · OTP shows "FLIPKART INTERNET PRIVA". Earns 5X on Equitas Selfe (10% valueback at Diamond tier) · ideal for grocery top-ups.💡Jewelry and watches on Flipkart code as MCC 5944 · OTP shows "Flipkart Internet Private Limited". Check your card''s jewelry MCC eligibility before large purchases.💡Marketplace third-party sellers code as MCC 5262 · OTP shows "Flipkart Internet P". BoB Eterna earns full 3.75% here as well.💡Flipkart Gift Cards code as MCC 5947 · OTP shows "FLIPKART". HDFC Regalia Gold, BoB Eterna, and YES RESERV earn rewards on this MCC.💡Bank of Baroda is a frequent partner on Big Billion Days · stack the 10% bank offer with 3.75% BoB Eterna rewards for effective ~13.75% off.Eligible MCCs & Card Picks5699Misc. & Specialty Retail ·"FlipkartInternetPrivate" on OTP[AU Lit Credit Card5%→](/cards/au-lit)[Swiggy HDFC Bank Credit Card5%→](/cards/hdfc-swiggy)5411Grocery ·"FLIPKART INTERNET PRIVA" on OTP (Flipkart Supermart)[HSBC Live+ Credit Card10%→](/cards/hsbc-live-plus)[SBI Card PRIME10X→](/cards/sbi-prime)[SBI SimplySAVE Credit Card10X→](/cards/sbi-simplysave)5944Jewelry/Watches ·"Flipkart Internet Private Limited" on OTP[BoB Eterna Credit Card3.75%→](/cards/bob-eterna)5262Marketplace / Catalog ·"Flipkart Internet P" on OTP

No card earns on this MCC · verify exclusions before using5947Gift Cards ·"FLIPKART" on OTP[BoB Eterna Credit Card3.75%→](/cards/bob-eterna)[YES RESERV Credit Card3%→](/cards/yes-reserv)[HDFC Regalia Gold Credit Card1.25%→](/cards/hdfc-regalia-gold)',
  NULL
) ON CONFLICT (merchant_slug) DO UPDATE SET
  merchant_name = EXCLUDED.merchant_name,
  merchant_emoji = EXCLUDED.merchant_emoji,
  mcc = EXCLUDED.mcc,
  category = EXCLUDED.category,
  tip_text = EXCLUDED.tip_text,
  full_tip = EXCLUDED.full_tip,
  exclusions = EXCLUDED.exclusions;
INSERT INTO catalog_merchant_tips (
  merchant_name, merchant_slug, merchant_emoji, mcc, category, tip_text, full_tip, exclusions
) VALUES (
  'Myntra',
  'myntra',
  '🛍️',
  '5691',
  NULL,
  NULL,
  'ShoppingApparelFashion# Myntra

[Shop Now ↗](https://myntr.it/of19Ij2)

Online fashion marketplace (owned by Flipkart). Codes as Apparel MCC 5691 ("MYNTRA BANGLORE") for most purchases, MCC 5699 ("Myntra bangluru") for some transactions, and MCC 5944 for fine jewellery.* Referral link · you get the same benefits, we may earn a small commission⚠️Merchant MCC codes are subject to change without notice. [Contact us on X](https://x.com/SartanparaYash) to report any changes so we can keep this accurate.Tips & Strategy💡Direct swipe: Myntra codes as MCC 5691 (Apparels & Accessories) · OTP shows "MYNTRA BANGLORE". BoB Eterna earns 15 RP/₹100 (3.75% valueback) as statement credit.💡BoB Eterna is a frequent primary partner on Myntra sale events, stacking a 10% instant discount on top of the 3.75% rewards.💡PhonePe route (Selfe 5X): At checkout select PhonePe UPI / Scan and Pay, then pay with Equitas Selfe added under credit/debit card in PhonePe. OTP page must show "MYNTRA BANGLORE" ✅ (MCC 5691) · "Myntra bangluru" ❌ (MCC 5699) is NOT eligible for 5X. Tip: place the order, check transaction history to verify, and cancel immediately if it shows the wrong name.💡CC on UPI (Selfe 5X): Scan the Myntra QR code via any UPI app, then pay with your Equitas Selfe RuPay CC added on UPI. UPI IDs: Myntra@axl or Myntra@ybl · both code as MCC 5691.💡MCC 5699 ("Myntra bangluru"): earns base rate on most cards but qualifies for 5% Category Cashback on AU Lit (AU Lit includes MCC 5699 in its broad Apparel definition).💡Gold coins on Myntra code as MCC 5944 (Fine Jewellery · OTP shows "WWW MYNTRA COM FINE JEWELLARY"). BoB Eterna earns 15 RP/₹100 (3.75% valueback) since it rewards all online spends regardless of MCC. Does NOT earn Apparel 5X on Equitas Selfe.Eligible MCCs & Card Picks5691Misc. Apparel ·"MYNTRA BANGLORE" on OTP · via PhonePe / CC-on-UPI (Myntra@axl · Myntra@ybl)[Axis Bank Neo Credit Card10X→](/cards/axis-neo)[Axis Flipkart Credit Card7.5%→](/cards/axis-flipkart)[AU Lit Credit Card5%→](/cards/au-lit)5699Misc. Retail ·"Myntra bangluru" on OTP · NOT eligible for Selfe 5X (earns base rate)[AU Lit Credit Card5%→](/cards/au-lit)[Swiggy HDFC Bank Credit Card5%→](/cards/hdfc-swiggy)5944Fine Jewellery / Gold coins · "WWW MYNTRA COM FINE JEWELLARY" on OTP · earns BoB Eterna online rate (3.75%)[BoB Eterna Credit Card3.75%→](/cards/bob-eterna)',
  NULL
) ON CONFLICT (merchant_slug) DO UPDATE SET
  merchant_name = EXCLUDED.merchant_name,
  merchant_emoji = EXCLUDED.merchant_emoji,
  mcc = EXCLUDED.mcc,
  category = EXCLUDED.category,
  tip_text = EXCLUDED.tip_text,
  full_tip = EXCLUDED.full_tip,
  exclusions = EXCLUDED.exclusions;
INSERT INTO catalog_merchant_tips (
  merchant_name, merchant_slug, merchant_emoji, mcc, category, tip_text, full_tip, exclusions
) VALUES (
  'Paytm',
  'paytm',
  '🛍️',
  '4900',
  NULL,
  NULL,
  'UtilitiesBillsPayments# Paytm

Utility bill payment app supporting electricity, prepaid mobile, postpaid mobile, gas, water and more. Codes as Utilities (MCC 4900) · OTP shows "Paytm Utility".⚠️Merchant MCC codes are subject to change without notice. [Contact us on X](https://x.com/SartanparaYash) to report any changes so we can keep this accurate.Tips & Strategy💡Utility bill payments via Paytm (electricity, gas, water) code as MCC 4900 · OTP page shows "Paytm Utility". Earns 5X on Equitas Selfe ·no monthly cap unlike grocery.💡Prepaid and postpaid mobile recharges via Paytm also code as MCC 4900 in most cases · same 5X earn on Selfe.💡Avoid wallet reload / Paytm Wallet top-ups · they recode as MCC 6540 and earn zero rewards. Always pay directly to the biller.💡Utility spend is uncapped on Selfe · a ₹5,000–₹10,000/month electricity + gas + mobile bill easily pushes you toward the Diamond tier target.Eligible MCCs & Card Picks4900Utilities ·"Paytm Utility" on OTP · electricity, gas, water, prepaid, postpaid[Airtel Axis Bank Credit Card10%→](/cards/axis-airtel)[Axis Ace Credit Card5%→](/cards/axis-ace)[ICICI Bank HPCL Super Saver Credit Card5%→](/cards/icici-hpcl-super-saver)',
  NULL
) ON CONFLICT (merchant_slug) DO UPDATE SET
  merchant_name = EXCLUDED.merchant_name,
  merchant_emoji = EXCLUDED.merchant_emoji,
  mcc = EXCLUDED.mcc,
  category = EXCLUDED.category,
  tip_text = EXCLUDED.tip_text,
  full_tip = EXCLUDED.full_tip,
  exclusions = EXCLUDED.exclusions;
INSERT INTO catalog_merchant_tips (
  merchant_name, merchant_slug, merchant_emoji, mcc, category, tip_text, full_tip, exclusions
) VALUES (
  'Vi (Vodafone Idea)',
  'vi',
  '🛍️',
  '4814',
  NULL,
  NULL,
  'UtilitiesTelecomBills# Vi (Vodafone Idea)

Telecom operator app for prepaid recharges, postpaid bill payments, and data add-ons. Codes as Telecom Services (MCC 4814) · OTP shows "VI".⚠️Merchant MCC codes are subject to change without notice. [Contact us on X](https://x.com/SartanparaYash) to report any changes so we can keep this accurate.Tips & Strategy💡Prepaid recharges and postpaid bill payments via the Vi App code as MCC 4814 · OTP page shows "VI". Earns 5X on Equitas Selfe ·no monthly cap.💡MCC 4814 covers all telecom services · voice, data, SMS packs all qualify.💡Paying via the official Vi App is the safest route to lock in MCC 4814 · third-party bill payment apps may code differently.Eligible MCCs & Card Picks4814Telecommunication Services ·"VI" on OTP · prepaid, postpaid, data add-ons[Airtel Axis Bank Credit Card25%→](/cards/axis-airtel)[Equitas Selfe Credit Cardup to 10%→](/cards/equitas-selfe)',
  NULL
) ON CONFLICT (merchant_slug) DO UPDATE SET
  merchant_name = EXCLUDED.merchant_name,
  merchant_emoji = EXCLUDED.merchant_emoji,
  mcc = EXCLUDED.mcc,
  category = EXCLUDED.category,
  tip_text = EXCLUDED.tip_text,
  full_tip = EXCLUDED.full_tip,
  exclusions = EXCLUDED.exclusions;
INSERT INTO catalog_merchant_tips (
  merchant_name, merchant_slug, merchant_emoji, mcc, category, tip_text, full_tip, exclusions
) VALUES (
  'Zepto / Blinkit',
  'zepto-blinkit',
  '🛍️',
  '5411',
  NULL,
  NULL,
  'GroceryQuick CommerceFood & Essentials# Zepto / Blinkit

Quick-commerce apps delivering groceries and daily essentials. Categories as Grocery (MCC 5411) and Misc. Food Stores (MCC 5499).⚠️Merchant MCC codes are subject to change without notice. [Contact us on X](https://x.com/SartanparaYash) to report any changes so we can keep this accurate.Tips & Strategy💡Quick-commerce apps code as Grocery (MCC 5411), earning 5X on Equitas Selfe ·10% valueback at Diamond tier.💡Grocery rewards are capped at 2,000 points/month; spread orders across the month rather than one large order.💡UPI payments on these apps are eligible ·link your Equitas Selfe card as the UPI source to earn points on every order.Eligible MCCs & Card Picks5411Grocery Stores & Supermarkets[HSBC Live+ Credit Card10%→](/cards/hsbc-live-plus)[SBI Card PRIME10X→](/cards/sbi-prime)[SBI SimplySAVE Credit Card10X→](/cards/sbi-simplysave)5499Misc. Food Stores[HSBC Live+ Credit Card10%→](/cards/hsbc-live-plus)[Kotak Cashback+ Credit Card5%→](/cards/kotak-cashback-plus)',
  NULL
) ON CONFLICT (merchant_slug) DO UPDATE SET
  merchant_name = EXCLUDED.merchant_name,
  merchant_emoji = EXCLUDED.merchant_emoji,
  mcc = EXCLUDED.mcc,
  category = EXCLUDED.category,
  tip_text = EXCLUDED.tip_text,
  full_tip = EXCLUDED.full_tip,
  exclusions = EXCLUDED.exclusions;

-- 3. Strategy Guides
INSERT INTO catalog_guides (
  slug, title, section, sub_section, summary, content, thumbnail_url, tags, is_featured, sort_order
) VALUES (
  'utility-payments',
  '⚡ Utility Payments Guide',
  'rewards',
  'utility-payments',
  'Which credit cards have no surcharge on utility payments, and which ones give uncapped cashback. Surcharge trigger limits for all major Indian banks.',
  '# ⚡ Utility Payments Guide

Surcharge limits & uncapped cashback · Updated March 2026⚠️This data may be outdated · surcharge thresholds and cashback rates change without notice. Always verify with your bank''s latest T&Cs before making large utility payments. Found incorrect info? [Report it on X →](https://x.com/SartanparaYash)## Utility Payment Surcharge Limits

Threshold above which your bank charges a surcharge on utility transactions| Bank / Card | Surcharge Trigger | Limit Type |
| --- | --- | --- |
| 👑Equitas Selfe | No Limit | ✅ NO SURCHARGE |
| PNB Luxura | No Limit | NO SURCHARGE |
| IDFC | Above ₹20,000 | Per Statement |
| YES Bank | Above ₹15,000 | Per Statement |
| IndusInd | Above ₹25,000 | Per Statement |
| AXIS | ⚠️At or Above ₹25,000 | Per Statement |
| RBL | Above ₹50,000 | Per Statement |
| SBI | Above ₹50,000 | Per Statement |
| ICICI | Above ₹50,000 | Per Transaction |
| HDFC (Consumer Cards) | Above ₹50,000 | Per Statement |
| BOB | Above ₹50,000 | Per Transaction |
| DBS | Above ₹20,000 | Per Statement |
| OneCard | ⚠️At or Above ₹10,000 | Per Statement |

---

## Cards with Uncapped Utility Cashback

Cards that earn rewards on utility spends · rates vary by payment channel| Credit Card | Cashback / Reward Rate | Notes / Tier |
| --- | --- | --- |
| 👑Equitas SelfeTOP CHOICE | 10% | On Diamond Tier · uncapped |
| Tata Neu Infinity (HDFC) | 5% | Via Tata Neu app · 2,000 NeuCoins/month cap |
| 1.5% | Via third-party apps |
| Equitas Tiga | 3% | On Diamond Tier |
| Tata Neu Plus (HDFC) | 2% | Via Tata Neu app · 2,000 NeuCoins/month cap |
| 1% | Via third-party apps |
| PNB Luxura | 1% | Uncapped Reward Rate |
| Bob Snapdeal | 1% | Uncapped Reward Rate |
| Bob Eterna | 0.75% | Uncapped Reward Rate |⚠️**Tata Neu cards · heads up:** Not all utility billers work the same way. Private players like Tata Power and Airtel are generally fine, but some state-run electricity boards have been reported to not earn NeuCoins at all, regardless of which app you pay through. Worth doing a small test payment before relying on this card for your main electricity bill.[← Back to Rewards Guide](/guide/rewards)',
  NULL,
  '{}'::text[],
  FALSE,
  0
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  section = EXCLUDED.section,
  sub_section = EXCLUDED.sub_section,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order;
INSERT INTO catalog_guides (
  slug, title, section, sub_section, summary, content, thumbnail_url, tags, is_featured, sort_order
) VALUES (
  'cc-bill-via-dc',
  '💳 Earn Rewards on CC Bill Payments',
  'rewards',
  'cc-bill-via-dc',
  'Which debit cards earn cashback on credit card bill payments in 2026 · HDFC Rewards DC, Kotak 811 Super, RBL Enterprise, RBL Signature+, BOI Star Rewardz, SBI Rewardz DC, and the payment routes that trigger each MCC.',
  '# 💳 Earn Rewards on CC Bill Payments

Pay your credit card bill via debit card · earn cashback on the payment itself⚠️Cashback rates, caps, and eligible MCCs change frequently · always verify with your bank''s latest T&Cs before making large payments. Found incorrect info? [Report it on X →](https://x.com/SartanparaYash)Most people pay their credit card bill and earn nothing on the transaction. But certain debit cards treat CC bill payments as utility, telecom, or financial service spends · categories that earn accelerated cashback. The trick is knowing which payment portal triggers the right MCC and pairing it with the right debit card.## Debit Cards That Earn on CC Bill Payments

Cashback rates, caps, and eligible payment routes per cardHDFC Rewards DCVisaRate

5% cashbackCap

₹2,000 / monthBest Route

Payzapp appMCC

Various (CC bill, utility, insurance, recharges)

Save the debit card on Payzapp before first use · "debit card not supported" error otherwise. Also earns 5% on fuel at BPCL on HDFC terminals.Kotak 811 Super DCVisaRate

5% cashbackCap

₹100 / txn · ₹500 / monthBest Route

Vi app (MCC 4814)MCC

4814 · Telecom

Cap was recently restricted to ₹100 per transaction and ₹500 per month. Vi app charges 0.66% surcharge on Visa/Mastercard debit cards · factor this into your effective return. Max transaction amount on Vi app: ₹1,985.RBL Enterprise DCVisaRate

5% cashbackCap

₹500 / month (telecom) · ₹1,000 / month (utility)Best Route

Vi app · BOB / Axis (milestone only)MCC

4814 · 4900 · 9399 · 6300

Vi app codes as MCC 4814 (telecom) 99% of the time · max ₹1,985 per transaction with 0.66% surcharge on Visa/Mastercard DC. Occasionally Razorpay gateway opens on Vi app and codes as MCC 4900 (utility, ₹1,000 cap). BOB/Axis portals earn milestone benefit only, not cashback.RBL Signature+ DCVisaRate

2% cashbackCap

Per T&CBest Route

BOB website · Axis app · Vi appMCC

9399 · 6300 · 4814

1% surcharge applies on Vi app for Visa/Mastercard DCs · factor this into effective cashback. BOB and Axis routes have no surcharge.BOI Star Rewardz DC (RuPay)RuPayRate

Up to 0.75%–1%+ (tiered)Cap

10,000 RP / month per CIF · 1 RP = ₹0.25Best Route

Zavo · Mobikwik · CRED · Billdesk sitesMCC

CC bill / PoS / E-commerce (all categories, no exclusions from Sep 2025)

RuPay Select DC gets an additional card-wise bonus on transactions above ₹10,000. Best used on transactions of ₹10,001 or more. CC bill rewards credit in 3–7 days via Zavo and JioFin. RuPay Platinum variant also earns. All PoS and e-commerce exclusions removed from 01.09.2025. RP validity: 3 years.Tiered Earning · per transaction amount

Rate depends on transaction size · tiering is per-transaction, not cumulative| Transaction Amount | RP per ₹100 | Effective Rate |
| --- | --- | --- |
| ₹0 – ₹5,000 | 1 RP | 0.25% |
| ₹5,001 – ₹10,000 | 1.5 RP | 0.375% |
| Above ₹10,000 | 3 RP (including Select bonus) | 0.75%+ |🎯Optimal strategy: pay ₹10,001 or more per transaction to earn 2 RP/₹100 on the full amount.🏦All PoS and e-commerce categories eligible from 01.09.2025 · includes CC bill, online shopping, offline PoS.📊Max 10,000 RP per month per CIF · RP valid for 3 years from earning date.💳RuPay Platinum also earns · BOI offers free RuPay classic DC to all account holders with no annual charges.

Source: @AbhiChtrj on XSBI Rewardz DC (RuPay)RuPayRate

2 RP / ₹200 · up to 2x with Elite tierCap

1,000 RP / ₹1L spend · posted at month endBest Route

Paytm · Canara Setu · Billdesk · Vi app · Navi · Zavo · UnipayMCC

CC bill / Utility / Telecom (RuPay)

Apply the RuPay variant · accepted on Paytm, Canara Setu, Billdesk, Zavo, Vi app, Unipay, Navi · no extra charges. Also works for Amex and SCB Bank CC bills. Points locked 30 days from posting. Birthday month earns 2x.SBI Rewardz Tier System

Tier multiplier on base RP · evaluated on the 10th of each month| Tier | Multiplier | Monthly RP Required |
| --- | --- | --- |
| Elite | 2.0x | 7,000+ RP / month |
| Affluent | 1.5x | 2,000+ RP / month |
| Dreamer | 1.0x | Default |📅Tier is based on the higher of your bank-assigned segment or RP earned in the previous calendar month · upgraded on the 10th of every month.📉Downgrades only on 10th Jan and 10th Jul · max one level drop. Customers in the highest bank segment are never downgraded.⚠️Cap: 1,000 RP per ₹1 lakh spend per month · posted at month end. Only Bank Points count toward tier evaluation (multiplier points excluded).🐢New users: SBI may delay reward crediting by 2–8 months · file a complaint with SBI Rewards team after 2–4 months to unlock all pending rewards.

Source: @AbhiChtrj on X

---

## Payment Routes · MCC by Portal

The portal you use determines the MCC · which determines which debit card earns| Portal | MCC | Surcharge | Best Card |
| --- | --- | --- | --- |
| Payzapp app | VariousCC Bill / Utility / Recharge | None | HDFC Rewards DC · 5% up to ₹2,000/month |
| BOB website · pay.bobcard.co.in | 9399Govt / Misc Services | None | RBL Signature+ DC · 2% · RBL Enterprise DC · milestone |
| Axis app / Net Banking (debit card option) | 6300Insurance / Financial | None | RBL Signature+ DC · 2% · RBL Enterprise DC · milestone |
| Vi app (Vi SIM required) | 4814Telecom Services | 0.66% on Visa/MC DC · max ₹1,985/txn | RBL Enterprise DC · 5% up to ₹500 · Kotak 811 Super · 5% up to ₹100/txn |●**Payzapp app:** Supports most bank CC bill payments. Save your debit card in Payzapp settings first.●**BOB website · pay.bobcard.co.in:** Select Razorpay as the payment gateway to trigger MCC 9399. Only for BoB credit card holders.●**Axis app / Net Banking (debit card option):** Select the "debit card" payment method inside Axis app or netbanking. Only for Axis credit card holders.●**Vi app (Vi SIM required):** You can log in with a friend or relative''s Vi number. Max transaction amount is ₹1,985 · 0.66% surcharge applies on Visa/Mastercard DC. Occasionally codes as MCC 4900 (utility) via Razorpay gateway.

---

---

## Key Tips Before You Start

📱

Always save your debit card on Payzapp before making the first payment · attempting payment without saving the card first results in a "debit card not supported" error.🔵

Vi app charges a 0.66% surcharge on Visa/Mastercard debit cards and caps each transaction at ₹1,985. For RBL Enterprise at 5%, the net return is still positive · for lower-rate cards, check if the surcharge makes it worthwhile.🔀

Vi app sometimes switches from MCC 4814 (telecom, ₹500 cap) to MCC 4900 (utility, ₹1,000 cap) via Razorpay. Check the merchant category in your transaction history after the first payment.🎯

BOB and Axis portals earn milestone benefit only on RBL Enterprise DC · not direct cashback. Factor this into your decision if you are targeting milestone thresholds.⚡

HDFC Rewards DC on Payzapp is the broadest option · it works across CC bill payments from multiple banks, not just HDFC. Cap of ₹2,000/month is generous for most users.[← Back to Rewards Guide](/guide/rewards)',
  NULL,
  '{}'::text[],
  FALSE,
  1
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  section = EXCLUDED.section,
  sub_section = EXCLUDED.sub_section,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order;
INSERT INTO catalog_guides (
  slug, title, section, sub_section, summary, content, thumbnail_url, tags, is_featured, sort_order
) VALUES (
  'hotels-index',
  '🏨 Hotels Guide',
  'hotels',
  NULL,
  'Hotel loyalty programmes, reward stays, and the best credit cards for hotel spend in India. Marriott Bonvoy, Taj InnerCircle, ITC Culinaire · earn elite status faster.',
  '# 🏨 Hotels Guide

Hotel loyalty programmes and how to earn more on every stay🏰

## Taj InnerCircle

Earn InnerCircle points on every Taj, Vivanta, and SeleQtions stay. Points redeem for free nights, dining credits, and spa access. Accelerated earning with HDFC Infinia and Axis Reserve · both offer 2X or higher multipliers on Taj properties.🌿

## ITC Culinaire

ITC Hotels rewards programme covers stays and dining across ITC, WelcomHotel, and Fortune properties. Dining transactions at ITC restaurants often code as Dining MCC, earning 5X on Equitas Selfe. Points carry over with no expiry for active members.🌍

## Marriott Bonvoy

Marriott Bonvoy points redeem across 8,000+ hotels globally or transfer to 40+ airline miles programmes. The HDFC Bank Marriott Bonvoy Credit Card earns 8 pts/₹200 at Marriott properties, delivers Silver Elite status, 12+12 lounge access, and Free Night Awards on joining, renewal, and milestones.[Read full review →](/articles/hdfc-marriott-bonvoy)',
  NULL,
  '{}'::text[],
  FALSE,
  2
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  section = EXCLUDED.section,
  sub_section = EXCLUDED.sub_section,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order;
INSERT INTO catalog_guides (
  slug, title, section, sub_section, summary, content, thumbnail_url, tags, is_featured, sort_order
) VALUES (
  'airlines-index',
  '✈️ Airlines Guide',
  'airlines',
  NULL,
  'Airline miles, frequent flyer programmes, and the best credit cards for earning on flight spend in India. InterMiles, Air India, IndiGo, and more.',
  '# ✈️ Airlines Guide

Airline miles programmes and how to earn more on every flight🔵

## InterMiles

One of the most versatile Indian miles currencies ·redeem for flights on Etihad and 50+ partner airlines, hotel stays, and shopping vouchers. ICICI Bank cards have strong earn partnerships with InterMiles. Points can be earned on everyday spends via linked cards, not just flights.🔴

## Air India Flying Returns

Earn Flying Returns miles on every Air India flight and via partner banks including SBI and Bank of Baroda. Miles redeem for flight upgrades and free tickets on Air India routes. BoB Eterna earns online spend rewards that can be used toward Air India bookings made through the website.🟦

## IndiGo 6E Rewards

IndiGo''s loyalty programme lets you earn 6E points on every booking redeemable against future fares. Best for frequent domestic travellers on a budget. Use a card with strong online spend rewards (like BoB Eterna at 3.75%) when booking on the IndiGo website to stack card rewards on top of 6E points.',
  NULL,
  '{}'::text[],
  FALSE,
  3
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  section = EXCLUDED.section,
  sub_section = EXCLUDED.sub_section,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order;
INSERT INTO catalog_guides (
  slug, title, section, sub_section, summary, content, thumbnail_url, tags, is_featured, sort_order
) VALUES (
  'lifestyle-index',
  '💆 Lifestyle Guide',
  'lifestyle',
  NULL,
  'Wellbi, FitPass Pro, BOGO movies, golf rounds, and other lifestyle perks bundled with Indian credit cards · know which card to use for each benefit.',
  '# 💆 Lifestyle Guide

Wellness, fitness, and entertainment perks from your credit card🧘

## Wellbi

Bamboo activewear that actually holds up at the gym · smooth fabric, odor-free tech, and available through Cred Coin Rush. Use code CAPTAINTORCH for 20% off.[Read Review →](/guide/lifestyle/wellbi)🏋️

## FitPass Pro

FitPass Pro gives you access to 5,000+ gyms and fitness studios across India under a single membership. BoB Eterna includes a FitPass Pro membership as a welcome benefit on joining · one of the best free perks on an entry-level card. Activate within 30 days of card issuance.🎬

## BOGO Movie Tickets

Buy One Get One free movie tickets are available monthly on several cards. BoB Eterna offers ₹250 BOGO via the District app every month · that is ₹3,000 saved per year if you use it consistently. BookMyShow also runs BOGO offers with HDFC, Axis, and SBI cards.',
  NULL,
  '{}'::text[],
  FALSE,
  4
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  section = EXCLUDED.section,
  sub_section = EXCLUDED.sub_section,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order;

-- 4. Hotel Loyalty Programs
INSERT INTO catalog_hotel_programs (
  name, brand, logo_url, description, benefits, program_url
) VALUES (
  'Taj InnerCircle',
  'Taj',
  NULL,
  'Earn InnerCircle points on every Taj, Vivanta, and SeleQtions stay. Points redeem for free nights, dining credits, and spa access. Accelerated earning with HDFC Infinia and Axis Reserve · both offer 2X or higher multipliers on Taj properties.',
  '{}'::text[],
  NULL
);
INSERT INTO catalog_hotel_programs (
  name, brand, logo_url, description, benefits, program_url
) VALUES (
  'ITC Culinaire',
  'ITC',
  NULL,
  'ITC Hotels rewards programme covers stays and dining across ITC, WelcomHotel, and Fortune properties. Dining transactions at ITC restaurants often code as Dining MCC, earning 5X on Equitas Selfe. Points carry over with no expiry for active members.',
  '{}'::text[],
  NULL
);
INSERT INTO catalog_hotel_programs (
  name, brand, logo_url, description, benefits, program_url
) VALUES (
  'Marriott Bonvoy',
  'Marriott',
  NULL,
  'Marriott Bonvoy points redeem across 8,000+ hotels globally or transfer to 40+ airline miles programmes. The HDFC Bank Marriott Bonvoy Credit Card earns 8 pts/₹200 at Marriott properties, delivers Silver Elite status, 12+12 lounge access, and Free Night Awards on joining, renewal, and milestones.',
  '{}'::text[],
  NULL
);

-- 5. Airline Programs
INSERT INTO catalog_airline_programs (
  name, airline, logo_url, description, benefits, program_url
) VALUES (
  'InterMiles',
  'InterMiles',
  NULL,
  'One of the most versatile Indian miles currencies ·redeem for flights on Etihad and 50+ partner airlines, hotel stays, and shopping vouchers. ICICI Bank cards have strong earn partnerships with InterMiles. Points can be earned on everyday spends via linked cards, not just flights.',
  '{}'::text[],
  NULL
);
INSERT INTO catalog_airline_programs (
  name, airline, logo_url, description, benefits, program_url
) VALUES (
  'Air India Flying Returns',
  'Air',
  NULL,
  'Earn Flying Returns miles on every Air India flight and via partner banks including SBI and Bank of Baroda. Miles redeem for flight upgrades and free tickets on Air India routes. BoB Eterna earns online spend rewards that can be used toward Air India bookings made through the website.',
  '{}'::text[],
  NULL
);
INSERT INTO catalog_airline_programs (
  name, airline, logo_url, description, benefits, program_url
) VALUES (
  'IndiGo 6E Rewards',
  'IndiGo',
  NULL,
  'IndiGo''s loyalty programme lets you earn 6E points on every booking redeemable against future fares. Best for frequent domestic travellers on a budget. Use a card with strong online spend rewards (like BoB Eterna at 3.75%) when booking on the IndiGo website to stack card rewards on top of 6E points.',
  '{}'::text[],
  NULL
);

-- 6. Lifestyle Brands
INSERT INTO catalog_lifestyle_brands (
  name, category, logo_url, description, benefits, brand_url
) VALUES (
  'Wellbi',
  'Fitness & Wellness',
  NULL,
  'Bamboo activewear that actually holds up at the gym · smooth fabric, odor-free tech, and available through Cred Coin Rush. Use code CAPTAINTORCH for 20% off.',
  '{}'::text[],
  'https://captaintorch.in/guide/lifestyle/wellbi'
);
INSERT INTO catalog_lifestyle_brands (
  name, category, logo_url, description, benefits, brand_url
) VALUES (
  'FitPass Pro',
  'Fitness & Wellness',
  NULL,
  'FitPass Pro gives you access to 5,000+ gyms and fitness studios across India under a single membership. BoB Eterna includes a FitPass Pro membership as a welcome benefit on joining · one of the best free perks on an entry-level card. Activate within 30 days of card issuance.',
  '{}'::text[],
  NULL
);
INSERT INTO catalog_lifestyle_brands (
  name, category, logo_url, description, benefits, brand_url
) VALUES (
  'BOGO Movie Tickets',
  'Entertainment',
  NULL,
  'Buy One Get One free movie tickets are available monthly on several cards. BoB Eterna offers ₹250 BOGO via the District app every month · that is ₹3,000 saved per year if you use it consistently. BookMyShow also runs BOGO offers with HDFC, Axis, and SBI cards.',
  '{}'::text[],
  NULL
);
