import React from 'react';
import { useBudget } from '../contexts/BudgetContext';

const CategoryManager: React.FC = () => {
  const { categories, loading, error } = useBudget();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Available Categories</h2>
      {loading && <div className="text-gray-500">Loading categories...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul className="list-disc pl-6">
        {categories.map(cat => (
          <li key={cat.id} className="py-1 text-gray-800 dark:text-gray-100">{cat.name}</li>
        ))}
      </ul>
      {categories.length === 0 && !loading && !error && (
        <div className="text-gray-500">No categories found.</div>
      )}
    </div>
  );
};

export default CategoryManager; 