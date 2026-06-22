import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';

const CARD_NETWORKS = ['Visa', 'Mastercard', 'American Express', 'RuPay', 'Diners Club'];
const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export function NewCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    card_company: '',
    card_name: '',
    card_network: 'Visa',
    anniversary_month: 1,
    billing_date: 1,
    due_date: 1,
    annual_fee: 0,
    milestone_amount: 0,
    card_limit: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase.from('cards').insert({
        user_id: user.id,
        ...formData,
        annual_fee: formData.annual_fee * 100, // Convert to cents
        milestone_amount: formData.milestone_amount * 100, // Convert to cents
        card_limit: formData.card_limit ? formData.card_limit * 100 : null, // Convert to cents
      });

      if (error) throw error;
      
      navigate('/cards');
    } catch (error) {
      console.error('Error creating card:', error);
      alert('Error creating card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  return (
    <div>
      <PageHeader title="Add New Card">
        <button
          onClick={() => navigate('/cards')}
          className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cards
        </button>
      </PageHeader>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="card_company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Company
              </label>
              <input
                type="text"
                id="card_company"
                name="card_company"
                value={formData.card_company}
                onChange={handleInputChange}
                required
                placeholder="e.g., HDFC Bank, SBI, ICICI"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="card_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Name
              </label>
              <input
                type="text"
                id="card_name"
                name="card_name"
                value={formData.card_name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Regalia Gold, MoneyBack+"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="card_network" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Network
              </label>
              <select
                id="card_network"
                name="card_network"
                value={formData.card_network}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              >
                {CARD_NETWORKS.map(network => (
                  <option key={network} value={network}>{network}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="anniversary_month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Anniversary Month
              </label>
              <select
                id="anniversary_month"
                name="anniversary_month"
                value={formData.anniversary_month}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              >
                {MONTHS.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="billing_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Billing Date
              </label>
              <input
                type="number"
                id="billing_date"
                name="billing_date"
                value={formData.billing_date}
                onChange={handleInputChange}
                min="1"
                max="31"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="number"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                min="1"
                max="31"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="annual_fee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Annual Fee (₹)
              </label>
              <input
                type="number"
                id="annual_fee"
                name="annual_fee"
                value={formData.annual_fee}
                onChange={handleInputChange}
                min="0"
                step="1"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="milestone_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Milestone Amount (₹)
              </label>
              <input
                type="number"
                id="milestone_amount"
                name="milestone_amount"
                value={formData.milestone_amount}
                onChange={handleInputChange}
                min="0"
                step="1"
                required
                placeholder="e.g., 100000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="card_limit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Limit (₹)
              </label>
              <input
                type="number"
                id="card_limit"
                name="card_limit"
                value={formData.card_limit}
                onChange={handleInputChange}
                min="0"
                step="1"
                placeholder="e.g., 200000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/cards')}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Card
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
