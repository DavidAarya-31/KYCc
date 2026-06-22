import React from 'react';
import BudgetList from '../components/BudgetList';

const Budgets: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Budgets</h1>
      <BudgetList />
    </div>
  );
};

export default Budgets; 
