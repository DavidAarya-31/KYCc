import React, { useState, useRef } from 'react';
import { useBudget, Transaction } from '../contexts/BudgetContext';
import { InsightsSection } from '../components/InsightsSection';
import { supabase } from '../lib/supabase';
import { BudgetPeriodType, PaymentMethod, TransactionType } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Papa, { ParseResult, ParseError } from 'papaparse';
import NotificationBanner, { NotificationType } from '../components/NotificationBanner';
import { DocumentImportModal } from '../components/DocumentImportModal';
import Tesseract from 'tesseract.js';
import { getRecentYears } from '../utils/cycles';
import { Wand2 } from 'lucide-react';
import { suggestCategory } from '../utils/ai';

type ImportedTransaction = {
  amount: string;
  date: string;
  description: string;
  payment_method: PaymentMethod | null;
  category_id: string | null;
  include: boolean;
  confidence?: 'high' | 'medium' | 'low';
};

const DEFAULT_OCR_EXCLUDE_PATTERNS = [
  /(^|\b)(subtotal|tax|gst|vat|discount|change|balance|total due|amount due|grand total|review extracted rows|choose file|extract transactions|payment method|category|include)\b/i,
];

function getIsoDateFromMatch(match: string): string {
  const normalized = match.replace(/\./g, '-').replace(/\//g, '-');
  const parts = normalized.split('-').map(part => part.trim());
  if (parts.length !== 3) return '';

  const [a, b, c] = parts;
  const isYearFirst = a.length === 4;
  const year = isYearFirst ? Number(a) : Number(c.length === 2 ? `20${c}` : c);
  const month = isYearFirst ? Number(b) : Number(b);
  const day = isYearFirst ? Number(c) : Number(a);
  if (!year || !month || !day) return '';

  const iso = new Date(year, month - 1, day).toISOString().slice(0, 10);
  return iso;
}

function extractTransactionsFromOcrText(text: string): ImportedTransaction[] {
  const lines = text
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter(line => !DEFAULT_OCR_EXCLUDE_PATTERNS.some(pattern => pattern.test(line)));

  const amountPattern = /(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*\.?[0-9]{0,2})/gi;
  const dateLikeLines = lines.filter(line => /(\d{2}[./-]\d{2}[./-]\d{2,4}|\d{4}[./-]\d{2}[./-]\d{2})/.test(line));

  const buildRowFromLine = (line: string): ImportedTransaction | null => {
    const dateMatch = line.match(/(\d{2}[./-]\d{2}[./-]\d{2,4}|\d{4}[./-]\d{2}[./-]\d{2})/);
    const amounts = [...line.matchAll(amountPattern)]
      .map((match) => match[1].replace(/,/g, ''))
      .filter((amount) => amount && !Number.isNaN(Number(amount)));

    if (amounts.length === 0) return null;

    const amount = amounts[amounts.length - 1];
    const description = line
      .replace(/(\d{2}[./-]\d{2}[./-]\d{2,4}|\d{4}[./-]\d{2}[./-]\d{2})/g, ' ')
      .replace(/(?:₹|rs\.?|inr)?\s*[0-9][0-9,]*\.?[0-9]{0,2}/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      amount,
      date: dateMatch ? getIsoDateFromMatch(dateMatch[1]) : '',
      description: description || 'Scanned transaction',
      payment_method: null,
      category_id: null,
      include: true,
      confidence: dateMatch ? 'high' : 'medium',
    };
  };

  if (dateLikeLines.length >= 2) {
    const multiRows = dateLikeLines
      .map(buildRowFromLine)
      .filter((row): row is ImportedTransaction => Boolean(row));
    if (multiRows.length > 1) {
      return multiRows;
    }
  }

  const candidateLines = lines.filter(line => [...line.matchAll(amountPattern)].length > 0);
  const preferredLine = candidateLines.find(line => !/(upi|gpay|phonepe|amazon pay|paytm|debit|credit|cash|transfer|payment|total|balance|available)/i.test(line))
    || candidateLines[0]
    || lines[0]
    || '';
  const singleRow = buildRowFromLine(preferredLine);
  if (singleRow) return [singleRow];

  const amountMatch = text.match(/(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*\.?[0-9]{0,2})/i);
  const dateMatch = text.match(/(\d{2}[./-]\d{2}[./-]\d{2,4}|\d{4}[./-]\d{2}[./-]\d{2})/);
  return amountMatch ? [{
    amount: amountMatch[1].replace(/,/g, ''),
    date: dateMatch ? getIsoDateFromMatch(dateMatch[1]) : '',
    description: 'Scanned transaction',
    payment_method: null,
    category_id: null,
    include: true,
    confidence: dateMatch ? 'medium' : 'low',
  }] : [];
}

const modalBackdrop = "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity duration-200 overflow-x-hidden";
const modalPanel = "bg-white dark:bg-gray-900 p-2 sm:p-6 rounded-2xl shadow-2xl w-full max-w-full sm:max-w-lg min-h-fit space-y-6 transform transition-all duration-300 scale-95 opacity-0 animate-fadeInScale max-h-[90vh] overflow-y-auto overflow-x-hidden";

// Add keyframes for fadeInScale animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeInScale {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
.animate-fadeInScale { animation: fadeInScale 0.25s cubic-bezier(0.4,0,0.2,1) forwards; }
`;
document.head.appendChild(style);

export const OverviewSection = ({ transactions, budgets: inputBudgets }: { transactions: Transaction[], budgets?: any[] }) => {
  const { budgets: contextBudgets } = useBudget();
  const budgets = inputBudgets ?? contextBudgets;

  // Calculate totals
  const totalBudget = budgets.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const totalSpent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const remaining = totalBudget - totalSpent;

  // Status counts
  let onTrack = 0, approaching = 0, overBudget = 0;
  budgets.forEach(b => {
    const spent = transactions.filter(t => t.category_id === b.category_id && t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    if (spent < b.total_amount * 0.8) onTrack++;
    else if (spent < b.total_amount) approaching++;
    else overBudget++;
  });

  // Alerts (example: over budget)
  const alerts = overBudget;

  // Progress
  const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 transition-colors">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center transition-colors">
          <div className="text-3xl mr-3 text-blue-500 dark:text-blue-300">$
          </div>
          <div>
            <div className="text-blue-700 dark:text-blue-200 font-semibold text-sm">Total Budget</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">₹{totalBudget.toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center transition-colors">
          <div className="text-3xl mr-3 text-red-500 dark:text-red-300">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8" /></svg>
          </div>
          <div>
            <div className="text-red-700 dark:text-red-200 font-semibold text-sm">Total Spent</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">₹{totalSpent.toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center transition-colors">
          <div className="text-3xl mr-3 text-green-500 dark:text-green-300">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 18a5 5 0 0 1-10 0V7a5 5 0 0 1 10 0v11z" /></svg>
          </div>
          <div>
            <div className="text-green-700 dark:text-green-200 font-semibold text-sm">Remaining</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">₹{remaining.toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center transition-colors">
          <div className="text-3xl mr-3 text-yellow-500 dark:text-yellow-300">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
          </div>
          <div>
            <div className="text-yellow-700 dark:text-yellow-200 font-semibold text-sm">Alerts</div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{alerts}</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-lg mb-2 dark:text-gray-100">Overall Progress</h3>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-300">Budget Progress</span>
            <span className="text-sm font-semibold dark:text-gray-100">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 mb-2 transition-colors">
            <div
              className="bg-blue-500 dark:bg-blue-400 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex space-x-8 mt-2">
            <div className="flex flex-col items-center">
              <span className="text-green-600 dark:text-green-300 font-bold">{onTrack}</span>
              <span className="text-xs text-gray-600 dark:text-gray-300">On Track</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-yellow-600 dark:text-yellow-300 font-bold">{approaching}</span>
              <span className="text-xs text-gray-600 dark:text-gray-300">Approaching</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-red-600 dark:text-red-300 font-bold">{overBudget}</span>
              <span className="text-xs text-gray-600 dark:text-gray-300">Over Budget</span>
            </div>
          </div>
        </div>
        {/* Removed Spending Distribution section */}
      </div>
    </div>
  );
};

import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from '../hooks/useBudgets';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { usePagination } from '../hooks/usePagination';

const inputBase = "w-full border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100";
const labelBase = "block mb-1 font-semibold text-gray-700 dark:text-gray-300";
const buttonBase = "px-6 py-2 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800";

const closeButton = "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl absolute top-4 right-6 cursor-pointer transition-colors";

const BudgetFormModal = ({ open, onClose, budget, selectedMonth }: { open: boolean; onClose: () => void; budget?: any; selectedMonth: string }) => {
  const { categories } = useBudget();
  const { mutateAsync: addBudget } = useCreateBudget();
  const { mutateAsync: editBudget } = useUpdateBudget();
  const allCategories = categories.length > 0
    ? categories.map(c => ({ value: c.id, label: c.name }))
    : [];
  const [categoryId, setCategoryId] = useState(budget?.category_id || (allCategories[0]?.value || ''));
  const [totalAmount, setTotalAmount] = useState(budget?.total_amount || '');
  const [periodType, setPeriodType] = useState<BudgetPeriodType>(budget?.period_type || 'monthly');
  const [startDate, setStartDate] = useState(budget?.start_date || '');
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    setCategoryId(budget?.category_id || (allCategories[0]?.value || ''));
    setTotalAmount(budget?.total_amount || '');
    setPeriodType(budget?.period_type || 'monthly');
    setStartDate(budget?.start_date || '');
    setFormError('');
    // eslint-disable-next-line
  }, [budget, open, categories]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return setFormError('Category is required');
    if (!totalAmount || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) return setFormError('Budget amount must be a positive number');
    if (!startDate) return setFormError('Start date is required');
    const selectedCategory = allCategories.find(c => c.value === categoryId);
    const data: any = {
      name: selectedCategory ? selectedCategory.label : '',
      total_amount: Number(totalAmount),
      period_type: periodType,
      start_date: startDate,
      category_id: categoryId,
      month: selectedMonth, // Tie budget to selected month
    };
    if (budget && budget.end_date) {
      data.end_date = budget.end_date;
    } else {
      // Default end date to last day of the month
      const [year, monthStr] = selectedMonth.split('-');
      const lastDay = new Date(Number(year), Number(monthStr), 0).getDate();
      data.end_date = `${selectedMonth}-${lastDay}`;
    }
    
    try {
      if (budget) {
        await editBudget({ id: budget.id, ...data });
      } else {
        await addBudget(data);
      }
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save budget');
    }
  };

  return (
    <div className={modalBackdrop}>
      <form className={modalPanel} onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <button type="button" className={closeButton} onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">Create New Budget</h2>
        <div>
          <label className={labelBase}>Category</label>
          {allCategories.length === 0 ? (
            <div className="text-red-500 text-sm font-medium mb-2">No categories found. Please add a category first.</div>
          ) : null}
          <select
            className={inputBase}
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            required
            disabled={allCategories.length === 0}
          >
            {allCategories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelBase}>Budget Amount</label>
          <input
            className={inputBase}
            type="number"
            min="0"
            placeholder="Enter amount"
            value={totalAmount}
            onChange={e => setTotalAmount(e.target.value)}
            required
            disabled={allCategories.length === 0}
          />
        </div>
        <div>
          <label className={labelBase}>Period</label>
          <select
            className={inputBase}
            value={periodType}
            onChange={e => setPeriodType(e.target.value as BudgetPeriodType)}
            required
            disabled={allCategories.length === 0}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label className={labelBase}>Start Date</label>
          <input
            className={inputBase}
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
            disabled={allCategories.length === 0}
          />
        </div>
        {formError && <div className="text-red-500 text-sm font-medium">{formError}</div>}
        {error && <div className="text-red-500 dark:text-red-300 text-sm font-medium">{error}</div>}
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" className={buttonBase + " bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700 transition-colors"} onClick={onClose}>Cancel</button>
          <button type="submit" className={buttonBase + " bg-blue-600 text-white dark:text-gray-100 hover:bg-blue-700 shadow-md"} disabled={allCategories.length === 0}>{budget ? 'Update Budget' : 'Create Budget'}</button>
        </div>
      </form>
    </div>
  );
};

const BudgetCards = ({ transactions, budgets, selectedMonth }: { transactions: Transaction[], budgets: any[], selectedMonth: string }) => {
  const { mutate: removeBudget } = useDeleteBudget();
  const [showForm, setShowForm] = useState(false);
  const [editBudget, setEditBudget] = useState<any | null>(null);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold" onClick={() => { setEditBudget(null); setShowForm(true); }}>+ Create Budget</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {budgets.map(budget => {
          // FIX: Calculate spent by category_id, not budget_id
          const spent = transactions.filter(t => t.category_id === budget.category_id && t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
          const remaining = Math.max(0, budget.total_amount - spent);
          const percent = budget.total_amount > 0 ? (spent / budget.total_amount) * 100 : 0;
          let status = 'On Track', statusColor = 'green';
          if (spent >= budget.total_amount) { status = 'Over Budget'; statusColor = 'red'; }
          else if (spent >= budget.total_amount * 0.8) { status = 'Approaching'; statusColor = 'yellow'; }
          return (
            <div key={budget.id} className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded shadow p-6 flex flex-col border border-gray-200 dark:border-gray-800 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-bold text-lg dark:text-gray-100">{budget.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 capitalize">{budget.period_type} Budget</div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600" onClick={() => { setEditBudget(budget); setShowForm(true); }}>Edit</button>
                  <button className="text-red-600" onClick={() => removeBudget(budget.id)}>Delete</button>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-gray-500 dark:text-gray-300 text-sm">Budget Amount</div>
                <div className="font-semibold text-xl dark:text-gray-100">₹{budget.total_amount.toLocaleString()}</div>
              </div>
              <div className="mb-2">
                <div className="text-gray-500 dark:text-gray-300 text-sm">Spent</div>
                <div className="font-semibold text-lg dark:text-gray-100">₹{spent.toLocaleString()}</div>
              </div>
              <div className="mb-2">
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 transition-colors">
                  <div className={`h-2 rounded-full transition-all ${statusColor === 'green' ? 'bg-green-500 dark:bg-green-400' : statusColor === 'yellow' ? 'bg-yellow-400 dark:bg-yellow-300' : 'bg-red-500 dark:bg-red-400'}`}
                    style={{ width: `${percent}%` }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>{percent.toFixed(1)}% used</span>
                  <span className="text-gray-500 dark:text-gray-300">Remaining: ₹{remaining.toLocaleString()}</span>
                </div>
              </div>
              <div className={`mt-auto px-2 py-1 rounded text-xs font-semibold w-fit ${statusColor === 'green' ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300' : statusColor === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
                Status: {status}
              </div>
            </div>
          );
        })}
      </div>
      <BudgetFormModal open={showForm} onClose={() => { setShowForm(false); setEditBudget(null); }} budget={editBudget} selectedMonth={selectedMonth} />
      {budgets.length === 0 && <div className="text-gray-500 dark:text-gray-300 mt-8 text-center">No budgets found. Click "Create Budget" to add one.</div>}
    </div>
  );
};

