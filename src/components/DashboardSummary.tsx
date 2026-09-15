import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getAnniversaryCycle, formatCurrency } from '../utils/cycles';
import { calculateTotalCardSpend } from '../utils/cardSpending';
import { useCurrentDateKey } from '../hooks/useCurrentDateKey';
import { TrendingUp, Wallet, Target, Loader } from 'lucide-react';
import { CardTileCompact } from './CardTile';

interface DashboardStats {
  totalMilestone: number;
  totalSpent: number;
  totalRemaining: number;
  totalLimit: number;
}

export function CardsOverview() {
  const { user } = useAuth();
  const dateKey = useCurrentDateKey();
  const [stats, setStats] = useState<DashboardStats>({
    totalMilestone: 0,
    totalSpent: 0,
    totalRemaining: 0,
    totalLimit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      fetchCards();
    }
  }, [user, dateKey]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all user's cards
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user!.id);

      if (cardsError) throw cardsError;

      let totalMilestone = 0;
      let totalSpent = 0;
      let totalLimit = 0;

      // Calculate stats for each card in parallel
      const cardSpends = await Promise.all(
        (cards || []).map(async (card) => {
          totalMilestone += card.milestone_amount;
          if (card.card_limit != null) totalLimit += card.card_limit;
          
          const cycle = getAnniversaryCycle(card.anniversary_month);
          const cardSpent = await calculateTotalCardSpend(card.id, cycle);
          return cardSpent;
        })
      );
      totalSpent = cardSpends.reduce((sum, spent) => sum + spent, 0);

      const totalRemaining = Math.max(0, totalMilestone - totalSpent);

      setStats({
        totalMilestone,
        totalSpent,
        totalRemaining,
        totalLimit,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      // Fetch all user's cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (cardsError) throw cardsError;
      
      const cardsWithSpending = await Promise.all(
        (cardsData || []).map(async (card) => {
          const cycle = getAnniversaryCycle(card.anniversary_month);
          const totalSpent = await calculateTotalCardSpend(card.id, cycle);
          return { ...card, totalSpent };
        })
      );
      setCards(cardsWithSpending);
    } catch (error) {
      console.error('Error fetching cards for dashboard:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-center h-24">
              <Loader className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-stretch gap-6 mb-8">
        <div className="flex-1 flex flex-col gap-4 justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Total Milestone</p>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(stats.totalMilestone)}
                  </h3>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Across all cards</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Total Limit</p>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(stats.totalLimit)}
                  </h3>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Sum of all card limits</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Total Spent</p>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(stats.totalSpent)}
                  </h3>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Current cycle-to-date</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Total Remaining</p>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(stats.totalRemaining)}
                  </h3>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                  <Wallet className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">To reach milestones</p>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center justify-center mt-6 md:mt-0">
          <PieChart cards={cards} />
        </div>
      </div>
    </>
  );
}

export function YourCards() {
  const { user } = useAuth();
  const dateKey = useCurrentDateKey();
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user, dateKey]);

  const fetchCards = async () => {
    try {
      // Fetch all user's cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (cardsError) throw cardsError;
      
      const cardsWithSpending = await Promise.all(
        (cardsData || []).map(async (card) => {
          const cycle = getAnniversaryCycle(card.anniversary_month);
          const totalSpent = await calculateTotalCardSpend(card.id, cycle);
          return { ...card, totalSpent };
        })
      );
      setCards(cardsWithSpending);
    } catch (error) {
      console.error('Error fetching cards for dashboard:', error);
    }
  };

  return (
      <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Cards</h2>
        {cards.length === 0 ? (
          <div className="text-gray-500">No cards found.</div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <CardTileCompact key={card.id} card={card} spent={card.totalSpent} />
            ))}
          </div>
        )}
      </div>
  );
}

function PieChart({ cards }: { cards: any[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  if (!cards.length) return null;
  const totalSpent = cards.reduce((sum, c) => sum + c.totalSpent, 0);
  if (totalSpent === 0) return null;
  const radius = 80;
  const center = radius + 12; // add padding
  const svgSize = (radius + 12) * 2;
  const colors = [
    '#2563eb', // blue
    '#16a34a', // green
    '#f59e42', // orange
    '#e11d48', // red
    '#a21caf', // purple
    '#0e7490', // teal
    '#facc15', // yellow
    '#7c3aed', // indigo
  ];
  let cumulative = 0;
  const maxSpent = Math.max(...cards.map(c => c.totalSpent));
  function describeArc(startAngle: number, endAngle: number) {
    const start = {
      x: center + radius * Math.cos((startAngle - 90) * Math.PI / 180),
      y: center + radius * Math.sin((startAngle - 90) * Math.PI / 180),
    };
    const end = {
      x: center + radius * Math.cos((endAngle - 90) * Math.PI / 180),
      y: center + radius * Math.sin((endAngle - 90) * Math.PI / 180),
    };
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return [
      `M ${center} ${center}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      'Z',
    ].join(' ');
  }
  // Tooltip logic
  let tooltip = null;
  if (hovered !== null && cards[hovered]) {
    const card = cards[hovered];
    const percent = totalSpent ? (card.totalSpent / totalSpent) * 100 : 0;
    tooltip = (
      <div className="absolute left-1/2 -translate-x-1/2 -top-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 z-10 pointer-events-none whitespace-nowrap">
        {card.card_name}<br/>
        {percent.toFixed(1)}% &bull; {formatCurrency(card.totalSpent)}
      </div>
    );
  }
  return (
    <div className="relative flex flex-col items-center justify-center" style={{ minWidth: svgSize, minHeight: svgSize }}>
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        {tooltip}
        <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="block mx-auto">
          {cards.map((card, i) => {
            const percent = card.totalSpent / totalSpent;
            const startAngle = cumulative * 360;
            const endAngle = (cumulative + percent) * 360;
            const color = colors[i % colors.length];
            const highlight = card.totalSpent === maxSpent;
            const path = describeArc(startAngle, endAngle);
            cumulative += percent;
            return (
              <path
                key={card.id}
                d={path}
                fill={color}
                style={{ filter: highlight ? 'drop-shadow(0 0 6px #2563eb)' : undefined, stroke: 'none', transition: 'filter 0.2s' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                cursor="pointer"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
