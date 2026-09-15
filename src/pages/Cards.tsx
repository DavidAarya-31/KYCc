import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../lib/supabase';
import { getAnniversaryCycle, formatCurrency } from '../utils/cycles';
import { fetchCycleMonthlySpends, calculateTotalCardSpend } from '../utils/cardSpending';
import { useCurrentDateKey } from '../hooks/useCurrentDateKey';
import { PageHeader } from '../components/PageHeader';
import { CardTile } from '../components/CardTile';

type Card = Database['public']['Tables']['cards']['Row'];

interface CardWithSpending extends Card {
  totalSpent: number;
}

export function Cards() {
  const { user } = useAuth();
  const dateKey = useCurrentDateKey();
  const [cards, setCards] = useState<CardWithSpending[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user, dateKey]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      
      // Fetch all user's cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (cardsError) throw cardsError;

      // Calculate spending for each card in parallel
      const cardsWithSpending = await Promise.all(
        (cardsData || []).map(async (card) => {
          const cycle = getAnniversaryCycle(card.anniversary_month);
          const totalSpent = await calculateTotalCardSpend(card.id, cycle);
          return {
            ...card,
            totalSpent,
          };
        })
      );

      setCards(cardsWithSpending);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  let recommendedCard = cards
    .filter(c => c.milestone_amount && c.totalSpent < c.milestone_amount)
    .sort((a, b) => (b.totalSpent / b.milestone_amount!) - (a.totalSpent / a.milestone_amount!))[0];

  if (!recommendedCard && cards.length > 0) {
    recommendedCard = cards[0];
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Your Cards">
          <Link
            to="/cards/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Card
          </Link>
        </PageHeader>
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Your Cards">
        <Link
          to="/cards/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Card
        </Link>
      </PageHeader>

      {!loading && recommendedCard && (
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg flex items-start space-x-4 relative">
          <button
            onClick={fetchCards}
            disabled={loading}
            className="absolute top-4 right-4 p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            title="Refresh Recommendation"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="p-3 bg-white/20 rounded-full shrink-0">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Smart Recommendation</h3>
            <p className="text-blue-100">
              For your next general purchase, consider using your <strong>{recommendedCard.card_name}</strong>. 
              {recommendedCard.milestone_amount && recommendedCard.totalSpent < recommendedCard.milestone_amount ? (
                <>
                  {' '}You're only <strong>{formatCurrency(recommendedCard.milestone_amount - recommendedCard.totalSpent)}</strong> away 
                  from hitting your milestone!
                </>
              ) : (
                <>
                  {' '}This is currently your top suggested card.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {cards.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400 mx-auto mt-1" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No cards yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Add your first credit card to start tracking milestones and spending.
            </p>
            <Link
              to="/cards/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Card
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <CardTile key={card.id} card={card} spent={card.totalSpent} />
          ))}
        </div>
      )}
    </div>
  );
}
