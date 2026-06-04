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
    <div className="relative my-3 overflow-hidden rounded-lg border border-gray-700">
      <div className="flex items-center justify-between bg-[#1e1e1e] px-4 py-2 text-xs text-gray-400">
        <span>{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded px-2 py-1 text-gray-300 transition hover:bg-gray-700 hover:text-white"
        >
          {copied ? 'Көшірілді ✓' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          background: '#282c34',
        }}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
