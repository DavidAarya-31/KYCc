import { createClient } from '@supabase/supabase-js';

export type PaymentMethod = 'credit_card' | 'upi' | 'cash' | 'debit_card';
export type BudgetPeriodType = 'monthly' | 'weekly' | 'custom';
export type TransactionType = 'expense' | 'income';

export type Database = {
  public: {
    Tables: {
      cards: {
        Row: {
          id: string;
          user_id: string;
          card_company: string;
          card_name: string;
          card_network: string;
          anniversary_month: number;
          billing_date: number;
          due_date: number;
          annual_fee: number;
          milestone_amount: number;
          card_limit: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_company: string;
          card_name: string;
          card_network: string;
          anniversary_month: number;
          billing_date: number;
          due_date: number;
          annual_fee?: number;
          milestone_amount?: number;
          card_limit?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          card_company?: string;
          card_name?: string;
          card_network?: string;
          anniversary_month?: number;
          billing_date?: number;
          due_date?: number;
          annual_fee?: number;
          milestone_amount?: number;
          card_limit?: number | null;
          created_at?: string;
        };
      };
      monthly_spends: {
        Row: {
          id: string;
          card_id: string;
          month: string;
          year: number;
          amount_spent: number;
        };
        Insert: {
          id?: string;
          card_id: string;
          month: string;
          year: number;
          amount_spent?: number;
        };
        Update: {
          id?: string;
          card_id?: string;
          month?: string;
          year?: number;
          amount_spent?: number;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          name: string;
          total_amount: number;
          period_type: BudgetPeriodType;
          start_date: string;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          name: string;
          total_amount: number;
          period_type: BudgetPeriodType;
          start_date: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          name?: string;
          total_amount?: number;
          period_type?: BudgetPeriodType;
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string | null;
          color: string | null;
          is_default: boolean | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string | null;
          color?: string | null;
          is_default?: boolean | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string | null;
          color?: string | null;
          is_default?: boolean | null;
        };
      };
      budget_categories: {
        Row: {
          id: string;
          budget_id: string;
          category_id: string;
          allocated_amount: number;
        };
        Insert: {
          id?: string;
          budget_id: string;
          category_id: string;
          allocated_amount: number;
        };
        Update: {
          id?: string;
          budget_id?: string;
          category_id?: string;
          allocated_amount?: number;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          budget_id: string | null;
          category_id: string;
          amount: number;
          description: string | null;
          date: string;
          type: TransactionType;
          payment_method: PaymentMethod | null;
          card_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          budget_id?: string | null;
          category_id: string;
          amount: number;
          description?: string | null;
          date: string;
          type: TransactionType;
          payment_method?: PaymentMethod | null;
          card_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          budget_id?: string | null;
          category_id?: string;
          amount?: number;
          description?: string | null;
          date?: string;
          type?: TransactionType;
          payment_method?: PaymentMethod | null;
          card_id?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity: string;
          entity_id: string | null;
          details: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          entity: string;
          entity_id?: string | null;
          details?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          details?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
    };
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const normalizedSupabaseUrl = (() => {
  const url = new URL(supabaseUrl);
  url.pathname = '';
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
})();

export const supabase = createClient<Database>(normalizedSupabaseUrl, supabaseAnonKey);
