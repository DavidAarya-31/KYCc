import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Authenticate
    const authHeader = req.headers.get('Authorization');
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') ?? ''
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    // 2. Rate limit check (10 calls/day)
    const { data: allowed } = await supabase.rpc('check_ai_rate_limit', {
      p_user_id: user.id,
      p_function_name: 'ai-advisor',
      p_daily_limit: 10,
    });
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Daily AI limit reached. Resets at midnight.' }),
        { status: 429, headers: corsHeaders }
      );
    }

    const { action, prompt, context } = await req.json();
    
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    let systemInstruction = "You are a helpful AI.";
    let responseMimeType = "text/plain";
    
    if (action === 'chat') {
      systemInstruction = `You are an expert personal financial advisor for the user. 
You are given the user's recent transaction data and budget information as JSON context.
Answer the user's question accurately based ONLY on their data. 
Do not hallucinate. If the data does not contain the answer, say so.
Format your response in plain text or simple markdown. Be concise.
Assume all currency values are in Indian Rupees (₹).

Context Data:
${JSON.stringify(context)}`;
    } else if (action === 'categorize') {
      systemInstruction = `You are a financial categorizer.
You will receive a transaction description. 
You must pick the BEST matching category ID from the provided context.
If unsure, pick the ID for "Other" or return null.
Return ONLY a valid JSON object like: {"category_id": "uuid-here"}.

Categories Context:
${JSON.stringify(context)}`;
      responseMimeType = "application/json";
    } else if (action === 'anomaly') {
      systemInstruction = `You are an anomaly detection assistant.
The user has spent unusually high amounts in certain categories compared to their historical average.
The context provides the category name, average spend, and current spend.
Generate a short, friendly, plain-text warning (max 2 sentences) for the user explaining the anomaly.
CRITICAL: Use the Indian Rupee symbol (₹) for all currency amounts, NOT dollars ($).

Context:
${JSON.stringify(context)}`;
    } else if (action === 'card-chat') {
      systemInstruction = `You are a credit card recommendation assistant.
The user will ask which card is best for a specific type of transaction or domain.
The context provides the user's active credit cards, including their names, networks, and milestone progress.
Recommend the best card to use based on the transaction type and milestone progress. 
If one card is close to its milestone, suggest it. If a card offers general benefits for that category (based on typical card knowledge), mention it briefly.
IMPORTANT: If the user asks about a specific domain (like airport lounge access, dining, travel, etc.) and none of their current cards are efficient or offer those benefits, explicitly suggest 1-2 new real-world credit cards (not in their context) that they should consider getting for those specific benefits.
Keep the response very short, friendly, and under 3 sentences.

Context:
${JSON.stringify(context)}`;
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: responseMimeType
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Log usage AFTER successful call
    await supabase.from('ai_usage').insert({
      user_id: user.id,
      function_name: 'ai-advisor',
      tokens_used: 0, // Gemini Flash API usage object could be parsed if available, defaulting to 0
      cost_usd: 0,
    });

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
