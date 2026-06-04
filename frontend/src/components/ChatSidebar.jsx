import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ChatSidebar = ({ chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, isOpen, onClose }) => {
  const { subscription } = useAuth();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-surface-border bg-white transition-transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="border-b border-surface-border p-3 lg:hidden">
          <span className="font-bold text-brand">Beka AI</span>
        </div>
        <div className="p-3">
          <button type="button" onClick={onNewChat} className="btn-primary w-full">
            + Жаңа чат
          </button>
        </div>
        {subscription?.plan === 'free' && (
          <Link to="/pricing" className="mx-3 mb-2 block rounded-xl bg-brand-light px-3 py-2 text-center text-xs text-brand">
            Тариф: {subscription.planName}
            {subscription.dailyRemaining != null && ` · ${subscription.dailyRemaining} қалды`}
          </Link>
        )}
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase text-surface-subtext">Чат тарихы</p>
          {chats.length === 0 ? (
            <p className="px-2 text-center text-xs text-surface-subtext">Әзірге чат жоқ</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                className={`group mb-1 flex rounded-xl ${
                  activeChatId === chat._id ? 'bg-brand-light' : 'hover:bg-surface-muted'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectChat(chat._id)}
                  className="flex-1 truncate px-3 py-2 text-left text-sm text-surface-text"
                >
                  {chat.title || 'New Chat'}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteChat(chat._id)}
                  className="mr-2 hidden text-red-400 group-hover:block"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
