import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMCCCodes, getBestCardsForMCC } from '../../lib/catalog';
import type { MCCCode } from '../../types/catalog';

const CATEGORIES = [
  { value: 'all',         label: 'All' },
  { value: 'grocery',     label: '🛒 Grocery' },
  { value: 'dining',      label: '🍽️ Dining' },
  { value: 'apparel',     label: '👗 Apparel' },
  { value: 'utilities',   label: '⚡ Utilities' },
  { value: 'fuel',        label: '⛽ Fuel' },
  { value: 'travel',      label: '✈️ Travel' },
  { value: 'hotels',      label: '🏨 Hotels' },
  { value: 'electronics', label: '💻 Electronics' },
  { value: 'entertainment',label: '🎬 Entertainment' },
  { value: 'health',      label: '🏥 Health' },
  { value: 'finance',     label: '💰 Finance' },
  { value: 'online',      label: '🛍️ Online' },
  { value: 'transport',   label: '🚕 Transport' },
];

export function GuideMCCLookup() {
  const [codes,        setCodes]        = useState<MCCCode[]>([]);
  const [search,       setSearch]       = useState('');
  const [category,     setCategory]     = useState('all');
  const [loading,      setLoading]      = useState(true);
  const [selectedMCC,  setSelectedMCC]  = useState<MCCCode | null>(null);
  const [bestCards,    setBestCards]    = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMCCCodes(search || undefined, category !== 'all' ? category : undefined)
      .then(setCodes).finally(() => setLoading(false));
  }, [search, category]);

  const handleSelect = useCallback(async (code: MCCCode) => {
    setSelectedMCC(code);
    setLoadingCards(true);
    setBestCards([]);
    getBestCardsForMCC(code.mcc).then(setBestCards).catch(() => setBestCards([])).finally(() => setLoadingCards(false));
  }, []);

  return (
    <div className="space-y-5 pb-12">
      <nav className="text-sm text-gray-500 dark:text-gray-400">
        <Link to="/discover/guides/rewards" className="hover:text-gray-900 dark:hover:text-white">Rewards Guides</Link>
        <span> / </span><span className="text-gray-900 dark:text-white">MCC Reference</span>
      </nav>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MCC Code Reference</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          4-digit Merchant Category Codes — click any to see which cards earn most on it
        </p>
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text" placeholder="Search MCC code or description…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* MCC list */}
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            [...Array(8)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />)
          ) : codes.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">No MCC codes found</div>
          ) : codes.map(code => (
            <button key={code.mcc} onClick={() => handleSelect(code)}
              className={`w-full flex items-center gap-4 p-3 rounded-lg border text-left transition-colors ${
                selectedMCC?.mcc === code.mcc
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}>
              <span className="font-mono text-base font-bold text-blue-600 dark:text-blue-400 w-12 shrink-0">{code.mcc}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{code.description}</p>
                {code.category && <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{code.category}</p>}
              </div>
              {code.is_excluded_by_default && (
                <span className="text-[10px] px-1.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full shrink-0">
                  Often excluded
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Best cards side panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            {!selectedMCC ? (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                <p className="text-3xl mb-2">🏷️</p>
                <p className="text-sm">Click any MCC to see best cards</p>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-0.5">
                  Best for MCC <span className="font-mono text-blue-600 dark:text-blue-400">{selectedMCC.mcc}</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">{selectedMCC.description}</p>
                {loadingCards ? (
                  [...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse mb-2" />)
                ) : bestCards.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                    No reward data yet for this MCC
                  </p>
                ) : bestCards.map((item: any) => (
                  <Link key={item.id} to={`/discover/explore/${item.catalog_cards?.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.catalog_cards?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.catalog_cards?.bank}</p>
                    </div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400 shrink-0">{item.reward_rate}x</span>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
