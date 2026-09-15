import { Link } from 'react-router-dom';

const SUB_GUIDES = [
  { to: '/discover/guides/rewards/mcc-guide',         emoji: '🏷️', title: 'MCC Code Reference', desc: 'Look up any 4-digit Merchant Category Code and find which cards earn the most on it.' },
  { to: '/discover/guides/rewards/utility-payments',  emoji: '⚡', title: 'Utility Payments',    desc: 'Which cards earn on electricity, gas, water, and telecom — and which ones cap or exclude utilities.' },
  { to: '/discover/guides/rewards/cc-bill-via-dc',    emoji: '💳', title: 'CC Bill via Debit Card', desc: 'How to pay your credit card bill through a debit card and earn cashback on the payment itself.' },
];

export function GuideRewards() {
  return (
    <div className="space-y-5 pb-12">
      <nav className="text-sm text-gray-500 dark:text-gray-400">
        <Link to="/discover/guides" className="hover:text-gray-900 dark:hover:text-white">Guides</Link>
        <span> / </span><span className="text-gray-900 dark:text-white">Rewards</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rewards Guides</h1>
      <div className="space-y-3">
        {SUB_GUIDES.map(g => (
          <Link key={g.to} to={g.to}
            className="flex gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <span className="text-2xl shrink-0">{g.emoji}</span>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{g.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{g.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
