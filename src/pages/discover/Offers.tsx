import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCatalogOffers } from '../../lib/catalog';
import { DiscoverSubNav } from '../../components/catalog/DiscoverSubNav';
import type { CatalogOffer } from '../../types/catalog';

function ExpiryBadge({ offer }: { offer: CatalogOffer }) {
  if (offer.no_end_date)
    return <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">No End Date</span>;
  if (!offer.expiry_date) return null;
  const days = Math.ceil((new Date(offer.expiry_date).getTime() - Date.now()) / 86_400_000);
  if (days < 0)
    return <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full">Expired</span>;
  if (days <= 7)
    return <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">Ends in {days}d</span>;
  return <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
    Until {new Date(offer.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
  </span>;
}

export function Offers() {
  const [offers,  setOffers]  = useState<CatalogOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCatalogOffers({ active: activeOnly })
      .then(setOffers)
      .finally(() => setLoading(false));
  }, [activeOnly]);

  const featured = offers.filter(o => o.is_featured);
  const rest     = offers.filter(o => !o.is_featured);

  return (
    <div className="space-y-6 pb-12">
      <DiscoverSubNav />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Offers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active credit card offers and deals</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <input type="checkbox" checked={activeOnly} onChange={e => setActiveOnly(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-blue-600" />
          Active only
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-44 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">No offers found</div>
      ) : (
        <>
          {featured.length > 0 && (
            <section>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Featured</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featured.map(o => <OfferCard key={o.id} offer={o} />)}
              </div>
            </section>
          )}
          {rest.length > 0 && (
            <section>
              {featured.length > 0 && <h2 className="font-semibold text-gray-900 dark:text-white mb-3">All Offers</h2>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rest.map(o => <OfferCard key={o.id} offer={o} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function OfferCard({ offer }: { offer: CatalogOffer }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {offer.card && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {offer.card.bank} · <Link to={`/discover/explore/${offer.card.slug}`}
                className="hover:text-blue-600 dark:hover:text-blue-400">{offer.card.name}</Link>
            </p>
          )}
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5 leading-snug">{offer.title}</h3>
        </div>
        {offer.discount_value && (
          <span className="text-sm font-bold text-orange-600 dark:text-orange-400 shrink-0">{offer.discount_value}</span>
        )}
      </div>

      {offer.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{offer.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2">
        <ExpiryBadge offer={offer} />
        {offer.affiliate_url ? (
          <a href={offer.affiliate_url} target="_blank" rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors">
            Apply Now
          </a>
        ) : offer.card && (
          <Link to={`/discover/explore/${offer.card.slug}`}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            View Card
          </Link>
        )}
      </div>
    </div>
  );
}
