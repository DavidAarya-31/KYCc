import React, { useState, useEffect } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  budget?: any;
  onClose: () => void;
}

const BudgetForm: React.FC<Props> = ({ budget, onClose }) => {
  const { addBudget, editBudget, loading, error, categories } = useBudget();
  const { user } = useAuth();
  const [name, setName] = useState(budget?.name || '');
  const [totalAmount, setTotalAmount] = useState(budget?.total_amount || '');
  const [periodType, setPeriodType] = useState(budget?.period_type || 'monthly');
  const [startDate, setStartDate] = useState(budget?.start_date || '');
  const [endDate, setEndDate] = useState(budget?.end_date || '');
  const [categoryId, setCategoryId] = useState(budget?.category_id || (categories[0]?.id || ''));
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setFormError('');
  }, [name, totalAmount, periodType, startDate, endDate, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setFormError('Name is required');
    if (!totalAmount || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) return setFormError('Total amount must be a positive number');
    if (!startDate) return setFormError('Start date is required');
    if (!categoryId) return setFormError('Category is required');
    if (!user?.id) return setFormError('User not authenticated');
    const data = {
      user_id: user.id,
      category_id: categoryId,
      name: name.trim(),
      total_amount: Number(totalAmount),
      period_type: periodType,
      start_date: startDate,
      end_date: endDate || null,
    };
    if (budget) {
      await editBudget(budget.id, data);
    } else {
      await addBudget(data);
    }
    if (!error) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form className="bg-white dark:bg-gray-900 p-6 rounded shadow-md w-full max-w-md space-y-4 border border-gray-200 dark:border-gray-800" onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{budget ? 'Edit Budget' : 'Create Budget'}</h2>
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Name</label>
          <input className="w-full border border-gray-300 dark:border-gray-700 px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Category</label>
          {categories.length === 0 ? (
            <div className="text-red-500 text-sm font-medium mb-2">No categories found. Please contact admin.</div>
          ) : null}
          <select
            className="w-full border border-gray-300 dark:border-gray-700 px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            required
            disabled={categories.length === 0}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Total Amount</label>
          <input className="w-full border border-gray-300 dark:border-gray-700 px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" type="number" min="0" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Period</label>
          <select className="w-full border border-gray-300 dark:border-gray-700 px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={periodType} onChange={e => setPeriodType(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Start Date</label>
          <input className="w-full border border-gray-300 dark:border-gray-700 px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        </div>
        {periodType === 'custom' && (
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">End Date</label>
            <input className="w-full border border-gray-300 dark:border-gray-700 px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        )}
        {formError && <div className="text-red-500 dark:text-red-300">{formError}</div>}
        {error && <div className="text-red-500 dark:text-red-300">{error}</div>}
        <div className="flex justify-end space-x-2">
          <button type="button" className="px-4 py-1 rounded border bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700 transition-colors" onClick={onClose}>Cancel</button>
          <button type="submit" className="bg-blue-500 text-white dark:text-white px-4 py-1 rounded dark:bg-blue-600 disabled:opacity-50" disabled={loading || categories.length === 0}>{budget ? 'Update' : 'Create'}</button>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm; 
