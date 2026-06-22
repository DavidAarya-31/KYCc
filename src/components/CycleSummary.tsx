import { CycleWindow, formatCurrency, formatMonth, getCycleEndDate, getProgressPercentage } from '../utils/cycles';

interface CycleSummaryProps {
  milestone: number;
  spent: number;
  cycle: CycleWindow;
}

export function CycleSummary({ milestone, spent, cycle }: CycleSummaryProps) {
  const remaining = Math.max(0, milestone - spent);
  const progress = getProgressPercentage(spent, milestone);
  const endDate = getCycleEndDate(cycle);
  const isUrgent = remaining > 0 && endDate.getTime() - Date.now() < 60 * 24 * 60 * 60 * 1000;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Current Cycle Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
        <div>
          <p className="text-gray-600 dark:text-gray-300">Cycle Dates</p>
          <p className="text-gray-900 dark:text-gray-100 font-medium">
            {formatMonth(cycle.startMonth)} - {formatMonth(cycle.endMonth)}
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-300">Milestone</p>
          <p className="text-gray-900 dark:text-gray-100 font-medium">{formatCurrency(milestone)}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-300">Spent</p>
          <p className="text-green-600 dark:text-green-400 font-medium">{formatCurrency(spent)}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-300">Remaining</p>
          <p className="text-red-600 dark:text-red-400 font-medium">{formatCurrency(remaining)}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Progress to Milestone</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {remaining > 0 && (
        <div className={`mt-4 flex items-center space-x-2 p-3 rounded-lg ${
          isUrgent ? 'bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800'
        }`}>
          <p className={`text-sm font-medium ${isUrgent ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'}`}>
            Spend {formatCurrency(remaining)} more by {endDate.toLocaleDateString()}
          </p>
        </div>
      )}

      {remaining <= 0 && (
        <div className="mt-4 flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">Milestone completed for this cycle!</p>
        </div>
      )}
    </div>
  );
}
