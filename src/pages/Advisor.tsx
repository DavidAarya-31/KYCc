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
    <div className="max-w-4xl mx-auto flex flex-col h-[80vh] bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <Bot className="w-6 h-6 mr-2 text-blue-600" />
          AI Financial Advisor
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-600 ml-3' : 'bg-green-600 mr-3'}`}>
                {msg.sender === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'} whitespace-pre-wrap`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start flex-row max-w-[80%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-green-600 mr-3">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-tl-none flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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

      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-b-xl flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your finances..."
          className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
