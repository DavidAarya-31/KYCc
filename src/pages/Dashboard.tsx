import { useState } from 'react';
import { CardsOverview, YourCards } from '../components/DashboardSummary';
import { OverviewSection } from './Finances';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';

export function Dashboard() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const selectedYear = Number(selectedMonth.split('-')[0]);

  const { data: transactions = [] } = useTransactions(selectedYear, selectedMonth);
  const { data: budgets = [] } = useBudgets(selectedYear, selectedMonth);

  return (
    <div>
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-0">Overview of Finances</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="dashboard-month" className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Month
            </label>
            <input
              type="month"
              id="dashboard-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer"
            />
          </div>
        </div>
        <OverviewSection transactions={transactions} budgets={budgets} />
      </div>
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Overview of Cards</h2>
        <CardsOverview />
      </div>
      <div className="mb-10">
        <YourCards />
      </div>
    </div>
  );
}
