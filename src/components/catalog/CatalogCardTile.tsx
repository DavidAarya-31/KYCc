import { Link } from 'react-router-dom';
import { FeeBadge } from './FeeBadge';
import { StatusBadge } from './StatusBadge';
import type { CatalogCard } from '../../types/catalog';

export function CatalogCardTile({ card }: { card: CatalogCard }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
              {card.name}
            </h3>
            <StatusBadge launched_at={card.launched_at} last_updated_at={card.last_updated_at} />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium">by {card.bank}</p>
        </div>
        <FeeBadge fee_type={card.fee_type} fee_label={card.fee_label} annual_fee={card.annual_fee} size="sm" />
      </div>

      {/* Key Perks — max 3 */}
      <ul className="space-y-2 flex-1">
        {card.key_perks.slice(0, 3).map((perk, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-900 dark:text-gray-200">
            <span className="text-orange-500 mt-0.5 shrink-0 text-[10px] leading-5">◆</span>
            <span className="leading-snug">{perk}</span>
          </li>
        ))}
      </ul>

      {/* Category tags */}
      {(card.categories?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {card.categories!.map(cat => (
            <span key={cat.id}
              className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full font-medium border border-gray-200 dark:border-gray-600">
              {cat.name}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Link to={`/discover/explore/${card.slug}`}
          className="flex-1 text-center py-2 rounded-lg bg-blue-900 hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700 text-white text-sm font-medium transition-colors">
          Summary
        </Link>
        {card.affiliate_url
          ? <a href={card.affiliate_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 text-center py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors">
              Apply Now
            </a>
          : <span className="flex-1 text-center py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 text-sm cursor-not-allowed">
              Apply Now
            </span>
        }
      </div>
      {card.full_review_slug && (
        <Link to={`/discover/articles/${card.full_review_slug}`}
          className="text-center py-2 rounded-lg border border-blue-900 dark:border-blue-500 text-blue-900 dark:text-blue-400 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
          Read Full Review →
        </Link>
      )}
    </div>
  );
}
