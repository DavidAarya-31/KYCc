import type { FeeType } from '../../types/catalog';

interface Props {
  fee_type: FeeType;
  fee_label?: string | null;
  annual_fee?: number;
  size?: 'sm' | 'md';
}

export function FeeBadge({ fee_type, fee_label, annual_fee, size = 'md' }: Props) {
  const base = size === 'sm'
    ? 'text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap'
    : 'text-sm px-2.5 py-1 rounded font-medium whitespace-nowrap';

  if (fee_type === 'LTF')
    return <span className={`${base} bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300`}>Lifetime Free</span>;
  if (fee_type === 'FYF')
    return <span className={`${base} bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300`}>First Year Free</span>;
  return <span className={`${base} bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300`}>
    {fee_label ?? (annual_fee ? `₹${annual_fee.toLocaleString('en-IN')}` : 'Paid')}
  </span>;
}
