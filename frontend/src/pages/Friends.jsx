import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { friendsAPI } from '../services/api';
import AidaShell from '../components/dashboard/AidaShell';
import ProfileAvatar from '../components/ProfileAvatar';

const formatTime = (dateStr, locale) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const Friends = () => {
  const { user } = useAuth();
  const { t, locale } = usePreferences();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeOther, setActiveOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef(null);
  const searchTimerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = useCallback(async () => {
    try {
      const res = await friendsAPI.getConversations();
      setConversations(res.data || []);
    } catch {
      // ignore
    }
  }, []);

  const loadMessages = useCallback(async (convId) => {
    try {
      const res = await friendsAPI.getConversation(convId);
      setMessages(res.data?.messages || []);
      setActiveOther(res.data?.otherUser || null);
      setTimeout(scrollToBottom, 50);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadConversations();
      setLoading(false);
    };
    init();
  }, [loadConversations]);

  useEffect(() => {
    if (!activeConvId) return undefined;
    loadMessages(activeConvId);
    const interval = setInterval(() => loadMessages(activeConvId), 5000);
    return () => clearInterval(interval);
  }, [activeConvId, loadMessages]);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (search.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return undefined;
    }

    setSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await friendsAPI.searchUsers(search.trim());
        setSearchResults(res.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  const openConversation = async (userId, userInfo) => {
    try {
      const res = await friendsAPI.startConversation(userId);
      const conv = res.data;
      setActiveConvId(conv._id);
      setActiveOther(conv.otherUser || userInfo);
      setMobileShowChat(true);
      await loadConversations();
      await loadMessages(conv._id);
    } catch (err) {
      alert(err.message || t('friends.error'));
    }
  };

  const selectConversation = async (conv) => {
    setActiveConvId(conv._id);
    setActiveOther(conv.otherUser);
    setMobileShowChat(true);
    await loadMessages(conv._id);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeConvId || sending) return;

    setSending(true);
    setDraft('');
    try {
      const res = await friendsAPI.sendMessage(activeConvId, text);
      setMessages((prev) => [...prev, res.data]);
      await loadConversations();
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      setDraft(text);
      alert(err.message || t('friends.sendError'));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!activeConvId || !window.confirm(t('friends.confirmDeleteMessage'))) return;
    try {
      await friendsAPI.deleteMessage(activeConvId, messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      await loadConversations();
    } catch (err) {
      alert(err.message || t('friends.error'));
    }
  };

  const handleDeleteConversation = async (convId) => {
    if (!window.confirm(t('friends.confirmDeleteChat'))) return;
    try {
      await friendsAPI.deleteConversation(convId);
      if (activeConvId === convId) {
        setActiveConvId(null);
        setActiveOther(null);
        setMessages([]);
        setMobileShowChat(false);
      }
      await loadConversations();
    } catch (err) {
      alert(err.message || t('friends.error'));
    }
  };

  const showSearch = search.trim().length >= 2;
  const listItems = showSearch ? searchResults : conversations;

  const renderContact = (item, isSearch) => {
    const person = isSearch ? item : item.otherUser;
    const key = isSearch ? person._id : item._id;
    const isActive = !isSearch && activeConvId === item._id;
    const sub = isSearch
      ? t('friends.registeredUser')
      : item.lastMessagePreview || t('friends.noMessages');

    return (
      <div key={key} className={`friends-contact-row ${isActive ? 'active' : ''}`}>
        <button
          type="button"
          className="friends-contact"
          onClick={() => (isSearch ? openConversation(person._id, person) : selectConversation(item))}
        >
          <div className="friends-contact-avatar-wrap">
            <ProfileAvatar name={person.name} avatarUrl={person.avatarUrl} size="sm" />
            <span className={`friends-status-dot ${isSearch ? 'member' : 'online'}`} />
          </div>
          <div className="friends-contact-info">
            <span className="friends-contact-name">{person.name}</span>
            <span className="friends-contact-sub">{sub}</span>
          </div>
        </button>
        {!isSearch && (
          <button
            type="button"
            className="friends-contact-delete"
            onClick={() => handleDeleteConversation(item._id)}
            title={t('friends.deleteChat')}
            aria-label={t('friends.deleteChat')}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    );
  };

  return (
    <AidaShell>
      <div className="friends-page">
        <aside className={`friends-panel ${mobileShowChat ? 'friends-hide-mobile' : ''}`}>
          <div className="friends-panel-header">
            <h2 className="friends-panel-title">{t('friends.title')}</h2>
          </div>

          <div className="friends-search-wrap">
            <svg className="friends-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              className="friends-search"
              placeholder={t('friends.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="friends-list">
            {showSearch && (
              <p className="friends-list-section">
                {searching ? t('friends.searching') : t('friends.searchResults')}
              </p>
            )}
            {!showSearch && conversations.length > 0 && (
              <p className="friends-list-section">{t('friends.recentChats')}</p>
            )}

            {loading && !showSearch ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">{t('friends.loading')}</p>
            ) : listItems.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                {showSearch ? t('friends.noUsers') : t('friends.emptyList')}
              </p>
            ) : (
              listItems.map((item) => renderContact(item, showSearch))
            )}
          </div>
        </aside>

        <section
          className={`friends-chat ${
            mobileShowChat || activeConvId ? '' : 'friends-hide-mobile'
          }`}
        >
          {activeConvId && activeOther ? (
            <>
              <header className="friends-chat-header">
                <div className="friends-chat-header-user">
                  <button
                    type="button"
                    className="friends-back-btn"
                    onClick={() => setMobileShowChat(false)}
                    aria-label={t('friends.back')}
                  >
                    ←
                  </button>
                  <ProfileAvatar name={activeOther.name} avatarUrl={activeOther.avatarUrl} size="sm" />
                  <div className="min-w-0">
                    <p className="friends-chat-header-name">{activeOther.name}</p>
                    <p className="friends-chat-header-status">{t('friends.online')}</p>
                  </div>
                </div>
                <div className="friends-chat-actions">
                  <button
                    type="button"
                    className="friends-chat-action-btn friends-chat-action-btn--danger"
                    onClick={() => handleDeleteConversation(activeConvId)}
                    title={t('friends.deleteChat')}
                    aria-label={t('friends.deleteChat')}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </header>

              <div className="friends-messages">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`friends-msg-wrap ${msg.isMine ? 'friends-msg-wrap-out' : 'friends-msg-wrap-in'}`}
                  >
                    <div className={`friends-msg ${msg.isMine ? 'friends-msg-out' : 'friends-msg-in'}`}>
                      {msg.content}
                      <span className="friends-msg-time">{formatTime(msg.createdAt, locale)}</span>
                    </div>
                    <button
                      type="button"
                      className="friends-msg-delete"
                      onClick={() => handleDeleteMessage(msg._id)}
                      title={t('friends.deleteMessage')}
                      aria-label={t('friends.deleteMessage')}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="friends-input-bar" onSubmit={handleSend}>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t('friends.messagePlaceholder')}
                  disabled={sending}
                />
                <button type="submit" className="friends-send-btn" disabled={!draft.trim() || sending}>
                  <span className="friends-send-label">{t('friends.send')}</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="friends-empty">
              <p className="friends-empty-title">{t('friends.pickChat')}</p>
              <p className="text-sm">{t('friends.pickChatHint')}</p>
              {user?.name && (
                <p className="mt-4 text-xs text-slate-500">
                  {t('friends.youAre')}: <span className="text-slate-300">{user.name}</span>
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </AidaShell>
  );
};

export default Friends;
