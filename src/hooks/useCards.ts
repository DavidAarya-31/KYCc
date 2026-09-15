import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const CARDS_KEY = ['cards'] as const;

export function useCards() {
  return useQuery({
    queryKey: CARDS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCard(id: string) {
  return useQuery({
    queryKey: [...CARDS_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (card: Record<string, unknown>) => {
      const { data, error } = await supabase.from('cards').insert(card).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CARDS_KEY }),
  });
}

export function useUpdateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
      const { data, error } = await supabase.from('cards').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: CARDS_KEY });
      qc.invalidateQueries({ queryKey: [...CARDS_KEY, id] });
    },
  });
}

export function useDeleteCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cards').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CARDS_KEY }),
  });
}
