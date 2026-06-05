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
      <button
        key={key}
        type="button"
        className={`friends-contact ${isActive ? 'active' : ''}`}
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
    );
  };

  return (
    <AidaShell>
      <div className="friends-page">
        <aside className={`friends-panel ${mobileShowChat ? 'hidden-mobile' : ''}`}>
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

        <section className={`friends-chat ${!mobileShowChat && !activeConvId ? '' : mobileShowChat ? '' : 'hidden-mobile'}`}>
          {activeConvId && activeOther ? (
            <>
              <header className="friends-chat-header">
                <div className="friends-chat-header-user">
                  <button
                    type="button"
                    className="mr-1 text-slate-400 lg:hidden"
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
                  <button type="button" className="friends-chat-action-btn" title={t('friends.callSoon')}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button type="button" className="friends-chat-action-btn" title={t('friends.videoSoon')}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </header>

              <div className="friends-messages">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`friends-msg ${msg.isMine ? 'friends-msg-out' : 'friends-msg-in'}`}
                  >
                    {msg.content}
                    <span className="friends-msg-time">{formatTime(msg.createdAt, locale)}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="friends-input-bar" onSubmit={handleSend}>
                <span className="friends-input-icon" aria-hidden>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </span>
                <span className="friends-input-divider" />
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t('friends.messagePlaceholder')}
                  disabled={sending}
                />
                <button type="submit" className="friends-send-btn" disabled={!draft.trim() || sending}>
                  {t('friends.send')}
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
