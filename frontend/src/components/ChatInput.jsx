import { useRef, useState, useEffect } from 'react';

const ChatInput = ({ onSend, disabled, placeholder, imageUploadEnabled = true }) => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!message.trim() && !image) || disabled) return;
    onSend({ message: message.trim() || 'Суретті талда', image });
    setMessage('');
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const iconBtn =
    'shrink-0 rounded-lg p-2 text-surface-subtext transition hover:bg-surface-muted hover:text-brand disabled:opacity-40';

  return (
    <div className="border-t border-surface-border bg-white px-4 py-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        {imagePreview && (
          <div className="relative mb-2 inline-block">
            <img src={imagePreview} alt="Preview" className="h-16 rounded-lg border object-cover" />
            <button
              type="button"
              onClick={() => {
                setImage(null);
                setImagePreview(null);
              }}
              className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 rounded-2xl border border-surface-border bg-surface-muted p-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          <button
            type="button"
            onClick={() => {
              if (!imageUploadEnabled) {
                alert('Сурет — Бастау немесе Про жоспарында');
                return;
              }
              fileInputRef.current?.click();
            }}
            className={iconBtn}
          >
            📷
          </button>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="max-h-[200px] min-h-[28px] flex-1 resize-none bg-transparent py-2 text-surface-text outline-none"
          />
          <button type="submit" disabled={disabled || (!message.trim() && !image)} className="btn-primary shrink-0 !py-2">
            ↑
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
