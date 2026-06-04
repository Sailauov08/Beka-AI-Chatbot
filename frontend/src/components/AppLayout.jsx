import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Басты бет', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/pricing', label: 'Төлемдер', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { to: '/settings', label: 'Параметрлер', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

const AppLayout = ({ children, secondarySidebar, showMainNav = true }) => {
  const location = useLocation();
  const { user, subscription } = useAuth();

  return (
    <div className="page-bg flex h-screen overflow-hidden">
      {showMainNav && (
        <aside className="hidden w-52 shrink-0 flex-col border-r border-surface-border bg-white md:flex">
          <div className="flex items-center gap-2 border-b border-surface-border px-4 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-sm font-bold text-white">
              B
            </div>
            <span className="text-lg font-bold text-brand">Beka AI</span>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {navItems.map(({ to, label, icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-brand-light text-brand'
                      : 'text-surface-subtext hover:bg-surface-muted hover:text-surface-text'
                  }`}
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-surface-border p-3">
            <p className="truncate text-sm font-medium text-surface-text">{user?.name}</p>
            <p className="text-xs text-brand">{subscription?.planName || 'Тегін'}</p>
          </div>
        </aside>
      )}

      {secondarySidebar}

      <div className="flex min-w-0 flex-1 flex-col bg-surface-muted">{children}</div>
    </div>
  );
};

export default AppLayout;
