import { useRef, useState, useEffect } from 'react';
import { IconImage } from '../ui/Icons';
import { usePreferences } from '../../context/PreferencesContext';

const IconMic = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const AidaChatInput = ({ onSend, onStop, isStreaming = false, imageUploadEnabled = true }) => {
  const { t, speechLocale } = usePreferences();
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isStreaming) return;
    if ((!message.trim() && !image)) return;
    onSend({ message: message.trim() || t('chat.analyzeImage'), image });
    setMessage('');
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming) handleSubmit(e);
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

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('chat.speechUnsupported'));
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = speechLocale;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setMessage((prev) => (prev ? `${prev} ${text}` : text));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <div className="aida-input-shell w-full">
      {imagePreview && (
        <div className="relative z-10 mb-2 inline-block">
          <img src={imagePreview} alt="" className="h-14 rounded-lg border border-white/20 object-cover" />
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
      <form onSubmit={handleSubmit} className="relative">
        <div className="aida-input-glow" aria-hidden="true" />
        <div className="aida-input-bar">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          <button
            type="button"
            onClick={() => imageUploadEnabled && fileInputRef.current?.click()}
            disabled={!imageUploadEnabled || isStreaming}
            className="aida-icon-btn"
            title={t('chat.imageTitle')}
          >
            <IconImage className="h-4 w-4 text-current" />
          </button>
          <button
            type="button"
            onClick={toggleMic}
            disabled={isStreaming}
            className={`aida-icon-btn ${isListening ? 'listening' : ''}`}
            title={t('chat.voiceTitle')}
          >
            <IconMic />
          </button>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            disabled={isStreaming}
            rows={1}
          />
          {isStreaming ? (
            <button type="button" onClick={onStop} className="aida-stop-btn" title={t('chat.stop')}>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
              <span className="aida-btn-label">{t('chat.stop')}</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!message.trim() && !image}
              className="aida-send-btn"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              <span className="aida-btn-label">{t('chat.send')}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AidaChatInput;
