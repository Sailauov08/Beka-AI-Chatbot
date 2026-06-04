/** SSE жіберу (Render timeout-тан сақтау үшін) */
export const writeSse = (res, payload) => {
  if (res.writableEnded) return;
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

/** Gemini chunk мәтінін қауіпсіз алу */
export const extractChunkText = (chunk) => {
  try {
    const text = chunk.text?.();
    if (text) return text;
  } catch {
    /* chunk.text() кейде block reason-да қате лақтырады */
  }

  const parts = chunk.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    return parts.map((p) => p.text || '').join('');
  }
  return '';
};

/** Чат тарихы — бос хабарламаларды өткізіп жіберу */
export const buildHistoryForAI = (messages) =>
  messages
    .slice(0, -1)
    .filter((m) => m?.content && String(m.content).trim())
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(msg.content).trim() }],
    }));
