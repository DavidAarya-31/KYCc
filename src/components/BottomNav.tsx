import { NavLink, useLocation } from 'react-router-dom';
import { Home, CreditCard, TrendingUp, User, Compass } from 'lucide-react';

const TABS = [
  {
    label:   'Home',
    to:      '/',
    exact:   true,
    icon:    Home,
  },
  {
    label:   'Cards',
    to:      '/cards',
    exact:   false,
    icon:    CreditCard,
  },
  {
    label:   'Finances',
    to:      '/finances',
    exact:   false,
    icon:    TrendingUp,
  },
  {
    label:   'Advisor',
    to:      '/advisor',
    exact:   false,
    icon:    User,
  },
  {
    label:   'Discover',
    to:      '/discover/explore',
    exact:   false,
    matchPrefix: '/discover',
    icon:    Compass,
  },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        border-t border-gray-200 dark:border-gray-800
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
        flex items-stretch
        md:hidden
      "
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(tab => {
        const isActive = tab.matchPrefix
          ? pathname.startsWith(tab.matchPrefix)
          : tab.exact
            ? pathname === tab.to
            : pathname.startsWith(tab.to);

        const IconComponent = tab.icon;

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="
              flex-grow flex-shrink-0 flex-1 flex flex-col items-center justify-center
              gap-1 py-2 min-h-[56px] relative
              transition-colors active:bg-gray-100 dark:active:bg-gray-800
            "
          >
            <IconComponent
              className={`w-5 h-5 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 fill-blue-50 dark:fill-blue-900/20'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            />

            <span className={`text-[10px] font-medium leading-none ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              {tab.label}
            </span>

            {isActive && (
              <span className="absolute top-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
