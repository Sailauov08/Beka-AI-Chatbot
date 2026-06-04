import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import ProfileAvatar from '../ProfileAvatar';

const IconGrid = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const IconChat = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const IconTariffs = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const IconCalendar = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconSettings = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconUser = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const navMain = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: IconGrid, to: '/' },
  { id: 'chat', labelKey: 'nav.chat', icon: IconChat, to: '/' },
  { id: 'tariffs', labelKey: 'nav.tariffs', icon: IconTariffs, to: '/pricing' },
  { id: 'schedule', labelKey: 'nav.schedule', icon: IconCalendar, to: '/schedule' },
];

const navBottom = [
  { id: 'settings', labelKey: 'nav.settings', icon: IconSettings, to: '/settings' },
  { id: 'profile', labelKey: 'nav.profile', icon: IconUser, to: '/profile' },
];

const AidaSidebar = ({
  minimal = false,
  activeSection,
  onSectionChange,
  chats = [],
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  mobileOpen,
  onClose,
}) => {
  const { user, subscription } = useAuth();
  const { t, planName } = usePreferences();
  const location = useLocation();
  const onSettings = location.pathname === '/settings';
  const onSchedule = location.pathname === '/schedule';
  const onPricing = location.pathname === '/pricing';
  const onProfile = location.pathname === '/profile';

  const navClass = (item) => {
    if (item.to === '/profile') {
      return onProfile ? 'aida-nav-item active-settings' : 'aida-nav-item';
    }
    if (item.to === '/settings') {
      return onSettings && item.id === 'settings' ? 'aida-nav-item active-settings' : 'aida-nav-item';
    }
    if (item.to === '/schedule') {
      return onSchedule ? 'aida-nav-item active-settings' : 'aida-nav-item';
    }
    if (item.to === '/pricing') {
      return onPricing ? 'aida-nav-item active-settings' : 'aida-nav-item';
    }
    if (minimal) return 'aida-nav-item';
    return location.pathname === '/' && activeSection === item.id ? 'aida-nav-item active' : 'aida-nav-item';
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const className = navClass(item);

    if (minimal || item.to === '/settings' || item.to === '/schedule' || item.to === '/pricing' || item.to === '/profile') {
      return (
        <Link key={item.id} to={item.to} onClick={onClose} className={className}>
          <Icon />
                {t(item.labelKey)}
        </Link>
      );
    }

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          onSectionChange?.(item.id);
          if (item.id === 'dashboard') onNewChat?.();
          onClose?.();
        }}
        className={`${className} w-full`}
      >
        <Icon />
                {t(item.labelKey)}
      </button>
    );
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`aida-sidebar fixed inset-y-0 left-0 z-50 flex w-56 flex-col lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform`}
      >
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-white">BEKA AI</h1>
          <p className="mt-0.5 text-[10px] tracking-wide text-slate-400">{t('nav.tagline')}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-1">
          {navMain.map(renderNavItem)}

          {!minimal && activeSection === 'chat' && chats.length > 0 && (
            <div className="mt-4 px-2">
              <button
                type="button"
                onClick={onNewChat}
                className="mb-2 w-full rounded-md bg-blue-600/30 py-2 text-xs font-medium text-blue-200 hover:bg-blue-600/45"
              >
                {t('nav.newChat')}
              </button>
              <div className="aida-chat-list">
                {chats.map((chat) => (
                  <div key={chat._id} className="group flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectChat?.(chat._id);
                        onClose?.();
                      }}
                      className={`aida-chat-item flex-1 ${activeChatId === chat._id ? 'active' : ''}`}
                    >
                      {chat.title || 'Чат'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteChat?.(chat._id)}
                      className="mr-1 hidden text-slate-500 group-hover:block hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="my-6" />
          {navBottom.map(renderNavItem)}
        </nav>

        <div className="border-t border-white/5 p-4">
          <Link
            to="/pricing"
            onClick={onClose}
            className="mb-3 block text-center text-[10px] text-slate-500 hover:text-blue-300"
          >
            {planName(subscription?.plan || 'free')} · {subscription?.dailyRemaining ?? '∞'} {t('nav.msgsLeft')}
          </Link>
          <Link to="/profile" onClick={onClose} className="flex justify-center">
            <ProfileAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="md" />
          </Link>
        </div>
      </aside>
    </>
  );
};

export default AidaSidebar;
