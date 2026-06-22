import { useState } from 'react';
import { Edit2, Trash2, CreditCard } from 'lucide-react';
import { Database } from '../lib/supabase';
import { formatCurrency } from '../utils/cycles';

type Card = Database['public']['Tables']['cards']['Row'];

interface CardHeaderProps {
  card: Card;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CardHeader({ card, onEdit, onDelete }: CardHeaderProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
            <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.card_name}</h1>
            <p className="text-gray-600 dark:text-gray-300">{card.card_company} • {card.card_network}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
        <div>
          <p className="text-gray-600 font-medium dark:text-gray-300">Anniversary Month</p>
          <p className="text-gray-900 dark:text-gray-100 mt-1">
            {new Date(0, card.anniversary_month - 1).toLocaleDateString('en-US', { month: 'long' })}
          </p>
        </div>
        <div>
          <p className="text-gray-600 font-medium dark:text-gray-300">Billing Date</p>
          <p className="text-gray-900 dark:text-gray-100 mt-1">{card.billing_date}</p>
        </div>
        <div>
          <p className="text-gray-600 font-medium dark:text-gray-300">Due Date</p>
          <p className="text-gray-900 dark:text-gray-100 mt-1">{card.due_date}</p>
        </div>
        <div>
          <p className="text-gray-600 font-medium dark:text-gray-300">Annual Fee</p>
          <p className="text-gray-900 dark:text-gray-100 mt-1">{formatCurrency(card.annual_fee)}</p>
        </div>
        <div>
          <p className="text-gray-600 font-medium dark:text-gray-300">Milestone</p>
          <p className="text-gray-900 dark:text-gray-100 mt-1 font-semibold">{formatCurrency(card.milestone_amount)}</p>
        </div>
        {card.card_limit != null && (
          <div>
            <p className="text-gray-600 font-medium dark:text-gray-300">Card Limit</p>
            <p className="text-gray-900 dark:text-gray-100 mt-1 font-semibold">{formatCurrency(card.card_limit)}</p>
          </div>
        )}
        <div>
          <p className="text-gray-600 font-medium dark:text-gray-300">Created</p>
          <p className="text-gray-900 dark:text-gray-100 mt-1">
            {new Date(card.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-sm mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Delete Card</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{card.card_name}"? This action cannot be undone and will also delete all associated spending data.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white dark:text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