const TransactionFormModal = ({ open, onClose, transaction, prefillPhoto }: { open: boolean; onClose: () => void; transaction?: any; prefillPhoto?: File | null }) => {
  const { categories } = useBudget();
  const { mutateAsync: addTransaction } = useCreateTransaction();
  const { mutateAsync: editTransaction } = useUpdateTransaction();
  const { user } = useAuth();
  const allCategories = categories.length > 0
    ? categories.map(c => ({ value: c.id, label: c.name }))
    : [];
  const [type, setType] = useState<TransactionType>(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction?.amount || '');
  const [categoryId, setCategoryId] = useState(transaction?.category_id || (allCategories[0]?.value || ''));
  const [note, setNote] = useState(transaction?.description || '');
  const [date, setDate] = useState(transaction?.date ? transaction.date.slice(0, 10) : '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(transaction?.payment_method || 'cash');
  const [cardId, setCardId] = useState(transaction?.card_id || '');
  const [cards, setCards] = useState<{ id: string; card_name: string; card_company: string }[]>([]);
  const [formError, setFormError] = useState('');
  const [suggestingCategory, setSuggestingCategory] = useState(false);

  React.useEffect(() => {
    setType(transaction?.type || 'expense');
    setAmount(transaction?.amount || '');
    setCategoryId(transaction?.category_id || (allCategories[0]?.value || ''));
    setNote(transaction?.description || '');
    setDate(transaction?.date ? transaction.date.slice(0, 10) : '');
    setPaymentMethod(transaction?.payment_method || 'cash');
    setCardId(transaction?.card_id || '');
    setFormError('');
  }, [transaction, open, categories]);

  React.useEffect(() => {
    // Fetch user's credit cards for the dropdown
    const fetchCards = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('cards')
        .select('id, card_name, card_company')
        .eq('user_id', user.id);
      if (!error && data) setCards(data);
    };
    if (paymentMethod === 'credit_card') fetchCards();
  }, [user, paymentMethod]);

  if (!open) return null;

  const handleSuggestCategory = async () => {
    if (!note) {
      setFormError('Please enter a note/description first.');
      return;
    }
    setFormError('');
    setSuggestingCategory(true);
    try {
      const suggestedId = await suggestCategory(note, allCategories.map(c => ({ id: c.value, name: c.label })));
      if (suggestedId && allCategories.find(c => c.value === suggestedId)) {
        setCategoryId(suggestedId);
      } else {
        setFormError('Could not confidently determine a category.');
      }
    } catch (e: any) {
      setFormError('Failed to suggest category.');
    } finally {
      setSuggestingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setFormError('Amount must be a positive number');
    if (!categoryId) return setFormError('Category is required');
    if (!date) return setFormError('Date is required');
    if (!paymentMethod) return setFormError('Payment method is required');
    if (paymentMethod === 'credit_card' && !cardId) return setFormError('Please select a credit card');
    const data = {
      type,
      amount: Number(amount),
      category_id: categoryId, // always a UUID
      description: note,
      date,
      payment_method: paymentMethod,
      card_id: paymentMethod === 'credit_card' ? cardId : null,
    };
    try {
      if (transaction) {
        await editTransaction({ id: transaction.id, ...data });
      } else {
        await addTransaction(data);
      }
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save transaction');
    }
  };

  return (
    <div className={modalBackdrop}>
      <form className={modalPanel} onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <button type="button" className={closeButton} onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">Add New Transaction</h2>
        {prefillPhoto && (
          <div className="mb-4 flex justify-center">
            <img src={URL.createObjectURL(prefillPhoto)} alt="Receipt Preview" className="max-h-40 rounded shadow" />
          </div>
        )}
        {transaction?.ocrWarning && (
          <div className="mb-2 text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500 p-2 rounded">
            {transaction.ocrWarning}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelBase}>Amount</label>
            <input
              className={inputBase}
              type="number"
              min="0"
              placeholder="Enter amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              disabled={allCategories.length === 0}
            />
          </div>
          <div>
            <label className={labelBase}>Type</label>
            <select
              className={inputBase}
              value={type}
              onChange={e => setType(e.target.value as TransactionType)}
              required
              disabled={allCategories.length === 0}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className={labelBase}>Category</label>
              <button
                type="button"
                onClick={handleSuggestCategory}
                disabled={suggestingCategory || !note || allCategories.length === 0}
                className="text-xs flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
                title="Auto-categorize based on note"
              >
                <Wand2 className={`w-3 h-3 mr-1 ${suggestingCategory ? 'animate-pulse' : ''}`} />
                {suggestingCategory ? 'Thinking...' : 'Magic'}
              </button>
            </div>
            {allCategories.length === 0 ? (
              <div className="text-red-500 text-sm font-medium mb-2">No categories found. Please add a category first.</div>
            ) : null}
            <select
              className={inputBase}
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              required
              disabled={allCategories.length === 0}
            >
              {allCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelBase}>Date</label>
            <input
              className={inputBase}
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              disabled={allCategories.length === 0}
            />
          </div>
          <div>
            <label className={labelBase}>Paid By</label>
            <select
              className={inputBase}
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              required
            >
              <option value="credit_card">Credit Card</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="debit_card">Debit Card</option>
            </select>
          </div>
          {paymentMethod === 'credit_card' && (
            <div>
              <label className={labelBase}>Select Credit Card</label>
              <select
                className={inputBase}
                value={cardId}
                onChange={e => setCardId(e.target.value)}
                required
              >
                <option value="">Select a card</option>
                {cards.map((card: any) => (
                  <option key={card.id} value={card.id}>{card.card_name} ({card.card_company})</option>
                ))}
              </select>
            </div>
          )}
          <div className="md:col-span-2">
            <label className={labelBase}>Note</label>
            <input
              className={inputBase}
              type="text"
              placeholder="Enter transaction note"
              value={note}
              onChange={e => setNote(e.target.value)}
              disabled={allCategories.length === 0}
            />
          </div>
        </div>
        {formError && <div className="text-red-500 text-sm font-medium mt-2">{formError}</div>}
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" className={buttonBase + " bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700 transition-colors"} onClick={onClose}>Cancel</button>
          <button type="submit" className={buttonBase + " bg-blue-600 text-white dark:text-gray-100 hover:bg-blue-700 shadow-md"} disabled={allCategories.length === 0}>{transaction ? 'Update Transaction' : 'Add Transaction'}</button>
        </div>
      </form>
    </div>
  );
};

type CsvField = 'amount' | 'date' | 'description' | 'payment_method';

const csvFields: { key: CsvField; label: string; required?: boolean }[] = [
  { key: 'amount', label: 'Amount', required: true },
  { key: 'date', label: 'Date', required: true },
  { key: 'description', label: 'Description' },
  { key: 'payment_method', label: 'Payment Method' },
];

function normalizePaymentMethod(value: unknown): 'credit_card' | 'upi' | 'cash' | 'debit_card' | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');

  if (normalized === 'credit_card' || normalized === 'card' || normalized === 'cc') return 'credit_card';
  if (normalized === 'debit_card' || normalized === 'debit') return 'debit_card';
  if (normalized === 'upi') return 'upi';
  if (normalized === 'cash') return 'cash';

  return null;
}

const ImportModal: React.FC<{
  open: boolean;
  onClose: () => void;
  categories: { id: string; name: string }[];
  onImport: (rows: any[]) => void;
}> = ({ open, onClose, categories, onImport }) => {
  const [tab, setTab] = useState<'csv' | 'photo'>('csv');
  // CSV state
  const [step, setStep] = useState(1);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<CsvField, string>>({ amount: '', date: '', description: '', payment_method: '' });
  const [preview, setPreview] = useState<any[]>([]);
  const [csvError, setCsvError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Photo state
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [photoRows, setPhotoRows] = useState<ImportedTransaction[]>([]);
  const [ocrText, setOcrText] = useState('');

  // Reset modal state every time it is opened
  React.useEffect(() => {
    if (open) {
      setTab('csv');
      setStep(1);
      setCsvData([]);
      setHeaders([]);
      setMapping({ amount: '', date: '', description: '', payment_method: '' });
      setPreview([]);
      setCsvError('');
      setPhoto(null);
      setPhotoPreview(null);
      setPhotoError('');
      setPhotoRows([]);
      setOcrText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [open]);

  // CSV handlers (same as before)
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError('');
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<any>) => {
        setCsvData(results.data);
        setHeaders(results.meta.fields || []);
        setStep(2);
      },
      error: (err: ParseError) => setCsvError('Failed to parse CSV: ' + err.message),
    });
  };
  const handleMapChange = (field: CsvField, value: string) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  };
  const handlePreview = () => {
    if (!mapping.amount || !mapping.date) {
      setCsvError('Please map both Amount and Date columns.');
      return;
    }

    setCsvError('');
    // Map CSV columns to transaction fields
    const mapped = csvData.map(row => ({
      amount: row[mapping.amount],
      date: row[mapping.date],
      description: mapping.description ? row[mapping.description] : 'Imported Transaction',
      payment_method: mapping.payment_method ? normalizePaymentMethod(row[mapping.payment_method]) : null,
    }));
    setPreview(mapped);
    setStep(3);
  };
  const handleImport = () => {
    // Set all imported transactions to category 'Other' and description 'Imported Transaction'
    const otherCategory = categories.find(c => c.name.toLowerCase() === 'other');
    const cleaned = preview.map(row => {
      const parsedAmount = parseFloat(row.amount);
      const isIncome = parsedAmount >= 0;
      return {
        ...row,
        amount: Math.abs(parsedAmount),
        date: row.date,
        category_id: otherCategory ? otherCategory.id : null,
        category: 'Other',
        description: row.description || 'Imported Transaction',
        payment_method: row.payment_method || null,
        type: row.type || (isIncome ? 'income' : 'expense'),
      };
    });
    // Filter out invalid rows
    const valid = cleaned.filter(row => row.amount && row.date && row.category_id);
    onImport(valid);
    onClose();
  };

  // Photo handlers
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file.');
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };



  const handlePhotoExtractLocal = async () => {
    if (!photo) return;
    setOcrLoading(true);
    setOcrError('');
    try {
      const { data: { text } } = await Tesseract.recognize(photo, 'eng');
      setOcrText(text);
      const parsedRows = extractTransactionsFromOcrText(text);
      const otherCategory = categories.find(c => c.name.toLowerCase() === 'other');
      setPhotoRows(parsedRows.map(row => ({
        ...row,
        category_id: row.category_id || otherCategory?.id || null,
      })));
      if (parsedRows.length === 0) {
        setOcrError('No transactions were detected. Try a clearer image or a statement with visible dates and amounts.');
      }
    } catch {
      setOcrError('Failed to extract text from image.');
    } finally {
      setOcrLoading(false);
    }
  };

  const updatePhotoRow = (index: number, key: keyof ImportedTransaction, value: string | boolean | PaymentMethod | null) => {
    setPhotoRows(prev => prev.map((row, rowIndex) => (
      rowIndex === index ? { ...row, [key]: value } : row
    )));
  };

  const handlePhotoImport = () => {
    const otherCategory = categories.find(c => c.name.toLowerCase() === 'other');
    const cleaned = photoRows
      .filter(row => row.include)
      .map(row => ({
        amount: parseFloat(row.amount),
        date: row.date || new Date().toISOString().slice(0, 10),
        category_id: row.category_id || otherCategory?.id || null,
        category: 'Other',
        description: row.description || 'Imported Transaction',
        payment_method: row.payment_method || null,
        type: 'expense',
      }))
      .filter(row => !Number.isNaN(row.amount) && row.amount > 0 && row.date && row.category_id);

    onImport(cleaned);
    onClose();
  };

  return open ? (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-2 sm:p-6 rounded-2xl shadow-2xl w-full max-w-full sm:max-w-2xl min-h-fit space-y-6 max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <button className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300" onClick={onClose}>&times;</button>
        <div className="flex space-x-2 mb-4">
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'csv' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`} onClick={() => setTab('csv')}>CSV</button>
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'photo' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`} onClick={() => setTab('photo')}>Photo</button>
        </div>
        {tab === 'csv' && (
          <>
            {step === 1 && (
              <div>
                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFile} className="mb-4" />
                <p className="text-gray-500 text-sm">Upload a CSV file exported from your bank or credit card statement.</p>
                {csvError && <div className="text-red-500 text-sm mt-2">{csvError}</div>}
                <div className="mt-4 flex gap-2">
                  <button className="bg-neutral-800 text-gray-200 hover:bg-neutral-700 px-4 py-2 rounded transition-colors" onClick={onClose}>Cancel</button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h3 className="font-semibold mb-2">Map Columns</h3>
                {csvFields.map(field => (
                  <div key={field.key} className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.label}{field.required ? ' *' : ''}
                    </label>
                    <select
                      className="w-full border rounded p-2"
                      value={mapping[field.key]}
                      onChange={e => handleMapChange(field.key, e.target.value)}
                    >
                      <option value="">Ignore</option>
                      {headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                ))}
                {csvError && <div className="text-red-500 text-sm mt-2">{csvError}</div>}
                <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4" onClick={handlePreview}>Preview</button>
              </div>
            )}
            {step === 3 && (
              <div>
                <h3 className="font-semibold mb-2">Preview & Import</h3>
                <div className="overflow-x-auto max-h-64 mb-4">
                  <table className="min-w-full text-sm border">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1">Amount</th>
                        <th className="border px-2 py-1">Date</th>
                        <th className="border px-2 py-1">Category</th>
                        <th className="border px-2 py-1">Description</th>
                        <th className="border px-2 py-1">Payment Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i}>
                          <td className="border px-2 py-1">{row.amount}</td>
                          <td className="border px-2 py-1">{row.date}</td>
                          <td className="border px-2 py-1">Other</td>
                          <td className="border px-2 py-1">Imported Transaction</td>
                          <td className="border px-2 py-1">{row.payment_method || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={handleImport}>Import</button>
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded" onClick={onClose}>Cancel</button>
              </div>
            )}
          </>
        )}
        {tab === 'photo' && (
          <div>
            <input type="file" accept="image/*" onChange={handlePhoto} className="mb-4" />
            {photoError && <div className="text-red-500 text-sm mb-2">{photoError}</div>}
            {photoPreview && (
              <div className="mb-4">
                <img src={photoPreview} alt="Preview" className="max-h-48 rounded shadow mx-auto" />
              </div>
            )}
            {ocrError && <div className="text-red-500 text-sm mb-2">{ocrError}</div>}
            {photoRows.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Review extracted rows</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{photoRows.length} detected</span>
                </div>
                <div className="max-h-80 overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900">
                      <tr className="text-left">
                        <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">Include</th>
                        <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">Date</th>
                        <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">Amount</th>
                        <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">Description</th>
                        <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">Category</th>
                        <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">Payment Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {photoRows.map((row, index) => (
                        <tr key={`${row.description}-${index}`} className={row.confidence === 'low' ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                          <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                            <input
                              type="checkbox"
                              checked={row.include}
                              onChange={e => updatePhotoRow(index, 'include', e.target.checked)}
                            />
                          </td>
                          <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                            <input
                              type="date"
                              className={inputBase + ' py-2'}
                              value={row.date}
                              onChange={e => updatePhotoRow(index, 'date', e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className={inputBase + ' py-2'}
                              value={row.amount}
                              onChange={e => updatePhotoRow(index, 'amount', e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                            <input
                              type="text"
                              className={inputBase + ' py-2'}
                              value={row.description}
                              onChange={e => updatePhotoRow(index, 'description', e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                            <select
                              className={inputBase + ' py-2'}
                              value={row.category_id || ''}
                              onChange={e => updatePhotoRow(index, 'category_id', e.target.value || null)}
                            >
                              <option value="">Other</option>
                              {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                            <select
                              className={inputBase + ' py-2'}
                              value={row.payment_method || ''}
                              onChange={e => updatePhotoRow(index, 'payment_method', (e.target.value || null) as PaymentMethod | null)}
                            >
                              <option value="">Unspecified</option>
                              <option value="credit_card">Credit Card</option>
                              <option value="upi">UPI</option>
                              <option value="cash">Cash</option>
                              <option value="debit_card">Debit Card</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <button className="bg-neutral-800 text-gray-200 hover:bg-neutral-700 px-4 py-2 rounded transition-colors" onClick={onClose}>Cancel</button>
              {photo && <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => { setPhoto(null); setPhotoPreview(null); setPhotoError(''); }}>Remove</button>}
              {photo && <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handlePhotoExtractLocal} disabled={ocrLoading}>{ocrLoading ? 'Extracting...' : 'Extract Transactions'}</button>}
              {photoRows.length > 0 && <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handlePhotoImport}>Import Selected</button>}
            </div>
            {ocrText && <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">OCR is processed locally in your browser. Nothing is sent to an AI service.</p>}
          </div>
        )}
      </div>
    </div>
  ) : null;
};

const TransactionHistory = ({ transactions }: { transactions: Transaction[] }) => {
  const { categories } = useBudget();
  const { mutateAsync: addTransaction } = useCreateTransaction();
  const { mutateAsync: removeTransaction } = useDeleteTransaction();
  const { page, from, to, nextPage, prevPage } = usePagination();
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState<any | null>(null);
  const [showCsv, setShowCsv] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);

  // Helper to get category name
  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Other';
  };

  // Handle select all
  const handleSelectAll = (checked: boolean, txs: any[]) => {
    setSelectAll(checked);
    setSelected(checked ? txs.map(t => t.id) : []);
  };

  // Handle select one
  const handleSelectOne = (id: string, checked: boolean) => {
    setSelected(prev => checked ? [...prev, id] : prev.filter(sid => sid !== id));
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} transactions? This cannot be undone.`)) return;
    setBulkDeleting(true);
    const failed: string[] = [];
    
    await Promise.all(
      selected.map(async (id) => {
        try {
          await removeTransaction(id);
        } catch {
          failed.push(id);
        }
      })
    );

    setBulkDeleting(false);
    setSelected([]);
    setSelectAll(false);
    if (failed.length > 0) {
      setNotification({ message: `Failed to delete ${failed.length} transactions.`, type: 'error' });
    } else {
      setNotification({ message: 'Transactions deleted successfully.', type: 'success' });
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const catName = getCategoryName(tx.category_id).toLowerCase();
    return (
      tx.description?.toLowerCase().includes(search.toLowerCase()) ||
      catName.includes(search.toLowerCase()) ||
      String(tx.amount).includes(search)
    );
  });

  const paginatedTransactions = filteredTransactions.slice(from, to + 1);

  const handleCsvImport = async (rows: any[]) => {
    await Promise.all(
      rows.map(row =>
        addTransaction({
          amount: row.amount,
          date: row.date,
          category_id: row.category_id,
          description: row.description,
          payment_method: row.payment_method,
          type: row.type || 'expense',
        })
      )
    );
  };

  // Handle outside click to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (!target.closest('.transaction-dropdown')) {
        setDropdownOpen(null);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold flex-1 sm:flex-initial" onClick={() => { setEditTransaction(null); setShowForm(true); }}>+ Add Transaction</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded font-semibold flex-1 sm:flex-initial" onClick={() => setShowCsv(true)}>Import</button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded font-semibold flex-1 sm:flex-initial" onClick={() => setShowPdf(true)}>Document Import</button>
        </div>
        <div className="flex flex-col w-full md:w-64">
          <label htmlFor="search-transactions" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Search Transactions</label>
          <div className="relative">
            <input
              id="search-transactions"
              type="text"
              className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-colors"
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          </div>
        </div>
      </div>
      <ImportModal
        open={showCsv}
        onClose={() => setShowCsv(false)}
        categories={categories}
        onImport={handleCsvImport}
      />
      <DocumentImportModal
        open={showPdf}
        onClose={() => setShowPdf(false)}
        categories={categories}
        onImport={handleCsvImport}
      />
      {notification && (
        <NotificationBanner
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Transaction History</h2>
        {/* Bulk action toolbar */}
        {selected.length > 0 && (
          <div className="mb-4 flex items-center gap-4 bg-red-50 dark:bg-red-900 p-3 rounded-lg border border-red-200 dark:border-red-700">
            <span className="font-medium text-red-700 dark:text-red-300">{selected.length} selected</span>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? 'Deleting...' : 'Bulk Delete'}
            </button>
          </div>
        )}
        <div className="divide-y">
          {/* Select All Checkbox */}
          {filteredTransactions.length > 0 && (
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={e => handleSelectAll(e.target.checked, filteredTransactions)}
                className="mr-2 w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 accent-blue-600 transition-colors duration-150 hover:border-blue-400 hover:shadow"
                aria-label="Select all transactions"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Select All</span>
            </div>
          )}
          {filteredTransactions.length === 0 && <div className="text-gray-500 dark:text-gray-300 py-8 text-center">No transactions found. Click "Add Transaction" to add one.</div>}
          {paginatedTransactions.map(tx => (
            <div
              key={tx.id}
              className={`flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-6 py-4 mb-4 shadow-sm transition-colors ${selected.includes(tx.id) ? 'ring-2 ring-red-400 dark:ring-red-600' : ''}`}
            >
              <div className="flex items-center mr-4">
                <input
                  type="checkbox"
                  checked={selected.includes(tx.id)}
                  onChange={e => handleSelectOne(tx.id, e.target.checked)}
                  className="mr-2 w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 accent-blue-600 transition-colors duration-150 hover:border-blue-400 hover:shadow"
                  aria-label="Select transaction"
                />
              </div>
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                <div className="flex items-center text-gray-500 dark:text-gray-300 mb-1 md:mb-0">
                  <span className="inline-block align-middle mr-2 text-lg">🍽️</span>
                  <span className="font-semibold text-base dark:text-gray-100 mr-2">{getCategoryName(tx.category_id)}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <span className="text-gray-800 dark:text-gray-100 font-medium text-base">{tx.description}</span>
                  <span className="flex items-center text-gray-400 text-sm dark:text-gray-400 ml-0 md:ml-4">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                    {tx.date ? new Date(tx.date).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 md:mt-0">
                <div className={
                  (tx.type === 'income'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400') +
                  ' text-xl font-bold min-w-[120px] text-right'
                }>
                  {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                </div>
                {/* Three-dot dropdown menu */}
                <div className="relative transaction-dropdown">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                    onClick={() => setDropdownOpen(dropdownOpen === tx.id ? null : tx.id)}
                    aria-label="Transaction actions"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
                  </button>
                  {dropdownOpen === tx.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-t-lg"
                        onClick={() => { setEditTransaction(tx); setShowForm(true); setDropdownOpen(null); }}
                      >
                        Edit
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded-b-lg"
                        onClick={() => { removeTransaction(tx.id); setDropdownOpen(null); }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination Controls */}
        {filteredTransactions.length > 20 && (
          <div className="flex justify-between items-center mt-6">
            <button
              disabled={page === 0}
              onClick={prevPage}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              Page {page + 1} of {Math.ceil(filteredTransactions.length / 20)}
            </span>
            <button
              disabled={(page + 1) * 20 >= filteredTransactions.length}
              onClick={nextPage}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <TransactionFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditTransaction(null); }}
        transaction={editTransaction}
      />
    </div>
  );
};

const tabs = [
  { key: 'budgets', label: 'Budgets' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'insights', label: 'Insights' },
];

const Finances: React.FC = () => {
  const [activeTab, setActiveTab] = useState('budgets');
  
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const selectedYear = Number(selectedMonth.split('-')[0]);

  const { data: monthlyTransactions = [] } = useTransactions(selectedYear, selectedMonth);
  const { data: budgets = [] } = useBudgets(selectedYear, selectedMonth);

  return (
    <div className="max-w-6xl mx-auto mt-4 px-4 sm:px-0">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Finances</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="finance-month" className="text-sm font-medium text-gray-600 dark:text-gray-300 shrink-0">
            Month
          </label>
          <input
            type="month"
            id="finance-month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-auto min-w-[160px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer"
          />
        </div>
      </div>
      <div className="flex space-x-4 border-b mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 font-medium border-b-2 transition-colors duration-150 ${activeTab === tab.key ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'budgets' && <BudgetCards transactions={monthlyTransactions} budgets={budgets} selectedMonth={selectedMonth} />}
      {activeTab === 'transactions' && <TransactionHistory transactions={monthlyTransactions} />}
      {activeTab === 'insights' && <InsightsSection transactions={monthlyTransactions} />}
    </div>
  );
};

export default Finances; 

