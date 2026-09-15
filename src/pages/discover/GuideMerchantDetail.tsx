import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getMerchantTipBySlug, getBestCardsForMCC } from '../../lib/catalog';
import { FeeBadge } from '../../components/catalog/FeeBadge';
import type { CatalogMerchantTip } from '../../types/catalog';

export function GuideMerchantDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [tip,       setTip]       = useState<CatalogMerchantTip | null>(null);
  const [bestCards, setBestCards] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!slug) return;
    getMerchantTipBySlug(slug).then(async t => {
      setTip(t);
      if (t.mcc) {
        const cards = await getBestCardsForMCC(t.mcc).catch(() => []);
        setBestCards(cards);
      }
    }).catch(() => setTip(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="max-w-2xl mx-auto h-64 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  if (!tip) return (
    <div className="text-center py-16">
      <p className="text-gray-500 dark:text-gray-400 mb-3">Merchant not found</p>
      <Link to="/discover/guides/merchants" className="text-sm text-blue-600 dark:text-blue-400 underline">← Back</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">
      <nav className="text-sm text-gray-500 dark:text-gray-400">
        <Link to="/discover/guides/merchants" className="hover:text-gray-900 dark:hover:text-white">Merchant Tips</Link>
        <span> / </span><span className="text-gray-900 dark:text-white">{tip.merchant_name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{tip.merchant_emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{tip.merchant_name}</h1>
            {tip.mcc && (
              <span className="text-xs font-mono px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded mt-1 inline-block">
                MCC {tip.mcc} · {tip.mcc_info?.description ?? 'Unknown category'}
              </span>
            )}
          </div>
        </div>
        {tip.tip_text && <p className="text-sm text-gray-900 dark:text-gray-200 leading-relaxed font-normal">{tip.tip_text}</p>}
      </div>

      {/* Full tip content (markdown) */}
      {tip.full_tip && (
        <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/70 p-6 shadow-sm backdrop-blur-sm">
          <div className="markdown-content max-w-none">
            <ReactMarkdown>{tip.full_tip}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Exclusions */}
      {tip.exclusions && (
        <div className="bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-800/40 rounded-xl p-4.5">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-400 mb-1 flex items-center gap-1.5">
            <span>⚠️</span> Watch out
          </p>
          <p className="text-sm text-rose-700 dark:text-rose-300/90 leading-relaxed">{tip.exclusions}</p>
        </div>
      )}

      {/* Best cards for this MCC */}
      {bestCards.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">
            Best cards for MCC {tip.mcc}
          </h2>
          <div className="space-y-2">
            {bestCards.map((item: any) => (
              <Link key={item.id} to={`/discover/explore/${item.catalog_cards?.slug}`}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{item.catalog_cards?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.catalog_cards?.bank}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.catalog_cards && (
                    <FeeBadge fee_type={item.catalog_cards.fee_type} fee_label={item.catalog_cards.fee_label} size="sm" />
                  )}
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">{item.reward_rate}x</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
