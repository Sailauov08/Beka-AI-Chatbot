import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ChatSidebar from '../components/ChatSidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';

const SUGGESTIONS = [
  { text: 'JavaScript функциясын түсіндір', icon: '💻' },
  { text: 'React компоненті жаз', icon: '⚛️' },
  { text: 'Бұл суретте не көрінеді?', icon: '🖼️' },
  { text: 'MongoDB схемасын құрастыр', icon: '🗄️' },
];

const Chat = () => {
  const { user, subscription } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

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

  const loadChat = async (chatId) => {
    try {
      const response = await chatAPI.getChat(chatId);
      setActiveChatId(chatId);
      setMessages(response.data.messages || []);
      setSidebarOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setError('');
    setSidebarOpen(false);
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await chatAPI.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) handleNewChat();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSend = async ({ message, image }) => {
    if (isStreaming) return;
    setError('');
    setIsStreaming(true);
    const imagePreviewUrl = image ? URL.createObjectURL(image) : null;
    const userMessage = { role: 'user', content: message, imageUrl: imagePreviewUrl };
    const assistantPlaceholder = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    let streamChatId = activeChatId;

    try {
      await chatAPI.sendMessageStream({
        message,
        chatId: activeChatId,
        image,
        onChatId: (id) => {
          streamChatId = id;
          setActiveChatId(id);
        },
        onChunk: (chunk) => {
          setMessages((prev) => {
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
        onDone: async () => {
          setIsStreaming(false);
          await loadHistory();
        },
        onError: (msg) => {
          setError(msg);
          setIsStreaming(false);
        },
      });
    } catch (err) {
      setError(err.message);
      setMessages((prev) => prev.slice(0, -2));
      setIsStreaming(false);
    }
  };

  return (
    <AppLayout
      secondarySidebar={
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={loadChat}
          onDeleteChat={handleDeleteChat}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      }
    >
      <header className="flex items-center gap-3 border-b border-surface-border bg-white px-4 py-3 md:px-6">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-surface-subtext hover:bg-surface-muted lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-semibold text-surface-text">Басты бет</h1>
          <p className="text-xs text-surface-subtext">
            Сәлем, {user?.name} · {subscription?.planName}
          </p>
        </div>
        {isStreaming && (
          <span className="ml-auto text-xs text-brand">Жауап жазылуда...</span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto bg-white">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
            <div className="card mb-6 flex h-24 w-full max-w-xl flex-col justify-center p-6 text-left">
              <p className="text-sm text-surface-subtext">Сәлемдесу</p>
              <p className="text-xl font-bold text-surface-text">{user?.name}</p>
              <div className="mt-4 flex gap-6 text-sm">
                <span>
                  <strong className="text-brand">{subscription?.dailyRemaining ?? 15}</strong> хабарлама
                </span>
                <span>Жоспар: {subscription?.planName}</span>
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-surface-text">Beka AI-ға қош келдіңіз</h2>
            <p className="mb-8 max-w-md text-surface-subtext">Сұрақ қойыңыз немесе төменнен таңдаңыз</p>
            <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map(({ text, icon }) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => handleSend({ message: text, image: null })}
                  disabled={isStreaming}
                  className="suggestion-card flex items-start gap-3 p-4 text-left text-sm disabled:opacity-50"
                >
                  <span>{icon}</span>
                  <span className="text-surface-text">{text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg}
                isStreaming={
                  isStreaming && index === messages.length - 1 && msg.role === 'assistant'
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
        {error && (
          <div className="mx-auto max-w-3xl px-4 py-2">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
              {error.includes('/pricing') && (
                <Link to="/pricing" className="mt-2 block font-medium text-brand">
                  Тарифтер →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <ChatInput
        onSend={handleSend}
        disabled={isStreaming}
        imageUploadEnabled={Boolean(subscription?.imageUpload)}
        placeholder={isStreaming ? 'Жауап күтілуде...' : 'Хабарлама жазыңыз...'}
      />
    </AppLayout>
  );
};

export default Chat;
