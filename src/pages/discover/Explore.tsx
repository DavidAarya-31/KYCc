import { useState, useEffect } from 'react';
import { getCatalogCards, getNewCards, getWeeklyUpdates } from '../../lib/catalog';
import { CatalogCardTile } from '../../components/catalog/CatalogCardTile';
import { DiscoverSubNav } from '../../components/catalog/DiscoverSubNav';
import type { CatalogCard, CatalogCardUpdate } from '../../types/catalog';

const UPDATE_LABELS: Record<string, string> = {
  new_card: '🆕 New Card', benefit_change: '✨ Benefits', fee_change: '💰 Fee',
  offer_update: '🎁 Offer', merchant_tip: '🏪 Merchant', terms_change: '📋 T&C', mcc_update: '🏷️ MCC',
};

const FEE_OPTIONS = [
  { value: 'all', label: 'All fees' },
  { value: 'LTF',  label: 'Lifetime Free' },
  { value: 'FYF',  label: 'First Year Free' },
  { value: 'paid', label: 'Paid' },
];

export function Explore() {
  const [allCards,  setAllCards]  = useState<CatalogCard[]>([]);
  const [newCards,  setNewCards]  = useState<CatalogCard[]>([]);
  const [updates,   setUpdates]   = useState<CatalogCardUpdate[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [feeFilter, setFeeFilter] = useState('all');
  const [bankFilter,setBankFilter]= useState('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getCatalogCards(),
      getNewCards(7, 6),
      getWeeklyUpdates(10),
    ]).then(([all, fresh, upd]) => {
      setAllCards(all);
      setNewCards(fresh);
      setUpdates(upd);
    }).catch(err => {
      console.error(err);
    }).finally(() => setLoading(false));
  }, []);

  const featuredCards = allCards.filter(c => c.is_featured);
  const banks = [...new Set(allCards.map(c => c.bank))].sort();

  const filtered = allCards.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search || c.name.toLowerCase().includes(q) || c.bank.toLowerCase().includes(q);
    const matchFee  = feeFilter  === 'all' || c.fee_type === feeFilter;
    const matchBank = bankFilter === 'all' || c.bank === bankFilter;
    return matchSearch && matchFee && matchBank;
  });

  return (
    <div className="space-y-8 pb-12">
      <DiscoverSubNav />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Explore Cards</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Best credit cards in India — curated and reviewed
        </p>
      </div>

      {/* Weekly updates banner */}
      {updates.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <p className="font-semibold text-sm text-gray-900 dark:text-white mb-3">📰 This week's updates</p>
          <div className="space-y-2">
            {updates.map(u => (
              <div key={u.id} className="flex items-start gap-3 text-sm">
                <span className="text-xs text-amber-700 dark:text-amber-400 whitespace-nowrap mt-0.5">
                  {UPDATE_LABELS[u.update_type] ?? u.update_type}
                </span>
                <div className="flex-1 min-w-0">
                  {u.card && (
                    <span className="font-medium text-gray-900 dark:text-white">{u.card.name} · </span>
                  )}
                  <span className="text-gray-600 dark:text-gray-400 line-clamp-1">{u.headline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New this week */}
      {newCards.length > 0 && (
        <section>
          <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">🆕 New this week</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newCards.map(c => <CatalogCardTile key={c.id} card={c} />)}
          </div>
        </section>
      )}

      {/* Featured cards */}
      {featuredCards.length > 0 && (
        <section>
          <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Featured Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCards.map(c => <CatalogCardTile key={c.id} card={c} />)}
          </div>
        </section>
      )}

      {/* Filters + full listing */}
      <section>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text" placeholder="Search cards or banks…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={feeFilter} onChange={e => setFeeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
            {FEE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={bankFilter} onChange={e => setBankFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
            <option value="all">All banks</option>
            {banks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-3">No cards match your filters</p>
            <button onClick={() => { setSearch(''); setFeeFilter('all'); setBankFilter('all'); }}
              className="text-sm text-blue-600 dark:text-blue-400 underline">Clear filters</button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{filtered.length} cards</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(c => <CatalogCardTile key={c.id} card={c} />)}
            </div>
          </>
        )}
      </section>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        * Apply links are referral links · you get the same benefits, we may earn a small commission
      </p>
    </div>
  );
}
