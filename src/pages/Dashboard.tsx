import { CardsOverview, YourCards } from '../components/DashboardSummary';
import { OverviewSection } from './Finances';
import { useBudget } from '../contexts/BudgetContext';

export function Dashboard() {
  const { transactions } = useBudget();

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Overview of Finances</h2>
        <OverviewSection transactions={transactions} />
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
