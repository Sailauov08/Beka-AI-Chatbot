import { useRef, useState, useEffect } from 'react';

const ChatInput = ({ onSend, disabled, placeholder }) => {
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleMicrophone = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Сіздің браузеріңіз дауыспен жазуды қолдамайды. Chrome қолданыңыз.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'kk-KZ';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setMessage((prev) => prev + transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="border-t border-gray-800 bg-surface-dark px-4 py-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        {imagePreview && (
          <div className="relative mb-3 inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-20 rounded-lg border border-gray-600 object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}

        <div className="relative flex items-end gap-2 rounded-2xl border border-gray-600 bg-surface-light px-4 py-3 shadow-lg focus-within:border-gray-500">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-700 hover:text-white disabled:opacity-50"
            title="Сурет жүктеу"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={toggleMicrophone}
            disabled={disabled}
            className={`shrink-0 rounded-lg p-2 transition hover:bg-gray-700 disabled:opacity-50 ${
              isListening ? 'text-red-400 animate-pulse' : 'text-gray-400 hover:text-white'
            }`}
            title="Микрофон (дауыспен жазу)"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Хабарламаңызды жазыңыз...'}
            disabled={disabled}
            rows={1}
            className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent text-[15px] text-gray-100 placeholder-gray-500 outline-none disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={disabled || (!message.trim() && !image)}
            className="shrink-0 rounded-lg bg-accent p-2 text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            title="Жіберу"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-gray-600">
          Beka AI қателер жасауы мүмкін. Маңызды ақпаратты тексеріңіз.
        </p>
      </form>
    </div>
  );
};

export default ChatInput;
