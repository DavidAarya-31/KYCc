import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHotelPrograms } from '../../lib/catalog';
import type { CatalogHotelProgram } from '../../types/catalog';

export function GuideHotels() {
  const [programs, setPrograms] = useState<CatalogHotelProgram[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { getHotelPrograms().then(setPrograms).finally(() => setLoading(false)); }, []);

  return (
    <div className="space-y-5 pb-12">
      <nav className="text-sm text-gray-500 dark:text-gray-400">
        <Link to="/discover/guides" className="hover:text-gray-900 dark:hover:text-white">Guides</Link>
        <span> / </span><span className="text-gray-900 dark:text-white">Hotel Programs</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hotel Loyalty Programs</h1>
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>
      ) : programs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">Hotel programs coming soon.</p>
      ) : (
        <div className="space-y-3">
          {programs.map(p => (
            <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-gray-900 dark:text-white">{p.name}</h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">{p.brand}</span>
              </div>
              {p.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{p.description}</p>}
              {p.benefits.length > 0 && (
                <ul className="space-y-1">
                  {p.benefits.map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-blue-400 shrink-0">★</span>{b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
