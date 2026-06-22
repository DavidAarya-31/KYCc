import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { ArrowLeft, Save } from 'lucide-react';

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

export function EditCard() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && id) {
      fetchCard();
    }
    // eslint-disable-next-line
  }, [user, id]);

  const fetchCard = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      if (!data) {
        setError('Card not found');
        return;
      }
      setFormData({
        card_company: data.card_company,
        card_name: data.card_name,
        card_network: data.card_network,
        anniversary_month: data.anniversary_month,
        billing_date: data.billing_date,
        due_date: data.due_date,
        annual_fee: data.annual_fee / 100,
        milestone_amount: data.milestone_amount / 100,
        card_limit: data.card_limit ? data.card_limit / 100 : 0,
      });
    } catch {
      setError('Error fetching card.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('cards').update({
        card_company: formData.card_company,
        card_name: formData.card_name,
        card_network: formData.card_network,
        anniversary_month: formData.anniversary_month,
        billing_date: formData.billing_date,
        due_date: formData.due_date,
        annual_fee: formData.annual_fee * 100,
        milestone_amount: formData.milestone_amount * 100,
        card_limit: formData.card_limit ? formData.card_limit * 100 : null,
      }).eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      navigate(`/cards/${id}`);
    } catch {
      setError('Error saving card.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{error}</h2>
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
      <PageHeader title="Edit Card">
        <button
          onClick={() => navigate(`/cards/${id}`)}
          className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Card
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/cards/${id}`)}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
