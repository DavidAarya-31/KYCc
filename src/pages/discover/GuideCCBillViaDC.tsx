import { Link } from 'react-router-dom';

export function GuideCCBillViaDC() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">
      <nav className="text-sm text-gray-500 dark:text-gray-400">
        <Link to="/discover/guides/rewards" className="hover:text-gray-900 dark:hover:text-white">Rewards</Link>
        <span> / </span><span className="text-gray-900 dark:text-white">CC Bill via Debit Card</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pay CC Bill via Debit Card</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Certain wallets and payment apps let you pay a credit card bill using a debit card.
          If the debit card earns cashback on wallet loads or bill payments, you effectively earn on your CC bill — a spend category that normally earns nothing.
        </p>
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">How it works</p>
          <ol className="text-sm text-green-800 dark:text-green-200 space-y-1 list-decimal list-inside">
            <li>Load your wallet using a cashback debit card</li>
            <li>Pay your credit card bill from the wallet balance</li>
            <li>Earn cashback on the wallet load transaction</li>
          </ol>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Specific payment routes and verified debit cards will appear here. Updated weekly.
        </p>
      </div>
    </div>
  );
}
