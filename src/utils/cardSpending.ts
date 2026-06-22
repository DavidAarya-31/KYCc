import { supabase, Database } from '../lib/supabase';
import { CycleWindow, getCycleMonthPairs } from './cycles';

type MonthlySpend = Database['public']['Tables']['monthly_spends']['Row'];

export async function fetchCycleMonthlySpends(cardId: string, cycle: CycleWindow): Promise<MonthlySpend[]> {
  if (cycle.months.length === 0 || cycle.years.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('monthly_spends')
    .select('*')
    .eq('card_id', cardId)
    .in('month', cycle.months)
    .in('year', cycle.years);

  if (error) throw error;

  const cyclePairs = getCycleMonthPairs(cycle);
  return (data || []).filter(spend => cyclePairs.has(`${spend.month}:${spend.year}`));
}

export function sumMonthlySpends(spends: Pick<MonthlySpend, 'amount_spent'>[]): number {
  return spends.reduce((sum, spend) => sum + spend.amount_spent, 0);
}

export async function calculateTotalCardSpend(cardId: string, cycle: CycleWindow): Promise<number> {
  const spends = await fetchCycleMonthlySpends(cardId, cycle);
  return sumMonthlySpends(spends);
}
