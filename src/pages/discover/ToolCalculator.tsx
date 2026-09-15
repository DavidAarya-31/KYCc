import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCalculatorConfig, getAllCalculatorCards } from '../../lib/catalog';
import type { CatalogCalculatorConfig, CatalogCard, CalculatorTier, SpendCategory } from '../../types/catalog';

export function ToolCalculator() {
  const { cardSlug } = useParams<{ cardSlug: string }>();
  const [config,    setConfig]    = useState<CatalogCalculatorConfig | null>(null);
  const [allCards,  setAllCards]  = useState<CatalogCard[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [spends,    setSpends]    = useState<Record<string, number>>({});

  useEffect(() => { getAllCalculatorCards().then(setAllCards).catch(() => {}); }, []);

  useEffect(() => {
    if (!cardSlug) return;
    setLoading(true);
    getCalculatorConfig(cardSlug).then(cfg => {
      setConfig(cfg);
      // Init spend inputs to 0
      const init: Record<string, number> = {};
      cfg.spend_categories.forEach(c => { init[c.name] = 0; });
      setSpends(init);
    }).catch(() => setConfig(null)).finally(() => setLoading(false));
  }, [cardSlug]);

  const result = useMemo(() => {
    if (!config) return null;

    const monthlyTotal = Object.values(spends).reduce((a, b) => a + b, 0);
    const quarterlyTotal = monthlyTotal * 3;

    // Determine tier
    const activeTier: CalculatorTier | null = config.tiers
      .filter(t => quarterlyTotal >= t.min_quarterly_spend)
      .sort((a, b) => b.min_quarterly_spend - a.min_quarterly_spend)[0] ?? null;

    const pointValuePaise = activeTier?.point_value_paise ?? config.point_value_paise;

    // Calculate points per category
    const categoryResults = config.spend_categories.map((cat: SpendCategory) => {
      const spend = spends[cat.name] ?? 0;
      // cap_monthly is in points — convert: if spend earns at cat.rate pts per ₹100
      const rawPoints = (spend / 100) * cat.rate;
      const cappedPoints = cat.cap_monthly !== null ? Math.min(rawPoints, cat.cap_monthly) : rawPoints;
      const value = (cappedPoints * pointValuePaise) / 100; // paise → rupees
      return { ...cat, spend, points: Math.floor(cappedPoints), value };
    });

    const totalPoints = categoryResults.reduce((a, c) => a + c.points, 0);
    const totalValue  = categoryResults.reduce((a, c) => a + c.value, 0);
    const roi = monthlyTotal > 0 ? (totalValue / monthlyTotal) * 100 : 0;

    // Fee waiver progress
    const annualSpend = monthlyTotal * 12;
    const feeWaiverPct = config.fee_waiver_spend
      ? Math.min(100, (annualSpend / config.fee_waiver_spend) * 100) : null;

    // Next tier
    const nextTier = config.tiers
      .filter(t => quarterlyTotal < t.min_quarterly_spend)
      .sort((a, b) => a.min_quarterly_spend - b.min_quarterly_spend)[0] ?? null;

    return { activeTier, categoryResults, totalPoints, totalValue, roi, feeWaiverPct, nextTier, monthlyTotal, annualSpend };
  }, [config, spends]);

  if (!cardSlug) {
    return (
      <div className="space-y-4 pb-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rewards Calculators</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allCards.map(c => (
            <Link key={c.id} to={`/discover/tools/calculator/${c.slug}`}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <p className="font-semibold text-gray-900 dark:text-white">{c.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{c.bank}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (loading) return <div className="max-w-2xl mx-auto h-96 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />;

  if (!config) return (
    <div className="text-center py-16 max-w-2xl mx-auto">
      <p className="text-gray-500 dark:text-gray-400 mb-3">No calculator available for this card</p>
      <Link to="/discover/tools" className="text-sm text-blue-600 dark:text-blue-400 underline">← Back to Tools</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <nav className="text-sm text-gray-500 dark:text-gray-400">
        <Link to="/discover/tools" className="hover:text-gray-900 dark:hover:text-white">Tools</Link>
        <span> / </span><span className="text-gray-900 dark:text-white">Calculator</span>
      </nav>
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {config.card?.name ?? 'Rewards Calculator'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Enter your monthly spend per category to estimate annual rewards
        </p>
      </div>

      {/* Spend inputs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Monthly Spend</h2>
        {config.spend_categories.map((cat: SpendCategory) => (
          <div key={cat.name} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">{cat.rate}x</span>
                  {cat.cap_monthly && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">cap {cat.cap_monthly.toLocaleString('en-IN')} pts/mo</span>
                  )}
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">₹</span>
                <input
                  type="number" min={0} step={1000}
                  value={spends[cat.name] ?? 0}
                  onChange={e => setSpends(prev => ({ ...prev, [cat.name]: Math.max(0, Number(e.target.value)) }))}
                  className="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {result && (
        <>
          {/* Tier status */}
          <div className={`rounded-xl border p-4 ${
            result.activeTier
              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {result.activeTier ? `💎 ${result.activeTier.name} Tier` : 'No tier unlocked'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Quarterly spend: ₹{(result.monthlyTotal * 3).toLocaleString('en-IN')}
                  {result.activeTier && ` · 1 pt = ₹${(result.activeTier.point_value_paise / 100).toFixed(2)}`}
                </p>
              </div>
              {result.nextTier && (
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Next: {result.nextTier.name}</p>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    ₹{Math.max(0, result.nextTier.min_quarterly_spend - result.monthlyTotal * 3).toLocaleString('en-IN')} more/quarter
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Monthly Breakdown</h2>
            <div className="space-y-0">
              {result.categoryResults.filter(c => c.spend > 0).map((cat, i, arr) => (
                <div key={cat.name} className={`flex justify-between py-2.5 text-sm ${i < arr.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
                  <div>
                    <span className="text-gray-900 dark:text-white">{cat.name}</span>
                    <span className="text-gray-400 dark:text-gray-500 ml-2 text-xs">{cat.points.toLocaleString('en-IN')} pts</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">₹{cat.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Summary</h2>
            {[
              { label: 'Total points/month',   value: result.totalPoints.toLocaleString('en-IN') },
              { label: 'Monthly value',        value: `₹${result.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
              { label: 'Annual value estimate',value: `₹${(result.totalValue * 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
              { label: 'Effective return',     value: `${result.roi.toFixed(2)}%` },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Fee waiver progress */}
          {result.feeWaiverPct !== null && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 dark:text-gray-300">Fee waiver progress</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ₹{result.annualSpend.toLocaleString('en-IN')} / ₹{config.fee_waiver_spend?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-green-500 transition-all"
                  style={{ width: `${Math.min(100, result.feeWaiverPct)}%` }} />
              </div>
              {result.feeWaiverPct >= 100
                ? <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Annual fee will be waived</p>
                : <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{result.feeWaiverPct.toFixed(0)}% to fee waiver</p>
              }
            </div>
          )}
        </>
      )}

      {/* Apply CTA */}
      {config.card?.affiliate_url && (
        <a href={config.card.affiliate_url} target="_blank" rel="noopener noreferrer"
          className="block w-full text-center py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors">
          Apply for {config.card.name} →
        </a>
      )}
    </div>
  );
}
