import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ language, children }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative my-3 overflow-hidden rounded-xl border border-zinc-700/80 shadow-lg">
      <div className="flex items-center justify-between border-b border-zinc-700/80 bg-zinc-900/90 px-4 py-2 font-mono text-xs text-zinc-400">
        <span className="text-cyan-400/80">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg px-2.5 py-1 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
        >
          {copied ? 'Көшірілді ✓' : 'Көшіру'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.8125rem',
          background: '#18181b',
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        }}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
