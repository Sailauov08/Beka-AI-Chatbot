import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  isOpen,
  onClose,
}) => {
  const { user, logout, subscription } = useAuth();
  const isPremium = subscription?.isPremium;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[280px] flex-col border-r border-zinc-800/80 bg-surface-dark/95 backdrop-blur-xl transition-transform duration-300 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {!isPremium && (
          <Link
            to="/pricing"
            className="mx-3 mt-3 block rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2.5 text-center text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20"
          >
            ⭐ Premium — шексіз чат
            {subscription?.dailyRemaining != null && (
              <span className="mt-1 block text-zinc-500">
                Бүгін: {subscription.dailyRemaining} қалды
              </span>
            )}
          </Link>
        )}

        {isPremium && (
          <div className="mx-3 mt-3 rounded-xl bg-gradient-brand/20 px-3 py-2 text-center text-xs font-semibold text-emerald-300">
            ✓ Premium белсенді
          </div>
        )}

        <div className="border-b border-zinc-800/80 p-4">
          <div className="mb-4 flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-sm font-bold">
              B
            </div>
            <span className="gradient-text text-lg font-bold">Beka AI</span>
          </div>
          <button
            type="button"
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Жаңа чат
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Чат тарихы
          </p>
          {chats.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-zinc-600">
              Әзірге чат жоқ
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                className={`group mb-1 flex items-center rounded-xl transition ${
                  activeChatId === chat._id
                    ? 'bg-zinc-800/90 ring-1 ring-cyan-500/30'
                    : 'hover:bg-zinc-800/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectChat(chat._id)}
                  className="flex flex-1 items-center gap-2 truncate px-3 py-2.5 text-left text-sm text-zinc-300"
                  title={chat.title}
                >
                  <svg className="h-4 w-4 shrink-0 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {chat.title || 'New Chat'}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat._id);
                  }}
                  className="mr-2 hidden rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/20 hover:text-red-400 group-hover:block"
                  title="Жою"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-zinc-800/80 p-3">
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-zinc-800/40 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-user text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-200">{user?.name}</p>
              <p className="truncate text-[11px] text-zinc-500">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700/80 py-2.5 text-sm text-zinc-400 transition hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Шығу
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
