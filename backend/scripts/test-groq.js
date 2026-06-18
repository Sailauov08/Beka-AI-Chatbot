/**
 * Groq кілтін тексеру: node backend/scripts/test-groq.js
 */
import 'dotenv/config';

const key = process.env.GROQ_API_KEY;
if (!key || key === 'your_groq_api_key_here') {
  console.error('❌ GROQ_API_KEY жоқ — backend/.env толтырыңыз');
  process.exit(1);
}

const model =
  (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile,llama-3.1-8b-instant').split(',')[0].trim();

try {
  console.log(`Сынау: ${model}...`);
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'Қазақша бір сөйлеммен «Сәлем» деп жауап бер.' }],
      max_tokens: 60,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${response.status} ${err.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  console.log(`✅ ${model} жұмыс істейді:`);
  console.log(text);
} catch (e) {
  console.error('❌', e.message?.slice(0, 300));
  process.exit(1);
}
