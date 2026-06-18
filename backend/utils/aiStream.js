import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import {
  buildContentsForGenerate,
  extractChunkText,
  withTimeout,
} from './geminiStream.js';

const DEFAULT_GEMINI_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
];

const DEFAULT_GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

export const getAiProvider = () => (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim();

export const getGeminiModelList = () => {
  if (process.env.GEMINI_MODEL) {
    return process.env.GEMINI_MODEL.split(',').map((m) => m.trim()).filter(Boolean);
  }
  return DEFAULT_GEMINI_MODELS;
};

export const getGroqModelList = () => {
  if (process.env.GROQ_MODEL) {
    return process.env.GROQ_MODEL.split(',').map((m) => m.trim()).filter(Boolean);
  }
  return DEFAULT_GROQ_MODELS;
};

const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key_here') {
    throw new Error(
      'GEMINI_API_KEY бапталмаған. https://aistudio.google.com/apikey немесе AI_PROVIDER=groq қойыңыз.'
    );
  }
  return new GoogleGenerativeAI(key);
};

const getGroqKey = () => {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY бапталмаған. https://console.groq.com/keys');
  }
  return key;
};

export const formatAiError = (error) => {
  const msg = error?.message || String(error);
  const provider = getAiProvider();

  if (msg.includes('limit: 0')) {
    return (
      'Бұл жобада тегін Gemini квотасы жоқ (limit: 0). ' +
      'AI_PROVIDER=groq қойып Groq кілтін қолданыңыз немесе жаңа Gemini кілт алыңыз.'
    );
  }
  if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.includes('Too Many Requests')) {
    if (provider === 'groq') {
      return 'Groq квотасы асып кетті (429). 1–2 сағат күтіңіз немесе console.groq.com-да жаңа кілт алыңыз.';
    }
    return (
      'Gemini квотасы асып кетті (429). Render → GEMINI_API_KEY жаңартыңыз немесе AI_PROVIDER=groq қойыңыз. ' +
      'https://aistudio.google.com/apikey'
    );
  }
  if (msg.includes('404') && msg.includes('not found')) {
    return 'AI моделі табылмады. GEMINI_MODEL немесе GROQ_MODEL мәнін тексеріңіз.';
  }
  if (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID') || msg.includes('Invalid API Key')) {
    return 'API кілті жарамсыз. Environment Variables-ті тексеріңіз.';
  }
  if (msg.includes('Groq сурет')) {
    return 'Сурет жүктеу тек Gemini (AI_PROVIDER=gemini) режимінде қолжетімді.';
  }
  return msg.length > 300 ? `${msg.slice(0, 300)}...` : msg;
};

export const isRetryableModelError = (error) => {
  const msg = error?.message || '';
  return msg.includes('429') || msg.includes('404') || msg.toLowerCase().includes('quota');
};

const buildOpenAiMessages = (chatMessages, userText, systemInstruction) => {
  const messages = [{ role: 'system', content: systemInstruction }];

  for (const msg of chatMessages.slice(0, -1)) {
    if (!msg?.content?.trim()) continue;
    messages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: String(msg.content).trim(),
    });
  }

  messages.push({ role: 'user', content: userText });
  return messages;
};

async function* readGroqSseStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const text = parsed.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        /* ignore partial JSON */
      }
    }
  }
}

export async function* streamGroqChat({ systemInstruction, chatMessages, userText }) {
  const apiKey = getGroqKey();
  const modelList = getGroqModelList();
  const messages = buildOpenAiMessages(chatMessages, userText, systemInstruction);
  const timeoutMs = 90000;
  let lastError = null;

  for (const modelName of modelList) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          stream: true,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`${response.status} ${errBody.slice(0, 200)}`);
      }

      console.log(`Groq model used: ${modelName}`);
      for await (const chunk of readGroqSseStream(response)) {
        yield chunk;
      }
      return;
    } catch (err) {
      lastError = err;
      console.warn(`Groq ${modelName} failed:`, err.message?.slice(0, 200));
      if (!isRetryableModelError(err)) throw err;
    }
  }

  throw lastError || new Error('Барлық Groq модельдері сәтсіз аяқталды');
}

export async function* streamGeminiChat({ systemInstruction, chatMessages, promptParts }) {
  const genAI = getGeminiClient();
  const modelList = getGeminiModelList();
  const contents = buildContentsForGenerate(chatMessages, promptParts);
  const timeoutMs = 90000;
  let lastError = null;

  for (const modelName of modelList) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
      const streamResult = await withTimeout(
        model.generateContentStream({ contents }),
        timeoutMs,
        'AI 90 секундта жауап бермеді. Қайта көріңіз.'
      );

      console.log(`Gemini model used: ${modelName}`);
      for await (const chunk of streamResult.stream) {
        const text = extractChunkText(chunk);
        if (text) yield text;
      }
      return;
    } catch (err) {
      lastError = err;
      console.warn(`Gemini ${modelName} failed:`, err.message?.slice(0, 200));
      if (!isRetryableModelError(err)) throw err;
    }
  }

  throw lastError || new Error('Барлық Gemini модельдері сәтсіз аяқталды');
}

export async function* streamChat({ systemInstruction, chatMessages, promptParts, userText, hasImage }) {
  const provider = getAiProvider();

  if (provider === 'groq') {
    if (hasImage) {
      throw new Error('Groq сурет талдауын қолдамайды. AI_PROVIDER=gemini қойыңыз.');
    }
    yield* streamGroqChat({ systemInstruction, chatMessages, userText });
    return;
  }

  yield* streamGeminiChat({ systemInstruction, chatMessages, promptParts });
}

export async function checkAiConnection() {
  const provider = getAiProvider();

  if (provider === 'groq') {
    const modelName = getGroqModelList()[0];
    const apiKey = getGroqKey();
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`${response.status} ${errBody.slice(0, 200)}`);
    }

    const data = await response.json();
    return {
      provider: 'groq',
      model: modelName,
      sample: data.choices?.[0]?.message?.content?.trim()?.slice(0, 80) || 'OK',
    };
  }

  const genAI = getGeminiClient();
  const modelName = getGeminiModelList()[0];
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent('Reply with exactly: OK');
  return {
    provider: 'gemini',
    model: modelName,
    sample: result.response.text()?.trim()?.slice(0, 80) || 'OK',
  };
}

export const fileToGenerativePart = (filePath, mimeType) => ({
  inlineData: {
    data: fs.readFileSync(filePath).toString('base64'),
    mimeType,
  },
});
