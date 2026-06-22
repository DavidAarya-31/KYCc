import { supabase, Database } from '../lib/supabase';

type BudgetInsert = Database['public']['Tables']['budgets']['Insert'];
type BudgetUpdate = Database['public']['Tables']['budgets']['Update'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
type BudgetCategoryInsert = Database['public']['Tables']['budget_categories']['Insert'];
type BudgetCategoryUpdate = Database['public']['Tables']['budget_categories']['Update'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

// Budgets
export async function fetchBudgets() {
  return supabase.from('budgets').select('*').order('created_at', { ascending: false });
}

export async function createBudget(budget: BudgetInsert) {
  return supabase.from('budgets').insert([budget]).select().single();
}

export async function updateBudget(id: string, updates: BudgetUpdate) {
  return supabase.from('budgets').update(updates).eq('id', id).select().single();
}

export async function deleteBudget(id: string) {
  return supabase.from('budgets').delete().eq('id', id);
}

// Categories
export async function fetchCategories() {
  return supabase.from('categories').select('*').order('name', { ascending: true });
}

export async function createCategory(category: CategoryInsert) {
  return supabase.from('categories').insert([category]).select().single();
}

export async function updateCategory(id: string, updates: CategoryUpdate) {
  return supabase.from('categories').update(updates).eq('id', id).select().single();
}

export async function deleteCategory(id: string) {
  return supabase.from('categories').delete().eq('id', id);
}

// BudgetCategories
export async function fetchBudgetCategories(budget_id: string) {
  return supabase.from('budget_categories').select('*').eq('budget_id', budget_id);
}

export async function createBudgetCategory(budgetCategory: BudgetCategoryInsert) {
  return supabase.from('budget_categories').insert([budgetCategory]).select().single();
}

export async function updateBudgetCategory(id: string, updates: BudgetCategoryUpdate) {
  return supabase.from('budget_categories').update(updates).eq('id', id).select().single();
}

export async function deleteBudgetCategory(id: string) {
  return supabase.from('budget_categories').delete().eq('id', id);
}

// Transactions
export async function fetchTransactions(budget_id?: string) {
  let query = supabase.from('transactions').select('*').order('date', { ascending: false });
  if (budget_id) query = query.eq('budget_id', budget_id);
  return query;
}

export async function createTransaction(transaction: TransactionInsert) {
  return supabase.from('transactions').insert([transaction]).select().single();
}

export async function updateTransaction(id: string, updates: TransactionUpdate) {
  return supabase.from('transactions').update(updates).eq('id', id).select().single();
}

export async function deleteTransaction(id: string) {
  return supabase.from('transactions').delete().eq('id', id);
} 
