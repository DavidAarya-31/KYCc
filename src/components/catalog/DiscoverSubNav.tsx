import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/discover/explore', label: '🔍 Explore' },
  { to: '/discover/offers',  label: '🎁 Offers'  },
  { to: '/discover/guides',  label: '📚 Guides'  },
  { to: '/discover/tools',   label: '🛠️ Tools'   },
];

export function DiscoverSubNav() {
  return (
    <nav className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-none">
      {ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-blue-600 border-blue-600 text-white font-medium shadow-sm'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
