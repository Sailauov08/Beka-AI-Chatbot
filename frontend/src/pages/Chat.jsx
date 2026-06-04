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

const Chat = () => {
  const { subscription } = useAuth();
  const { t } = usePreferences();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
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
      setActiveSection('chat');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setError('');
    setActiveSection('dashboard');
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
    setActiveSection('chat');
    const imagePreviewUrl = image ? URL.createObjectURL(image) : null;
    const userMessage = { role: 'user', content: message, imageUrl: imagePreviewUrl };
    const assistantPlaceholder = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);

    try {
      await chatAPI.sendMessageStream({
        message,
        chatId: activeChatId,
        image,
        onChatId: (id) => setActiveChatId(id),
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

  const showHero = messages.length === 0;

  return (
    <AidaShell
      chatSidebarProps={{
        activeSection,
        onSectionChange: setActiveSection,
        chats,
        activeChatId,
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
                        isStreaming && index === messages.length - 1 && msg.role === 'assistant'
                      }
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {showHero && activeSection === 'schedule' && (
                <div className="relative z-20 mx-auto mb-4 max-w-sm px-4 text-center">
                  <Link to="/schedule" className="aida-glass-panel block p-6 transition hover:border-cyan-500/40">
                    <p className="text-sm font-medium text-cyan-200">{t('chat.openSchedule')}</p>
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

              <div className={`relative z-20 ${showHero ? 'pb-8 pt-[45vh]' : 'pb-4'}`}>
                {isStreaming && (
                  <p className="mb-2 text-center text-xs text-cyan-400/80">{t('chat.streaming')}</p>
                )}
                <AidaChatInput
                  onSend={handleSend}
                  disabled={isStreaming}
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
