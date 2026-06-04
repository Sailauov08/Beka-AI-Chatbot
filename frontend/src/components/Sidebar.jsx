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
  const { subscription } = useAuth();
  const plan = subscription?.planName || 'Тегін';

  const chatList = (
    <>
      <button type="button" onClick={onNewChat} className="btn-primary mx-3 mb-3 w-[calc(100%-1.5rem)]">
        + Жаңа чат
      </button>

      {subscription?.plan === 'free' && (
        <Link
          to="/pricing"
          className="mx-3 mb-3 block rounded-xl bg-brand-light px-3 py-2 text-center text-xs font-medium text-brand"
        >
          Жоспарды жаңарту
          {subscription?.dailyRemaining != null && (
            <span className="mt-1 block text-surface-subtext">
              {subscription.dailyRemaining} хабарлама қалды
            </span>
          )}
        </Link>
      )}

      <div className="flex-1 overflow-y-auto px-2">
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase text-surface-subtext">Чаттар</p>
        {chats.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-surface-subtext">Чат жоқ</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat._id}
              className={`group mb-1 flex rounded-xl ${
                activeChatId === chat._id ? 'bg-brand-light' : 'hover:bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectChat(chat._id)}
                className="flex flex-1 truncate px-3 py-2 text-left text-sm text-surface-text"
              >
                {chat.title || 'New Chat'}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat._id);
                }}
                className="mr-1 hidden p-1 text-red-400 group-hover:block"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-surface-border bg-surface-sidebar transition-transform md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {chatList}
      </aside>
      {/* Desktop: chat list lives in main column next to AppLayout nav - handled by parent */}
    </>
  );
};

export const ChatSidebarPanel = Sidebar;
export default Sidebar;
