import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCalculatorCards } from '../../lib/catalog';
import { DiscoverSubNav } from '../../components/catalog/DiscoverSubNav';
import type { CatalogCard } from '../../types/catalog';

const TOOLS = [
  {
    to:    '/discover/tools/qr-scanner',
    emoji: '📷',
    title: 'UPI QR Scanner',
    desc:  'Scan any UPI QR code to detect the merchant MCC, then see which card earns the most on that spend.',
    badge: 'Live',
    disabled: false,
  },
  {
    to:    '/discover/tools/gift-card',
    emoji: '🎁',
    title: 'Gift Card Extractor',
    desc:  'Upload a gift card image or e-voucher to extract the card number, PIN, and claim code with local OCR.',
    badge: 'Live',
    disabled: false,
  },
];

export function Tools() {
  const [calcCards, setCalcCards] = useState<CatalogCard[]>([]);

  useEffect(() => { getAllCalculatorCards().then(setCalcCards).catch(() => {}); }, []);

  return (
    <div className="space-y-6 pb-12">
      <DiscoverSubNav />
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tools</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Utilities to maximise your card rewards</p>
      </div>

      {/* Main tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOOLS.map(t => {
          const CardContent = (
            <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 ${t.disabled ? 'opacity-65 cursor-not-allowed' : 'hover:border-gray-300 dark:hover:border-gray-600 transition-colors'}`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{t.emoji}</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-medium">{t.badge}</span>
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">{t.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t.desc}</p>
            </div>
          );
          return t.disabled ? <div key={t.title}>{CardContent}</div> : <Link key={t.to} to={t.to}>{CardContent}</Link>;
        })}
      </div>

      {/* Calculators */}
      {calcCards.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">🧮 Rewards Calculators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {calcCards.map(c => (
              <Link key={c.id} to={`/discover/tools/calculator/${c.slug}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <span className="text-xl">🧮</span>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{c.bank}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
