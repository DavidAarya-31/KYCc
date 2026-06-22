import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../lib/supabase';
import { CycleWindow, getAnniversaryCycle, getRecentYears } from '../utils/cycles';
import { calculateTotalCardSpend } from '../utils/cardSpending';
import { useCurrentDateKey } from '../hooks/useCurrentDateKey';
import { PageHeader } from '../components/PageHeader';
import { CardHeader } from '../components/CardHeader';
import { CycleSummary } from '../components/CycleSummary';
import { MonthlySpendTable } from '../components/MonthlySpendTable';

type Card = Database['public']['Tables']['cards']['Row'];

interface CardStats {
  totalSpent: number;
  cycle: CycleWindow | null;
}

export function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dateKey = useCurrentDateKey();
  const [selectedCycleYear, setSelectedCycleYear] = useState<number | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [stats, setStats] = useState<CardStats>({ totalSpent: 0, cycle: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchCard();
    }
  }, [user, id, dateKey]);

  useEffect(() => {
    if (card && selectedCycleYear !== null) {
      calculateStats(card);
    }
  }, [selectedCycleYear]);

  const fetchCard = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch card details
      const { data: cardData, error: cardError } = await supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .eq('user_id', user!.id)
        .single();

      if (cardError) throw cardError;
      if (!cardData) {
        navigate('/cards');
        return;
      }

      setCard(cardData);
      
      let yearToUse = selectedCycleYear;
      if (yearToUse === null) {
        const currentCycle = getAnniversaryCycle(cardData.anniversary_month);
        yearToUse = parseInt(currentCycle.startMonth.slice(0, 4), 10);
        setSelectedCycleYear(yearToUse);
      } else {
        await calculateStats(cardData);
      }
    } catch (error) {
      console.error('Error fetching card:', error);
      navigate('/cards');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async (cardData: Card) => {
    try {
      if (selectedCycleYear === null) return;
      const cycle = getAnniversaryCycle(
        cardData.anniversary_month,
        new Date(selectedCycleYear, cardData.anniversary_month - 1, 15)
      );
      const totalSpent = await calculateTotalCardSpend(cardData.id, cycle);
      setStats({
        totalSpent,
        cycle,
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleSpendUpdate = () => {
    if (card) {
      calculateStats(card);
    }
  };

  const handleEdit = () => {
    if (card) {
      navigate(`/cards/${card.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!card) return;
    
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', card.id)
        .eq('user_id', user!.id);

      if (error) throw error;
      
      navigate('/cards');
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Error deleting card. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Card not found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">The card you're looking for doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => navigate('/cards')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cards
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="">
        <div className="flex items-center gap-2">
          <label htmlFor="cycle-year" className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Cycle Year
          </label>
          <select
            id="cycle-year"
            value={selectedCycleYear || new Date().getFullYear()}
            onChange={(e) => setSelectedCycleYear(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            {getRecentYears(8).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => navigate('/cards')}
          className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cards
        </button>
      </PageHeader>

      <CardHeader card={card} onEdit={handleEdit} onDelete={handleDelete} />
      {/* Current Cycle Summary */}
      {stats.cycle && (
        <>
          <CycleSummary
            milestone={card.milestone_amount}
            spent={stats.totalSpent}
            cycle={stats.cycle}
          />
          <MonthlySpendTable
            cardId={card.id}
            cycle={stats.cycle}
            onSpendUpdate={handleSpendUpdate}
          />
        </>
      )}
    </div>
  );
}
