import React, { useState, useRef, useEffect } from 'react';
import { askFinancialAdvisor } from '../utils/ai';
import { useBudget } from '../contexts/BudgetContext';
import { Send, User, Bot, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export function Advisor() {
  const { transactions, budgets, categories } = useBudget();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', sender: 'bot', text: 'Hi! I am your AI Financial Advisor. Ask me anything about your spending, budgets, or milestones.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Serialize minimal context
      const contextData = {
        transactions: transactions.map(t => ({
          date: t.date,
          amount: t.amount,
          type: t.type,
          category: categories.find(c => c.id === t.category_id)?.name || 'Other',
          description: t.description
        })),
        budgets: budgets.map(b => ({
          name: b.name,
          amount: b.total_amount,
          period: b.period_type
        }))
      };

      const reply = await askFinancialAdvisor(userMessage, contextData);
      
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: reply }]);
    } catch (err: any) {
      setError(err.message || 'Failed to get a response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors relative">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none"></div>

      <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          AI Financial Advisor
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth z-10">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end max-w-[85%] sm:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mb-1 ${msg.sender === 'user' ? 'bg-indigo-600 ml-3 shadow-md' : 'bg-gradient-to-br from-teal-400 to-emerald-600 mr-3 shadow-md'}`}>
                {msg.sender === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`px-5 py-3.5 rounded-3xl shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'} whitespace-pre-wrap leading-relaxed`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-end flex-row max-w-[85%] sm:max-w-[75%]">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mb-1 bg-gradient-to-br from-teal-400 to-emerald-600 mr-3 shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="px-5 py-4 rounded-3xl shadow-sm bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-bl-sm flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-gray-300 dark:bg-slate-600 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-gray-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2.5 h-2.5 bg-gray-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center text-red-500 justify-center p-2 bg-red-50 dark:bg-red-900/30 rounded">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 z-10 backdrop-blur-md">
        <div className="flex space-x-3 items-center relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your finances..."
            className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm text-gray-900 dark:text-gray-100 rounded-full px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-base placeholder-gray-400 dark:placeholder-gray-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 bg-blue-600 hover:bg-indigo-600 text-white p-2.5 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-0 disabled:scale-75 disabled:pointer-events-none transform shadow-md"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
