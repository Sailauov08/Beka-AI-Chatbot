import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const ChatMessage = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`w-full px-4 py-4 md:px-6 ${isUser ? 'bg-surface-muted' : 'bg-white'}`}>
      <div className={`mx-auto flex max-w-3xl gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${
            isUser ? 'bg-brand' : 'bg-surface-subtext'
          }`}
        >
          {isUser ? 'Сіз' : 'AI'}
        </div>

        <div className={`min-w-0 flex-1 ${isUser ? 'text-right' : ''}`}>
          {message.imageUrl && (
            <div className={`mb-2 ${isUser ? 'flex justify-end' : ''}`}>
              <img
                src={message.imageUrl}
                alt="Uploaded"
                className="max-h-64 rounded-xl border border-surface-border object-contain"
              />
            </div>
          )}

          {isUser ? (
            <div className="inline-block max-w-[90%] rounded-2xl rounded-tr-md bg-brand px-4 py-3 text-left text-white">
              {message.content}
            </div>
          ) : (
            <div className="markdown-body rounded-2xl border border-surface-border bg-white px-4 py-3 text-left text-surface-text shadow-sm">
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
