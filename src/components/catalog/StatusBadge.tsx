import { isNewCard, isRecentlyUpdated } from '../../types/catalog';
import type { CatalogCard } from '../../types/catalog';

type Props = Pick<CatalogCard, 'launched_at' | 'last_updated_at'>;

export function StatusBadge({ launched_at, last_updated_at }: Props) {
  if (isNewCard({ launched_at }))
    return <span className="text-[10px] px-1.5 py-0.5 bg-blue-500 text-white rounded-full font-semibold">New</span>;
  if (isRecentlyUpdated({ launched_at, last_updated_at }))
    return <span className="text-[10px] px-1.5 py-0.5 bg-amber-400 text-amber-900 rounded-full font-semibold">Updated</span>;
  return null;
}
