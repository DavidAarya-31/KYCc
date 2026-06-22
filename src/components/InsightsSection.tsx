import React, { useEffect, useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { detectAnomalies } from '../utils/ai';
import { AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = [
  '#2563eb', '#16a34a', '#f59e42', '#e11d48', '#a21caf', '#0e7490', '#facc15', '#7c3aed', '#f472b6', '#10b981', '#fbbf24', '#6366f1'
];

function getSpendingTrends(transactions: any[], categories: any[], period = 'monthly'): any[] {
  // Group by month (YYYY-MM)
  const map: Record<string, number> = {};
  transactions.filter((t: any) => {
    const cat = categories.find((c: any) => c.id === t.category_id)?.name?.toLowerCase() || '';
    return t.type === 'expense' && !cat.includes('credit card payment') && !cat.includes('transfer');
  }).forEach((t: any) => {
    const date = new Date(t.date);
    let key;
    if (period === 'monthly') key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    else if (period === 'weekly') key = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
    else key = date.toISOString().slice(0, 10);
    map[key] = (map[key] || 0) + t.amount;
  });
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ period: k, amount: v }));
}

function getCategoryBreakdown(transactions: any[], categories: any[]): any[] {
  const map: Record<string, number> = {};
  transactions.filter((t: any) => {
    const catName = categories.find((c: any) => c.id === t.category_id)?.name?.toLowerCase() || '';
    return t.type === 'expense' && !catName.includes('credit card payment') && !catName.includes('transfer');
  }).forEach((t: any) => {
    const cat = categories.find((c: any) => c.id === t.category_id)?.name || 'Other';
    map[cat] = (map[cat] || 0) + t.amount;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function InsightsSection({ transactions: inputTransactions }: { transactions?: any[] }) {
  const { transactions: contextTransactions, categories, loading, error } = useBudget();
  const transactions = inputTransactions ?? contextTransactions;

  // Data
  const trends = getSpendingTrends(transactions, categories, 'monthly');
  const breakdown = getCategoryBreakdown(transactions, categories);

  const [anomalies, setAnomalies] = useState<string[]>([]);

  useEffect(() => {
    if (!transactions || transactions.length === 0 || categories.length === 0) return;

    const checkAnomalies = async () => {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const categorySpends: Record<string, { current: number, totalPast: number, pastMonths: Set<string> }> = {};
      
      transactions.forEach(t => {
        if (t.type !== 'expense') return;
        const catName = categories.find((c: any) => c.id === t.category_id)?.name || 'Other';
        if (catName.toLowerCase().includes('credit card payment') || catName.toLowerCase().includes('transfer')) return;
        
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!categorySpends[catName]) {
          categorySpends[catName] = { current: 0, totalPast: 0, pastMonths: new Set() };
        }
        
        if (monthKey === currentMonthKey) {
          categorySpends[catName].current += t.amount;
        } else {
          categorySpends[catName].totalPast += t.amount;
          categorySpends[catName].pastMonths.add(monthKey);
        }
      });

      const alerts: string[] = [];
      for (const [catName, data] of Object.entries(categorySpends)) {
        const pastCount = data.pastMonths.size || 1;
        const avgPast = data.totalPast / pastCount;
        
        if (data.current > avgPast * 1.5 && avgPast > 50) {
          try {
            const alert = await detectAnomalies(catName, avgPast, data.current);
            if (alert) alerts.push(alert);
          } catch (err) {
            console.error('Anomaly detection error', err);
          }
        }
      }
      setAnomalies(alerts);
    };

    checkAnomalies();
  }, [transactions, categories]);

  if (loading) return <div className="text-center py-16 text-gray-400 dark:text-gray-500">Loading insights...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      {anomalies.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/30 border-l-4 border-orange-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
            <h3 className="text-orange-800 dark:text-orange-200 font-bold">Spending Anomalies Detected</h3>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-orange-700 dark:text-orange-300">
            {anomalies.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Spending Trends */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 transition-colors">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Spending Trends</h3>
        {trends.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trends} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#6b7280" className="text-xs" />
              <YAxis stroke="#6b7280" className="text-xs" />
              <Tooltip contentStyle={{ background: 'var(--tw-bg-opacity,1) #fff', color: '#111' }} wrapperClassName="dark:bg-gray-900 dark:text-gray-100" />
              <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 transition-colors">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Category Breakdown</h3>
        {breakdown.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {breakdown.map((entry: any, idx: number) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ background: 'var(--tw-bg-opacity,1) #fff', color: '#111' }} wrapperClassName="dark:bg-gray-900 dark:text-gray-100" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      </div>
    </div>
  );
} 
