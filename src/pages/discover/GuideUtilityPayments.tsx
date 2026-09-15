import { Link } from 'react-router-dom';

export function GuideUtilityPayments() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">
      <nav className="text-sm text-gray-500 dark:text-gray-400">
        <Link to="/discover/guides/rewards" className="hover:text-gray-900 dark:hover:text-white">Rewards</Link>
        <span> / </span><span className="text-gray-900 dark:text-white">Utility Payments</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Utility Payments Guide</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Utility bills (electricity, gas, water, telecom) fall under MCC <code className="px-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">4900</code> and <code className="px-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">4814</code>.
          Many premium cards cap or exclude rewards on utility transactions — always check the T&C first.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Key rules</p>
          <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
            <li>Always do a ₹1 test payment first to verify the OTP merchant name</li>
            <li>The MCC shown on the OTP screen is the actual MCC that will be charged</li>
            <li>State-run electricity boards may not code under MCC 4900 on all issuers</li>
          </ul>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Detailed per-card utility earning rates will appear here. Check back — this guide is updated weekly.
        </p>
      </div>
      <Link to="/discover/guides/merchants/paytm"
        className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
        → Paytm merchant tip (MCC 4900 payment routes)
      </Link>
    </div>
  );
}
