import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Budget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';

export const BUDGETS_KEY = ['budgets'] as const;

export function useBudgets(year?: number, month?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...BUDGETS_KEY, user?.id, { year, month }],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase.from('budgets').select('*').order('created_at', { ascending: false });
      
      // If month is provided, we filter by the exact month string (e.g. 'YYYY-MM')
      if (month) {
        query = query.eq('month', month);
      } else if (year) {
        // If only year is provided, filter by start_date
        query = query.gte('start_date', `${year}-01-01`).lte('start_date', `${year}-12-31`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Budget[];
    },
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (budget: any) => {
      const payload = {
        ...budget,
        user_id: budget.user_id || user?.id,
      };
      const { data, error } = await supabase.from('budgets').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: BUDGETS_KEY }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & any) => {
      const { data, error } = await supabase.from('budgets').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: BUDGETS_KEY }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: BUDGETS_KEY }),
  });
}

