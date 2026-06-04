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
    /* chunk.text() block reason кезінде қате беруі мүмкін */
  }

  const parts = chunk.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    return parts.map((p) => p.text || '').join('');
  }
  return '';
};

/** startChat тарихы (резерв) */
export const buildHistoryForAI = (messages) => {
  const items = messages
    .slice(0, -1)
    .filter((m) => m?.content && String(m.content).trim())
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(msg.content).trim() }],
    }));

  while (items.length > 0 && items[0].role === 'model') {
    items.shift();
  }

  const merged = [];
  for (const item of items) {
    const last = merged[merged.length - 1];
    if (last && last.role === item.role) {
      last.parts[0].text += `\n${item.parts[0].text}`;
    } else {
      merged.push({ ...item, parts: [{ text: item.parts[0].text }] });
    }
  }
  return merged;
};

/** generateContentStream үшін contents */
export const buildContentsForGenerate = (messages, promptParts) => {
  const contents = buildHistoryForAI(messages);
  const parts = Array.isArray(promptParts) ? promptParts : [{ text: String(promptParts) }];

  const last = contents[contents.length - 1];
  if (last?.role === 'user' && !parts.some((p) => p.inlineData)) {
    const textPart = parts.find((p) => p.text);
    if (textPart?.text) {
      last.parts[0].text += `\n${textPart.text}`;
    }
    const imagePart = parts.find((p) => p.inlineData);
    if (imagePart) last.parts.push(imagePart);
  } else {
    contents.push({ role: 'user', parts });
  }

  return contents;
};

export const withTimeout = (promise, ms, message) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
