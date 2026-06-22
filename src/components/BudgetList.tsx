import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import BudgetForm from './BudgetForm';

const BudgetList: React.FC = () => {
  const { budgets, loading, error, removeBudget } = useBudget();
  const [showForm, setShowForm] = useState(false);
  const [editBudget, setEditBudget] = useState<any | null>(null);

  if (loading) return <div className="text-gray-600 dark:text-gray-300">Loading budgets...</div>;
  if (error) return <div className="text-red-500 dark:text-red-300">{error}</div>;

  return (
    <div className="text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Your Budgets</h2>
        <button className="bg-blue-500 text-white dark:bg-blue-600 px-4 py-1 rounded hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors" onClick={() => { setEditBudget(null); setShowForm(true); }}>+ New Budget</button>
      </div>
      {showForm && (
        <BudgetForm budget={editBudget} onClose={() => { setShowForm(false); setEditBudget(null); }} />
      )}
      <ul className="divide-y">
        {budgets.map(budget => (
          <li key={budget.id} className="py-2 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
            <div>
              <span className="font-medium">{budget.name}</span> &mdash; {budget.total_amount} ({budget.period_type})
            </div>
            <div className="space-x-2">
              <button className="text-blue-600 dark:text-blue-400" onClick={() => { setEditBudget(budget); setShowForm(true); }}>Edit</button>
              <button className="text-red-600 dark:text-red-400" onClick={() => removeBudget(budget.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {budgets.length === 0 && <div className="text-gray-500 dark:text-gray-300 mt-4">No budgets found.</div>}
    </div>
  );
};

export default BudgetList; 
