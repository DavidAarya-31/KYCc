import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Transaction } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';

export const TRANSACTIONS_KEY = ['transactions'] as const;

export function useTransactions(year?: number, month?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, user?.id, { year, month }],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase.from('transactions').select('*').order('date', { ascending: false });
      
      if (month) {
        // month is 'YYYY-MM'. Query from first of month to first of next month
        const [y, m] = month.split('-').map(Number);
        const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
        query = query.gte('date', `${month}-01`).lt('date', nextMonth);
      } else if (year) {
        query = query.gte('date', `${year}-01-01`).lt('date', `${year + 1}-01-01`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Transaction[];
    },
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (transaction: any) => {
      const payload = {
        ...transaction,
        user_id: transaction.user_id || user?.id,
      };
      const { data, error } = await supabase.from('transactions').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & any) => {
      const { data, error } = await supabase.from('transactions').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
  });
}

