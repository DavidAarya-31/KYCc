import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCatalogCardBySlug } from '../../lib/catalog';
import { FeeBadge } from '../../components/catalog/FeeBadge';
import { StatusBadge } from '../../components/catalog/StatusBadge';
import type { CatalogCard } from '../../types/catalog';

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">{children}</h2>;
}

export function ExploreCardDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<CatalogCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getCatalogCardBySlug(slug).then(setCard).catch(() => setCard(null)).finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: card?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse max-w-3xl mx-auto">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`rounded-xl bg-gray-100 dark:bg-gray-800 ${i === 0 ? 'h-32' : 'h-40'}`} />
      ))}
    </div>
  );

  if (!card) return (
    <div className="text-center py-20 max-w-3xl mx-auto">
      <p className="text-gray-500 dark:text-gray-400 mb-4">Card not found</p>
      <button onClick={() => navigate('/discover/explore')} className="text-sm text-blue-600 dark:text-blue-400 underline">
        Back to Explore
      </button>
    </div>
  );

  const details = [
    { label: 'Network',       value: card.network },
    { label: 'Joining Fee',   value: card.joining_fee === 0 ? 'None' : `₹${card.joining_fee.toLocaleString('en-IN')}` },
    { label: 'Annual Fee',    value: card.annual_fee === 0  ? 'None' : `₹${card.annual_fee.toLocaleString('en-IN')}` },
    { label: 'Fee Waiver',    value: card.fee_waiver_label },
    { label: 'Forex Markup',  value: card.forex_markup },
    { label: 'Point Value',   value: card.point_value },
    { label: 'Rewards Cycle', value: card.rewards_cycle },
  ].filter(r => r.value);

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-12">

      {/* 1 — Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/" className="hover:text-gray-900 dark:hover:text-white">Home</Link>
        <span>/</span>
        <Link to="/discover/explore" className="hover:text-gray-900 dark:hover:text-white">Cards</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium truncate">{card.name}</span>
      </nav>

      {/* 2 — Header */}
      <Section>
        <div className="flex gap-4">
          {card.thumbnail_url && (
            <img src={card.thumbnail_url} alt={card.name}
              className="w-36 h-24 object-cover rounded-lg shrink-0 hidden sm:block" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{card.name}</h1>
                  <StatusBadge launched_at={card.launched_at} last_updated_at={card.last_updated_at} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  by {card.bank}{card.network ? ` • ${card.network}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={handleShare}
                  className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  ↗ Share
                </button>
                <FeeBadge fee_type={card.fee_type} fee_label={card.fee_label} annual_fee={card.annual_fee} />
              </div>
            </div>
            {card.short_description && (
              <p className="mt-2.5 text-sm text-gray-900 dark:text-gray-200 leading-relaxed font-normal">
                {card.short_description}
              </p>
            )}
            <div className="flex gap-2 mt-3 flex-wrap">
              {card.forex_markup && (
                <span className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded font-medium border border-gray-200 dark:border-gray-600">
                  Forex: {card.forex_markup}
                </span>
              )}
              {card.point_value && (
                <span className="text-xs px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200 rounded font-semibold border border-yellow-200 dark:border-yellow-700/50">
                  {card.point_value}
                </span>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* 3 — Key Perks */}
      {card.key_perks.length > 0 && (
        <Section>
          <SectionTitle>Key Perks</SectionTitle>
          <ul className="space-y-3">
            {card.key_perks.map((p, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-gray-900 dark:text-gray-200">
                <span className="text-orange-500 shrink-0 mt-0.5 text-[10px] leading-5">◆</span>
                <span className="leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 4 — Joining + Renewal */}
      {(card.joining_benefits.length > 0 || card.renewal_benefits.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {card.joining_benefits.length > 0 && (
            <Section>
              <SectionTitle>🎉 Joining Benefits</SectionTitle>
              <ul className="space-y-2.5">
                {card.joining_benefits.map((b, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-900 dark:text-gray-200">
                    <span className="text-blue-500 dark:text-blue-400 shrink-0 font-bold">★</span>
                    <span className="leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {card.renewal_benefits.length > 0 && (
            <Section>
              <SectionTitle>🔄 Renewal Benefits</SectionTitle>
              <ul className="space-y-2.5">
                {card.renewal_benefits.map((b, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-900 dark:text-gray-200">
                    <span className="text-orange-500 dark:text-orange-400 shrink-0 font-bold">★</span>
                    <span className="leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}

      {/* 5 — Earns On + Does Not Earn On */}
      {(card.earns_on.length > 0 || card.does_not_earn_on.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {card.earns_on.length > 0 && (
            <Section>
              <SectionTitle>Earns On</SectionTitle>
              <ul className="space-y-2.5">
                {card.earns_on.map((e, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-900 dark:text-gray-200">
                    <span className="text-green-600 dark:text-green-400 font-bold shrink-0 text-base leading-snug">+</span>
                    <span className="leading-snug">{e}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {card.does_not_earn_on.length > 0 && (
            <Section>
              <SectionTitle>Does Not Earn On</SectionTitle>
              <ul className="space-y-2.5">
                {card.does_not_earn_on.map((e, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-900 dark:text-gray-200">
                    <span className="text-red-600 dark:text-red-400 font-bold shrink-0 text-base leading-snug">✕</span>
                    <span className="leading-snug">{e}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}

      {/* 6 — Reward Categories + Card Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(card.categories?.length ?? 0) > 0 && (
          <Section>
            <SectionTitle>Reward Categories</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {card.categories!.map(cat => (
                <span key={cat.id}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-600">
                  {cat.name}
                </span>
              ))}
            </div>
          </Section>
        )}
        {details.length > 0 && (
          <Section>
            <SectionTitle>Card Details</SectionTitle>
            <div>
              {details.map((row, i) => (
                <div key={i} className={`flex justify-between py-2 text-sm ${i < details.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                  <span className="text-gray-600 dark:text-gray-400">{row.label}</span>
                  <span className="font-semibold text-gray-950 dark:text-white text-right max-w-[55%]">{row.value}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* 7 — Best Merchants */}
      {(card.merchants?.length ?? 0) > 0 && (
        <Section>
          <SectionTitle>Best Merchants for This Card</SectionTitle>
          <p className="text-xs text-gray-600 dark:text-gray-400 -mt-2 mb-4">
            Merchants where this card earns accelerated rewards
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {card.merchants!.map(m => (
              <Link key={m.id} to={`/discover/guides/merchants/${m.merchant_slug}`}
                className="flex gap-3 items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <span className="text-2xl shrink-0">{m.merchant_emoji}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-950 dark:text-white">{m.merchant_name}</p>
                  {m.tip_text && (
                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 mt-0.5">{m.tip_text}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* CTAs */}
      <div className="space-y-3">
        {card.affiliate_url && (
          <a href={card.affiliate_url} target="_blank" rel="noopener noreferrer"
            className="block w-full text-center py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-base transition-colors">
            Apply for {card.name} →
          </a>
        )}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          * Referral link · you get the same benefits, we may earn a small commission
        </p>
        {card.full_review_slug && (
          <Link to={`/discover/articles/${card.full_review_slug}`}
            className="block w-full text-center py-3 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-xl transition-colors">
            Read Full Review →
          </Link>
        )}
      </div>
    </div>
  );
}
