import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMerchantTips } from '../../lib/catalog';
import type { CatalogMerchantTip } from '../../types/catalog';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'fashion',      label: '👗 Fashion' },
  { value: 'grocery',      label: '🛒 Grocery' },
  { value: 'utility',      label: '⚡ Utility' },
  { value: 'food_delivery',label: '🍕 Food Delivery' },
  { value: 'online',       label: '🛍️ Online' },
  { value: 'travel',       label: '✈️ Travel' },
];

export function GuideMerchants() {
  const [tips,     setTips]     = useState<CatalogMerchantTip[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    setLoading(true);
    getMerchantTips(category === 'all' ? undefined : category)
      .then(setTips).catch(() => {}).finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="space-y-5 pb-12">
      <nav className="text-sm text-gray-500 dark:text-gray-400">
        <Link to="/discover/guides" className="hover:text-gray-900 dark:hover:text-white">Guides</Link>
        <span> / </span><span className="text-gray-900 dark:text-white">Merchant Tips</span>
      </nav>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Merchant Tips</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Exact payment routes that earn accelerated rewards
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setCategory(c.value)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              category === c.value
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : tips.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No merchant tips in this category yet</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tips.map(tip => (
            <Link key={tip.id} to={`/discover/guides/merchants/${tip.merchant_slug}`}
              className="flex gap-3 items-start p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <span className="text-2xl shrink-0">{tip.merchant_emoji}</span>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{tip.merchant_name}</p>
                {tip.tip_text && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{tip.tip_text}</p>
                )}
                {tip.mcc && (
                  <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                    MCC {tip.mcc}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
