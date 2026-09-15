import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  fetchBudgets, createBudget, updateBudget, deleteBudget,
  fetchCategories, createCategory, updateCategory, deleteCategory,
  fetchTransactions, createTransaction, updateTransaction, deleteTransaction,
  fetchBudgetCategories, createBudgetCategory, updateBudgetCategory, deleteBudgetCategory
} from '../utils/budget';
import { useAuth } from './AuthContext';
import { PaymentMethod } from '../lib/supabase';

export interface Budget {
  id: string;
  user_id?: string;
  name: string;
  category_id: string;
  total_amount: number;
  period_type: 'monthly' | 'weekly' | 'custom';
  start_date: string;
  end_date?: string | null;
  month?: string | null;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  is_default?: boolean | null;
}

export interface Transaction {
  id: string;
  user_id?: string;
  budget_id?: string | null;
  category_id: string;
  amount: number;
  description?: string | null;
  date: string;
  type: 'expense' | 'income';
  payment_method?: PaymentMethod | null;
  card_id?: string | null;
}

export interface BudgetCategory {
  id: string;
  budget_id: string;
  category_id: string;
  allocated_amount: number;
}

interface BudgetContextType {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  budgetCategories: BudgetCategory[];
  loading: boolean;
  error: string | null;
  // Budgets
  addBudget: (budget: Omit<Budget, 'id' | 'user_id'>) => Promise<void>;
  editBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;
  // Categories
  addCategory: (category: Omit<Category, 'id' | 'user_id'>) => Promise<void>;
  editCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  // Transactions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id'>) => Promise<void>;
  editTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  // BudgetCategories
  getBudgetCategories: (budget_id: string) => Promise<void>;
  addBudgetCategory: (budgetCategory: Omit<BudgetCategory, 'id'>) => Promise<void>;
  editBudgetCategory: (id: string, updates: Partial<BudgetCategory>) => Promise<void>;
  removeBudgetCategory: (id: string) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Clear undo history on mount (page reload)
  useEffect(() => {
    // clearHistory(); // Removed as per edit hint
    // eslint-disable-next-line
  }, []);

  // Fetch all data on mount and whenever user changes
  useEffect(() => {
    if (!user) {
      setBudgets([]);
      setCategories([]);
      setTransactions([]);
      setBudgetCategories([]);
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [budgetsRes, categoriesRes, transactionsRes] = await Promise.all([
          fetchBudgets(),
          fetchCategories(),
          fetchTransactions()
        ]);
        if (budgetsRes.error) throw budgetsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;
        if (transactionsRes.error) throw transactionsRes.error;
        setBudgets(budgetsRes.data || []);
        setCategories(categoriesRes.data || []);
        setTransactions(transactionsRes.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);


  // Budgets
  const addBudget = async (budget: Omit<Budget, 'id' | 'user_id'>) => {
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('User not authenticated');
      const res = await createBudget({ ...budget, user_id: user.id });
      if (res.error) throw res.error;
      setBudgets((prev) => [res.data, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to add budget');
    } finally {
      setLoading(false);
    }
  };
  const editBudget = async (id: string, updates: Partial<Budget>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateBudget(id, updates);
      if (res.error) throw res.error;
      setBudgets((prev) => prev.map(b => b.id === id ? res.data : b));
    } catch (err: any) {
      setError(err.message || 'Failed to update budget');
    } finally {
      setLoading(false);
    }
  };
  const removeBudget = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteBudget(id);
      if (res.error) throw res.error;
      setBudgets((prev) => prev.filter(b => b.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete budget');
    } finally {
      setLoading(false);
    }
  };

  // Categories
  const addCategory = async (category: Omit<Category, 'id' | 'user_id'>) => {
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('User not authenticated');
      const res = await createCategory({ ...category, user_id: user.id });
      if (res.error) throw res.error;
      setCategories((prev) => [res.data, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };
  const editCategory = async (id: string, updates: Partial<Category>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateCategory(id, updates);
      if (res.error) throw res.error;
      setCategories((prev) => prev.map(c => c.id === id ? res.data : c));
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };
  const removeCategory = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteCategory(id);
      if (res.error) throw res.error;
      setCategories((prev) => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  // Transactions
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id'>) => {
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('User not authenticated');
      const res = await createTransaction({ ...transaction, user_id: user.id });
      if (res.error) throw res.error;
      setTransactions((prev) => [res.data, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };
  const editTransaction = async (id: string, updates: Partial<Transaction>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateTransaction(id, updates);
      if (res.error) throw res.error;
      setTransactions((prev) => prev.map(t => t.id === id ? res.data : t));
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };
  const removeTransaction = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteTransaction(id);
      if (res.error) throw res.error;
      setTransactions((prev) => prev.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
    } finally {
      setLoading(false);
    }
  };

  // BudgetCategories
  const getBudgetCategories = async (budget_id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBudgetCategories(budget_id);
      if (res.error) throw res.error;
      setBudgetCategories(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch budget categories');
    } finally {
      setLoading(false);
    }
  };
  const addBudgetCategory = async (budgetCategory: Omit<BudgetCategory, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createBudgetCategory(budgetCategory);
      if (res.error) throw res.error;
      setBudgetCategories((prev) => [res.data, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to add budget category');
    } finally {
      setLoading(false);
    }
  };
  const editBudgetCategory = async (id: string, updates: Partial<BudgetCategory>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateBudgetCategory(id, updates);
      if (res.error) throw res.error;
      setBudgetCategories((prev) => prev.map(bc => bc.id === id ? res.data : bc));
    } catch (err: any) {
      setError(err.message || 'Failed to update budget category');
    } finally {
      setLoading(false);
    }
  };
  const removeBudgetCategory = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteBudgetCategory(id);
      if (res.error) throw res.error;
      setBudgetCategories((prev) => prev.filter(bc => bc.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete budget category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BudgetContext.Provider value={{
      budgets, categories, transactions, budgetCategories, loading, error,
      addBudget, editBudget, removeBudget,
      addCategory, editCategory, removeCategory,
      addTransaction, editTransaction, removeTransaction,
      getBudgetCategories, addBudgetCategory, editBudgetCategory, removeBudgetCategory
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}; 
