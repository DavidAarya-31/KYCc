import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CycleWindow, formatMonth, formatCurrency } from '../utils/cycles';
import { fetchCycleMonthlySpends } from '../utils/cardSpending';
import { Save, Edit2 } from 'lucide-react';

interface MonthlySpend {
  id?: string;
  card_id: string;
  month: string;
  year: number;
  amount_spent: number;
}

interface MonthlySpendTableProps {
  cardId: string;
  cycle: CycleWindow;
  onSpendUpdate: () => void;
}

export function MonthlySpendTable({ cardId, cycle, onSpendUpdate }: MonthlySpendTableProps) {
  const [spends, setSpends] = useState<Record<string, MonthlySpend>>({});
  const [editingMonth, setEditingMonth] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSpends();
  }, [cardId, cycle]);

  const fetchSpends = async () => {
    try {
      const data = await fetchCycleMonthlySpends(cardId, cycle);

      const spendsMap: Record<string, MonthlySpend> = {};
      data.forEach(spend => {
        spendsMap[spend.month] = spend;
      });

      setSpends(spendsMap);
    } catch (error) {
      console.error('Error fetching spends:', error);
    }
  };

  const handleEdit = (month: string) => {
    const currentSpend = spends[month]?.amount_spent || 0;
    setEditingMonth(month);
    setEditValue((currentSpend / 100).toString()); // Convert from cents to rupees
  };

  const handleSave = async (month: string) => {
    try {
      setLoading(true);
      const [year] = month.split('-');
      const amountInCents = Math.round(parseFloat(editValue) * 100);

      const spendData = {
        card_id: cardId,
        month,
        year: parseInt(year),
        amount_spent: amountInCents,
      };

      const { data, error } = await supabase
        .from('monthly_spends')
        .upsert(spendData, { onConflict: 'card_id,month,year' })
        .select()
        .single();

      if (error) throw error;

      setSpends(prev => ({
        ...prev,
        [month]: data,
      }));

      setEditingMonth(null);
      setEditValue('');
      onSpendUpdate();
    } catch (error) {
      console.error('Error saving spend:', error);
      alert('Error saving spend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingMonth(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, month: string) => {
    if (e.key === 'Enter') {
      handleSave(month);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Monthly Spending</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-100">Month</th>
              <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-100">Amount Spent</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cycle.months.map((month) => {
              const spend = spends[month];
              const isEditing = editingMonth === month;
              const currentDate = new Date();
              const [year, monthNum] = month.split('-');
              const monthDate = new Date(parseInt(year), parseInt(monthNum) - 1);
              const isPastMonth = monthDate < new Date(currentDate.getFullYear(), currentDate.getMonth());

              return (
                <tr key={month} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatMonth(month)}</span>
                      {isPastMonth && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                          Past
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, month)}
                        onBlur={() => handleSave(month)}
                        placeholder="0"
                        step="0.01"
                        min="0"
                        className="w-32 px-3 py-1 text-right border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(spend?.amount_spent || 0)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleSave(month)}
                          disabled={loading}
                          className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/50 rounded disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(month)}
                        className="p-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        <p>Click the edit icon to update spending for any month. Changes are saved automatically.</p>
      </div>
    </div>
  );
}
