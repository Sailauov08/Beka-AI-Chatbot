import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const ChatMessage = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`group w-full border-b border-gray-800/50 ${
        isUser ? 'bg-surface-dark' : 'bg-surface'
      }`}
    >
      <div className="mx-auto flex max-w-3xl gap-4 px-4 py-6 md:px-6">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-sm font-semibold ${
            isUser
              ? 'bg-accent text-white'
              : 'bg-emerald-700 text-white'
          }`}
        >
          {isUser ? 'С' : 'AI'}
        </div>

        <div className="min-w-0 flex-1">
          {message.imageUrl && (
            <div className="mb-3">
              <img
                src={message.imageUrl}
                alt="Uploaded"
                className="max-h-64 max-w-full rounded-lg border border-gray-700 object-contain"
              />
            </div>
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-100">
              {message.content}
            </p>
          ) : (
            <div className="markdown-body text-[15px] leading-relaxed text-gray-100">
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
                <div className="flex items-center gap-1 py-2">
                  <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
                </div>
              )}

              {isStreaming && message.content && (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-accent" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
