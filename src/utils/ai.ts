import { supabase } from '../lib/supabase';
import Tesseract from 'tesseract.js';
import { fetchWithTimeout, TimeoutError } from './fetchWithTimeout';

export type ExtractedTransaction = {
  date: string;
  amount: string; // Keep as string for precision before parsing
  description: string;
  suggested_category: string | null;
  type: 'expense' | 'income';
  confidence: 'high' | 'medium' | 'low';
};

const SYSTEM_PROMPT = `You are a financial data extraction assistant. Your task is to extract transactions from the provided receipt or statement image(s).
You MUST return ONLY a raw JSON array containing an object for each transaction found. Do not include markdown formatting like \`\`\`json.
Each object must match this schema:
{
  "date": "YYYY-MM-DD",
  "amount": "123.45", (as string, no currency symbols, just the decimal value)
  "description": "Store or transaction name",
  "suggested_category": "One of the provided categories, or null if unsure",
  "type": "expense" or "income",
  "confidence": "high", "medium", or "low" based on how clearly you can read the item
}

If no transactions are found, return [].`;

async function invokeWithTimeoutAndErrorHandling(functionName: string, body: any): Promise<any> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || '';
    
    // We get the SUPABASE URL from environment, same as client does
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '');
    
    const res = await fetchWithTimeout(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }, 30_000);

    if (res.status === 429) {
      return { error: 'Daily AI limit reached. Resets at midnight.' };
    }
    if (res.status >= 500) {
      return { error: 'AI service temporarily unavailable.' };
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return { error: err.error || res.statusText };
    }

    const data = await res.json();
    return { data };
  } catch (e) {
    if (e instanceof TimeoutError) {
      return { error: 'Request timed out. Please try again.' };
    }
    return { error: (e as Error).message || 'Unknown error occurred' };
  }
}

export async function callVisionModel(
  imagesBase64: string[],
  categories: { id: string; name: string }[]
): Promise<ExtractedTransaction[]> {
  const provider = import.meta.env.VITE_AI_PROVIDER || 'gemini';

  if (provider === 'gemini') {
    return callGeminiVision(imagesBase64, categories);
  }

  if (provider === 'tesseract') {
    return callTesseractFallback(imagesBase64);
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

async function callGeminiVision(
  imagesBase64: string[],
  categories: { id: string; name: string }[]
): Promise<ExtractedTransaction[]> {
  const categoryNames = categories.map(c => c.name).join(', ');
  const prompt = `${SYSTEM_PROMPT}\n\nValid categories: ${categoryNames}`;

  const { data, error } = await invokeWithTimeoutAndErrorHandling('gemini-vision', { imagesBase64, prompt });

  if (error) {
    throw new Error(`Edge function error: ${error}`);
  }

  try {
    const rawText = data.text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(rawText);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse Gemini response:', err, data?.text);
    throw new Error('Failed to parse transactions from AI response');
  }
}

// Minimal fallback just to keep something working if no AI
async function callTesseractFallback(imagesBase64: string[]): Promise<ExtractedTransaction[]> {
  let fullText = '';
  for (const base64 of imagesBase64) {
    const ocr = await Tesseract.recognize(base64, 'eng');
    fullText += ocr.data.text + '\n';
  }
  
  return [{
    amount: "0",
    date: new Date().toISOString().slice(0, 10),
    description: "Tesseract Fallback (Could not parse structure)\n" + fullText.slice(0, 50),
    suggested_category: null,
    type: 'expense',
    confidence: 'low'
  }];
}

export async function suggestCategory(description: string, categories: { id: string; name: string }[]): Promise<string | null> {
  const { data, error } = await invokeWithTimeoutAndErrorHandling('ai-advisor', {
    action: 'categorize', prompt: description, context: categories
  });
  if (error) {
    console.error('AI Categorizer Error:', error);
    return null;
  }
  try {
    const rawText = data.text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(rawText);
    return parsed.category_id || null;
  } catch (err) {
    return null;
  }
}

export async function askFinancialAdvisor(question: string, contextData: any): Promise<string> {
  const { data, error } = await invokeWithTimeoutAndErrorHandling('ai-advisor', {
    action: 'chat', prompt: question, context: contextData
  });
  if (error) {
    throw new Error(error);
  }
  return data.text;
}

export async function detectAnomalies(categoryName: string, avgSpend: number, currentSpend: number): Promise<string | null> {
  if (currentSpend <= avgSpend * 1.5 || avgSpend < 50) return null; // Only flag major anomalies
  
  const { data, error } = await invokeWithTimeoutAndErrorHandling('ai-advisor', {
    action: 'anomaly', prompt: 'Explain this anomaly.', context: { categoryName, avgSpend, currentSpend }
  });
  
  if (error) return null;
  return data.text;
}

