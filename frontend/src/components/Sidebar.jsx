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
  const { user, logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col bg-surface-light transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 p-3">
          <button
            type="button"
            onClick={onNewChat}
            className="flex flex-1 items-center gap-2 rounded-lg border border-gray-600 px-3 py-2.5 text-sm text-gray-200 transition hover:bg-gray-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Жаңа чат
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-1">
          {chats.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-gray-500">
              Чат тарихы бос
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                className={`group mb-0.5 flex items-center rounded-lg ${
                  activeChatId === chat._id ? 'bg-gray-700' : 'hover:bg-gray-700/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectChat(chat._id)}
                  className="flex-1 truncate px-3 py-2.5 text-left text-sm text-gray-300"
                  title={chat.title}
                >
                  {chat.title || 'New Chat'}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat._id);
                  }}
                  className="mr-2 hidden rounded p-1 text-gray-500 hover:bg-gray-600 hover:text-red-400 group-hover:block"
                  title="Жою"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-700 p-3">
          <div className="mb-2 truncate px-2 text-xs text-gray-500">{user?.email}</div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-gray-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Шығу (Logout)
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
