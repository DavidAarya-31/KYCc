import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Bot, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/PageHeader';
import { getAnniversaryCycle } from '../../utils/cycles';
import { calculateTotalCardSpend } from '../../utils/cardSpending';
import { DiscoverSubNav } from '../../components/catalog/DiscoverSubNav';

const SECTIONS = [
  {
    to:      '/discover/guides/merchants',
    emoji:   '🏪',
    title:   'Merchant Tips',
    desc:    'Per-brand payment routes that earn maximum rewards — Ajio, Myntra, Zepto, Paytm, Vi and more.',
    color:   'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800',
  },
  {
    to:      '/discover/guides/rewards',
    emoji:   '🏷️',
    title:   'Rewards Guides',
    desc:    'MCC code reference, utility payment strategies, and paying your CC bill via debit card.',
    color:   'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
  },
  {
    to:      '/discover/guides/hotels',
    emoji:   '🏨',
    title:   'Hotel Programs',
    desc:    'Taj InnerCircle, ITC One, Marriott Bonvoy and other loyalty programs mapped to cards.',
    color:   'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800',
  },
  {
    to:      '/discover/guides/airlines',
    emoji:   '✈️',
    title:   'Airline Programs',
    desc:    'InterMiles, Air India Flying Returns, Vistara Club Vistara and transfer partner maps.',
    color:   'bg-sky-50 dark:bg-sky-900/10 border-sky-200 dark:border-sky-800',
  },
  {
    to:      '/discover/guides/lifestyle',
    emoji:   '💪',
    title:   'Lifestyle Brands',
    desc:    'FitPass Pro, Wellbi, EazyDiner and other perks bundled with premium cards.',
    color:   'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800',
  },
];

export function Guides() {
  const { user } = useAuth();
  const [cards, setCards] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserCards();
    }
  }, [user]);

  const fetchUserCards = async () => {
    try {
      const { data: cardsData } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user!.id);

      const cardsWithSpending = await Promise.all(
        (cardsData || []).map(async (card) => {
          const cycle = getAnniversaryCycle(card.anniversary_month);
          const totalSpent = await calculateTotalCardSpend(card.id, cycle);
          return { ...card, totalSpent };
        })
      );
      setCards(cardsWithSpending);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCardChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

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

  return (
    <div className="space-y-6 pb-12">
      <DiscoverSubNav />
      <PageHeader title="Guides">
        <form onSubmit={handleCardChat} className="hidden md:flex space-x-2 w-80">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask which card to use..."
            className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
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
      </PageHeader>

      {/* Mobile chat form */}
      <div className="md:hidden mb-6">
        <form onSubmit={handleCardChat} className="flex space-x-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask which card to use..."
            className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
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
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 rounded-xl text-sm flex items-start shadow-sm animate-fadeIn">
          <Bot className="w-5 h-5 mt-0.5 mr-3 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="whitespace-pre-wrap flex-1 leading-relaxed">{chatResponse}</div>
          <button onClick={() => setChatResponse('')} className="ml-4 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-bold">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map(s => (
          <Link key={s.to} to={s.to}
            className={`rounded-xl border p-5 hover:shadow-sm transition-shadow ${s.color}`}>
            <span className="text-2xl">{s.emoji}</span>
            <h2 className="font-semibold text-gray-900 dark:text-white mt-2 mb-1">{s.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
