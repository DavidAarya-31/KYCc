import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader, Sparkles, Send, Bot, RefreshCw } from 'lucide-react';
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
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

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

      // Calculate spending for each card
      const cardsWithSpending: CardWithSpending[] = [];
      
      for (const card of cardsData || []) {
        // Get anniversary cycle for this card
        const cycle = getAnniversaryCycle(card.anniversary_month);
        const totalSpent = await calculateTotalCardSpend(card.id, cycle);
        
        cardsWithSpending.push({
          ...card,
          totalSpent,
        });
      }

      setCards(cardsWithSpending);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || cards.length === 0) return;
    
    setChatLoading(true);
    setChatResponse('');
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-advisor', {
        body: {
          action: 'card-chat',
          prompt: chatInput,
          context: cards.map(c => ({
            name: c.card_name,
            company: c.card_company,
            network: c.card_network,
            milestone: c.milestone_amount != null ? c.milestone_amount / 100 : null,
            spent: c.totalSpent / 100
          }))
        }
      });
      
      if (error) {
        if (error.context && typeof error.context.json === 'function') {
          const errData = await error.context.json().catch(() => ({}));
          throw new Error(errData.error || error.message);
        } else {
          throw error;
        }
      }
      
      setChatResponse(data.text);
    } catch (err: any) {
      setChatResponse('Sorry, failed to get a recommendation: ' + err.message);
    } finally {
      setChatLoading(false);
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
        <div className="flex items-center space-x-4">
          <form onSubmit={handleCardChat} className="hidden md:flex space-x-2 w-80">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask which card to use..."
              className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={chatLoading}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
              title="Ask AI"
            >
              {chatLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
          <Link
            to="/cards/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Card
          </Link>
        </div>
      </PageHeader>

      {/* Mobile chat form */}
      <div className="md:hidden mb-6">
        <form onSubmit={handleCardChat} className="flex space-x-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask which card to use..."
            className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={chatLoading}
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || chatLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
          >
            {chatLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {chatResponse && (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 rounded-xl text-sm flex items-start shadow-sm">
          <Bot className="w-5 h-5 mt-0.5 mr-3 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="whitespace-pre-wrap flex-1">{chatResponse}</div>
          <button onClick={() => setChatResponse('')} className="ml-4 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">&times;</button>
        </div>
      )}

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
