import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { chatAPI } from '../services/api';

const Chat = () => {
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
      setError(err.message);
      setMessages((prev) => prev.slice(0, -2));
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-dark">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={loadChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-gray-800 px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 md:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-medium text-gray-200">Beka AI</h1>
        </header>

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20 text-3xl">
                ✨
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-white">
                Beka AI-ға қош келдіңіз
              </h2>
              <p className="max-w-md text-gray-400">
                Сұрақ қойыңыз, код жаздырыңыз немесе сурет жүктеп Vision арқылы талдаңыз.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  'JavaScript функциясын түсіндір',
                  'React компоненті жаз',
                  'Бұл суретте не көрінеді?',
                  'MongoDB схемасын құрастыр',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSend({ message: suggestion, image: null })}
                    disabled={isStreaming}
                    className="rounded-xl border border-gray-700 px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-gray-800 disabled:opacity-50"
                  >
                    {suggestion}
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
              <div className="rounded-lg bg-red-900/30 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            </div>
          )}
        </div>

        <ChatInput
          onSend={handleSend}
          disabled={isStreaming}
          placeholder={isStreaming ? 'Жауап күтілуде...' : 'Хабарламаңызды жазыңыз...'}
        />
      </main>
    </div>
  );
};

export default Chat;
