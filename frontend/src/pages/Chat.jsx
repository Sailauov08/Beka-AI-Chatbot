import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';

const SUGGESTIONS = [
  { text: 'JavaScript функциясын түсіндір', icon: '💻' },
  { text: 'React компоненті жаз', icon: '⚛️' },
  { text: 'Бұл суретте не көрінеді?', icon: '🖼️' },
  { text: 'MongoDB схемасын құрастыр', icon: '🗄️' },
];

const Chat = () => {
  const { subscription } = useAuth();
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
      if (activeChatId === chatId) {
        handleNewChat();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSend = async ({ message, image }) => {
    if (isStreaming) return;

    setError('');
    setIsStreaming(true);

    const imagePreviewUrl = image ? URL.createObjectURL(image) : null;

    const userMessage = {
      role: 'user',
      content: message,
      imageUrl: imagePreviewUrl,
    };

    const assistantPlaceholder = {
      role: 'assistant',
      content: '',
    };

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
        onDone: async (chatId) => {
          setIsStreaming(false);
          await loadHistory();
          if (chatId && chatId !== streamChatId) {
            setActiveChatId(chatId);
          }
        },
        onError: (msg) => {
          setError(msg);
          setIsStreaming(false);
        },
      });
    } catch (err) {
      const msg =
        err.code === 'LIMIT_REACHED' || err.code === 'PREMIUM_REQUIRED'
          ? `${err.message} → /pricing`
          : err.message;
      setError(msg);
      setMessages((prev) => prev.slice(0, -2));
      setIsStreaming(false);
    }
  };

  return (
    <div className="mesh-bg flex h-screen overflow-hidden">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={loadChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col bg-surface-dark/40">
        <header className="flex items-center gap-3 border-b border-zinc-800/80 bg-surface-dark/60 px-4 py-3 backdrop-blur-md md:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white md:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="hidden h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-xs font-bold sm:flex">
              B
            </div>
            <h1 className="gradient-text text-lg font-semibold">Beka AI</h1>
          </div>
          {isStreaming && (
            <span className="ml-auto flex items-center gap-2 text-xs text-cyan-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              Жауап жазылуда...
            </span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-brand text-4xl shadow-glow">
                ✨
              </div>
              <h2 className="gradient-text mb-3 text-3xl font-bold tracking-tight">
                Beka AI-ға қош келдіңіз
              </h2>
              <p className="max-w-lg text-[15px] leading-relaxed text-zinc-400">
                Сұрақ қойыңыз, код жаздырыңыз немесе сурет жүктеп Vision арқылы талдаңыз.
                Дауыспен де жаза аласыз.
              </p>
              <div className="mt-10 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map(({ text, icon }) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => handleSend({ message: text, image: null })}
                    disabled={isStreaming}
                    className="suggestion-card glass glass-border flex items-start gap-3 rounded-2xl px-4 py-4 text-left text-sm text-zinc-300 disabled:opacity-50"
                  >
                    <span className="text-xl">{icon}</span>
                    <span>{text}</span>
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
                    isStreaming &&
                    index === messages.length - 1 &&
                    msg.role === 'assistant'
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}

          {error && (
            <div className="mx-auto max-w-3xl px-4 py-2">
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
                {(error.includes('/pricing') || error.includes('Premium')) && (
                  <Link to="/pricing" className="mt-2 block font-medium text-cyan-400 hover:underline">
                    Premium сатып алу →
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
          placeholder={isStreaming ? 'Жауап күтілуде...' : 'Beka AI-ға хабарлама жазыңыз...'}
        />
      </main>
    </div>
  );
};

export default Chat;
