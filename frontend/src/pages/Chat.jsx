import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AidaShell from '../components/dashboard/AidaShell';
import AidaHero from '../components/dashboard/AidaHero';
import AidaWidgets from '../components/dashboard/AidaWidgets';
import AidaChatInput from '../components/dashboard/AidaChatInput';
import ChatMessage from '../components/ChatMessage';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { chatAPI } from '../services/api';

const DRAFT_CHAT_KEY = '__draft__';

const chatKey = (id) => id || DRAFT_CHAT_KEY;

const Chat = () => {
  const { subscription } = useAuth();
  const { t, prefs } = usePreferences();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streamingIds, setStreamingIds] = useState(() => new Set());
  const [activeSection, setActiveSection] = useState('dashboard');
  const [error, setError] = useState('');
  const [streamStatus, setStreamStatus] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesCacheRef = useRef({});
  const abortControllersRef = useRef(new Map());
  const activeChatIdRef = useRef(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const isActiveChatStreaming = streamingIds.has(chatKey(activeChatId));

  const setStreamingForKey = (key, streaming) => {
    setStreamingIds((prev) => {
      const next = new Set(prev);
      if (streaming) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const updateMessagesForKey = useCallback((key, updater) => {
    const current = messagesCacheRef.current[key] || [];
    const next = typeof updater === 'function' ? updater([...current]) : updater;
    messagesCacheRef.current[key] = next;
    if (chatKey(activeChatIdRef.current) === key) {
      setMessages(next);
    }
    return next;
  }, []);

  const migrateDraftToChat = useCallback((newChatId) => {
    if (messagesCacheRef.current[DRAFT_CHAT_KEY]) {
      messagesCacheRef.current[newChatId] = messagesCacheRef.current[DRAFT_CHAT_KEY];
      delete messagesCacheRef.current[DRAFT_CHAT_KEY];
    }
    const draftAbort = abortControllersRef.current.get(DRAFT_CHAT_KEY);
    if (draftAbort) {
      abortControllersRef.current.delete(DRAFT_CHAT_KEY);
      abortControllersRef.current.set(newChatId, draftAbort);
    }
    setStreamingIds((prev) => {
      if (!prev.has(DRAFT_CHAT_KEY)) return prev;
      const next = new Set(prev);
      next.delete(DRAFT_CHAT_KEY);
      next.add(newChatId);
      return next;
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingIds]);

  const loadHistory = useCallback(async () => {
    try {
      const response = await chatAPI.getHistory();
      setChats(response.data || []);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const loadChat = async (id) => {
    try {
      setActiveChatId(id);
      setActiveSection('chat');
      setError('');

      if (messagesCacheRef.current[id]) {
        setMessages(messagesCacheRef.current[id]);
        return;
      }

      const response = await chatAPI.getChat(id);
      const loaded = response.data.messages || [];
      messagesCacheRef.current[id] = loaded;
      setMessages(loaded);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages(messagesCacheRef.current[DRAFT_CHAT_KEY] || []);
    setError('');
    setActiveSection('dashboard');
  };

  const handleDeleteChat = async (id) => {
    try {
      await chatAPI.deleteChat(id);
      delete messagesCacheRef.current[id];
      abortControllersRef.current.get(id)?.abort();
      abortControllersRef.current.delete(id);
      setStreamingForKey(id, false);
      setChats((prev) => prev.filter((c) => c._id !== id));
      if (activeChatId === id) handleNewChat();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStop = () => {
    const key = chatKey(activeChatId);
    abortControllersRef.current.get(key)?.abort();
  };

  const finishStream = useCallback(
    async (key, removeEmptyAssistant = false) => {
      setStreamStatus(null);
      setStreamingForKey(key, false);
      abortControllersRef.current.delete(key);
      if (removeEmptyAssistant) {
        updateMessagesForKey(key, (prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && !last.content?.trim()) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      }
      await loadHistory();
    },
    [loadHistory, updateMessagesForKey]
  );

  const handleSend = async ({ message, image }) => {
    const key = chatKey(activeChatId);
    if (streamingIds.has(key)) return;

    setError('');
    setStreamStatus('thinking');
    setActiveSection('chat');
    setStreamingForKey(key, true);

    const imagePreviewUrl = image ? URL.createObjectURL(image) : null;
    const userMessage = { role: 'user', content: message, imageUrl: imagePreviewUrl };
    const assistantPlaceholder = { role: 'assistant', content: '' };

    updateMessagesForKey(key, (prev) => [...prev, userMessage, assistantPlaceholder]);

    const controller = new AbortController();
    abortControllersRef.current.set(key, controller);

    let streamChatId = activeChatId;
    let streamFinished = false;
    const finishOnce = async (finishKey) => {
      if (streamFinished) return;
      streamFinished = true;
      await finishStream(finishKey);
    };

    const streamTimeout = setTimeout(() => {
      if (!streamFinished) {
        controller.abort();
        setError(t('chat.timeout'));
      }
    }, 120000);

    try {
      const result = await chatAPI.sendMessageStream({
        message,
        chatId: activeChatId,
        image,
        language: prefs.language,
        signal: controller.signal,
        onChatId: (id) => {
          streamChatId = id;
          if (!activeChatId) {
            migrateDraftToChat(id);
            setActiveChatId(id);
          }
        },
        onStatus: (status) => {
          setStreamStatus(status);
        },
        onChunk: (chunk) => {
          setStreamStatus('generating');
          const targetKey = chatKey(streamChatId || activeChatIdRef.current);
          updateMessagesForKey(targetKey, (prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (updated[lastIndex]?.role === 'assistant') {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: updated[lastIndex].content + chunk,
              };
            }
            return updated;
          });
        },
        onDone: async (id) => {
          await finishOnce(chatKey(id || streamChatId || activeChatIdRef.current));
        },
        onError: (msg) => {
          setError(msg);
          finishOnce(chatKey(streamChatId || activeChatIdRef.current || key));
        },
        onAborted: () => {
          finishOnce(chatKey(streamChatId || activeChatIdRef.current || key));
        },
      });

      if (result?.gotError) {
        clearTimeout(streamTimeout);
        return;
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        updateMessagesForKey(key, (prev) => {
          if (prev.length >= 2) return prev.slice(0, -2);
          return prev;
        });
      }
      await finishOnce(chatKey(streamChatId || activeChatIdRef.current || key));
    } finally {
      clearTimeout(streamTimeout);
    }
  };

  const showHero = messages.length === 0 && !isActiveChatStreaming;

  return (
    <AidaShell
      chatSidebarProps={{
        activeSection,
        onSectionChange: setActiveSection,
        chats,
        activeChatId,
        streamingChatIds: streamingIds,
        onNewChat: handleNewChat,
        onSelectChat: loadChat,
        onDeleteChat: handleDeleteChat,
      }}
    >
      <div className="relative flex min-h-0 flex-1 flex-col h-full">
        <div className="flex min-h-0 flex-1">
          <div className="relative flex min-w-0 flex-1 flex-col">
            {showHero && <AidaHero />}
            {showHero && <div className="aida-orb">AI</div>}

            <div
              className={`relative z-10 flex min-h-0 flex-1 flex-col ${
                showHero ? 'justify-end' : ''
              }`}
            >
              {!showHero && (
                <div className="flex-1 overflow-y-auto pt-14 pb-4">
                  {messages.map((msg, index) => (
                    <ChatMessage
                      key={index}
                      message={msg}
                      theme="aida"
                      isStreaming={
                        isActiveChatStreaming &&
                        index === messages.length - 1 &&
                        msg.role === 'assistant'
                      }
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {showHero && activeSection === 'schedule' && (
                <div className="relative z-20 mx-auto mb-4 max-w-sm px-4 text-center">
                  <Link
                    to="/schedule"
                    className="aida-glass-panel aida-border-accent-hover block p-6 transition"
                  >
                    <p className="text-sm font-medium aida-text-accent-soft">{t('chat.openSchedule')}</p>
                    <p className="mt-1 text-xs text-slate-400">{t('chat.scheduleHint')}</p>
                  </Link>
                </div>
              )}

              {error && (
                <div className="relative z-20 mx-auto max-w-2xl px-4 pb-2">
                  <div className="aida-glass-panel border-red-500/30 px-4 py-3 text-sm text-red-300">
                    {error}
                    {error.includes('/pricing') && (
                      <Link to="/pricing" className="mt-2 block text-blue-300 hover:underline">
                        {t('chat.pricing')}
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <div className={`relative z-20 aida-chat-input-area ${showHero ? 'aida-chat-input-area--hero' : 'pb-4'}`}>
                {isActiveChatStreaming && (
                  <p className="mb-2 text-center text-xs aida-text-accent-dim animate-pulse">
                    {streamStatus === 'thinking'
                      ? t('chat.thinking')
                      : streamStatus === 'generating'
                        ? t('chat.streaming')
                        : t('chat.thinking')}
                  </p>
                )}
                <AidaChatInput
                  onSend={handleSend}
                  onStop={handleStop}
                  isStreaming={isActiveChatStreaming}
                  imageUploadEnabled
                />
              </div>
            </div>
          </div>

          <AidaWidgets />
        </div>
      </div>
    </AidaShell>
  );
};

export default Chat;
