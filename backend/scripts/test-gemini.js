/**
 * Gemini кілтін тексеру: node backend/scripts/test-gemini.js
 * backend/.env ішінде GEMINI_API_KEY болуы керек
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const key = process.env.GEMINI_API_KEY;
if (!key || key === 'your_gemini_api_key_here') {
  console.error('❌ GEMINI_API_KEY жоқ — backend/.env толтырыңыз');
  process.exit(1);
}

const models = (process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite,gemini-2.0-flash').split(
  ','
).map((m) => m.trim());

const genAI = new GoogleGenerativeAI(key);

for (const modelName of models) {
  try {
    console.log(`Сынау: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Қазақша бір сөйлеммен «Сәлем» деп жауап бер.');
    const text = result.response.text();
    console.log(`✅ ${modelName} жұмыс істейді:`);
    console.log(text.slice(0, 200));
    process.exit(0);
  } catch (e) {
    console.error(`❌ ${modelName}:`, e.message?.slice(0, 200));
  }
}

console.error('❌ Еш модель жұмыс істемеді');
process.exit(1);
