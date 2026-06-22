import { Link } from 'react-router-dom';
import { Database } from '../lib/supabase';
import { formatCurrency, getAnniversaryCycle, getCycleEndDate, getProgressPercentage } from '../utils/cycles';
import { CreditCard, Calendar } from 'lucide-react';

type Card = Database['public']['Tables']['cards']['Row'];

interface CardTileProps {
  card: Card;
  spent: number;
}

export function CardTile({ card, spent }: CardTileProps) {
  const remaining = Math.max(0, card.milestone_amount - spent);
  const progressPercentage = getProgressPercentage(spent, card.milestone_amount);
  
  const cycle = getAnniversaryCycle(card.anniversary_month);
  const endDate = getCycleEndDate(cycle);
  
  const isUrgent = remaining > 0 && endDate.getTime() - Date.now() < 60 * 24 * 60 * 60 * 1000; // 60 days

  return (
    <Link
      to={`/cards/${card.id}`}
      className="block bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{card.card_name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{card.card_company} • {card.card_network}</p>
            {card.card_limit != null && (
              <p className="text-xs text-gray-500 dark:text-gray-400">Limit: {formatCurrency(card.card_limit)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-300">Milestone</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(card.milestone_amount)}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-300">Spent</p>
            <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(spent)}</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Progress</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {remaining > 0 && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            isUrgent ? 'bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800'
          }`}>
            <Calendar className={`w-4 h-4 ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
            <p className={`text-sm font-medium ${isUrgent ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'}`}>
              Spend {formatCurrency(remaining)} more by {endDate.toLocaleDateString()}
            </p>
          </div>
        )}

        {remaining === 0 && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Milestone completed!</p>
          </div>
        )}
      </div>
    </Link>
  );
}

export function CardTileCompact({ card, spent }: CardTileProps) {
  const progressPercentage = getProgressPercentage(spent, card.milestone_amount);

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
      <div>
        <div className="font-semibold text-gray-900 dark:text-gray-100">{card.card_name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{card.card_company} • {card.card_network}</div>
        {card.card_limit != null && (
          <div className="text-xs text-gray-400 dark:text-gray-300">Limit: {formatCurrency(card.card_limit)}</div>
        )}
      </div>
      <div className="w-40 ml-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400 dark:text-gray-300">Progress</span>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-100">{progressPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
