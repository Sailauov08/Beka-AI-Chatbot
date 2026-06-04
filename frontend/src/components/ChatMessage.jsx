import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const ChatMessage = ({ message, isStreaming, theme = 'light' }) => {
  const isUser = message.role === 'user';
  const dark = theme === 'aida';

  return (
    <div className={`w-full px-4 py-4 md:px-8 ${dark ? 'aida-messages' : ''} ${isUser && !dark ? 'bg-surface-muted' : !dark ? 'bg-white' : ''}`}>
      <div className={`mx-auto flex max-w-3xl gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold text-white ${
            isUser ? (dark ? 'bg-blue-600' : 'bg-ink') : dark ? 'bg-violet-600/80' : 'bg-slate-500'
          }`}
        >
          {isUser ? 'С' : 'AI'}
        </div>

        <div className={`min-w-0 flex-1 ${isUser ? 'text-right' : ''}`}>
          {message.imageUrl && (
            <div className={`mb-2 ${isUser ? 'flex justify-end' : ''}`}>
              <img
                src={message.imageUrl}
                alt="Uploaded"
                className={`max-h-64 rounded-lg border object-contain ${
                  dark ? 'border-white/20' : 'border-surface-border'
                }`}
              />
            </div>
          )}

          {isUser ? (
            <div
              className={`inline-block max-w-[90%] rounded-lg px-4 py-3 text-left text-sm ${
                dark ? 'aida-msg-user' : 'bg-ink text-white'
              }`}
            >
              {message.content}
            </div>
          ) : (
            <div
              className={`markdown-body rounded-lg px-4 py-3 text-left text-sm ${
                dark ? 'aida-msg-ai' : 'border border-surface-border bg-surface-muted text-surface-text'
              }`}
            >
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    if (match) {
                      return (
                        <CodeBlock language={match[1]}>
                          {String(children).replace(/\n$/, '')}
                        </CodeBlock>
                      );
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content || ''}
              </ReactMarkdown>
              {isStreaming && !message.content && (
                <div className="flex gap-1 py-2">
                  <span className="typing-dot h-2 w-2 rounded-full" />
                  <span className="typing-dot h-2 w-2 rounded-full" />
                  <span className="typing-dot h-2 w-2 rounded-full" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
