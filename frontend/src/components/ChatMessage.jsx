import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const ChatMessage = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`w-full px-4 py-5 md:px-6 ${
        isUser ? 'bg-transparent' : 'bg-zinc-900/30'
      }`}
    >
      <div className={`mx-auto flex max-w-3xl gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-lg ${
            isUser
              ? 'bg-gradient-user text-white'
              : 'bg-gradient-ai text-white'
          }`}
        >
          {isUser ? 'Сіз' : 'AI'}
        </div>

        <div className={`min-w-0 flex-1 ${isUser ? 'text-right' : ''}`}>
          {message.imageUrl && (
            <div className={`mb-3 ${isUser ? 'flex justify-end' : ''}`}>
              <img
                src={message.imageUrl}
                alt="Uploaded"
                className="max-h-64 max-w-full rounded-2xl border border-zinc-700/80 object-contain shadow-lg"
              />
            </div>
          )}

          {isUser ? (
            <div className="inline-block max-w-[90%] rounded-2xl rounded-tr-md bg-gradient-user px-4 py-3 text-left text-[15px] leading-relaxed text-white shadow-glow-sm">
              {message.content}
            </div>
          ) : (
            <div className="markdown-body rounded-2xl rounded-tl-md border border-zinc-800/60 bg-surface-card/80 px-4 py-3 text-left text-[15px] leading-relaxed text-zinc-100">
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
                {message.content || (isStreaming ? '' : '')}
              </ReactMarkdown>

              {isStreaming && !message.content && (
                <div className="flex items-center gap-1.5 py-2">
                  <span className="typing-dot h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-cyan-400" />
                </div>
              )}

              {isStreaming && message.content && (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-cyan-400" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
