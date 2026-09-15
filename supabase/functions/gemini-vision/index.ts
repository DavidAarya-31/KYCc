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

    // 2. Rate limit check (5 calls/day)
    const { data: allowed } = await supabase.rpc('check_ai_rate_limit', {
      p_user_id: user.id,
      p_function_name: 'gemini-vision',
      p_daily_limit: 5,
    });
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Daily AI limit reached. Resets at midnight.' }),
        { status: 429, headers: corsHeaders }
      );
    }

    const { imagesBase64, prompt } = await req.json();
    
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const imageParts = imagesBase64.map((base64: string) => ({
      inlineData: {
        data: base64.replace(/^data:image\/\w+;base64,/, ''),
        mimeType: base64.match(/data:(image\/\w+);base64,/)?.[1] || "image/jpeg"
      }
    }));

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 25000);

    try {
      const result = await model.generateContent([prompt, ...imageParts], { signal: abortController.signal } as any);
      const response = await result.response;
      const text = response.text();
      clearTimeout(timeoutId);

      await supabase.from('ai_usage').insert({
        user_id: user.id,
        function_name: 'gemini-vision',
        tokens_used: 0,
        cost_usd: 0,
      });

      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'Vision processing timed out. Try a smaller image.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 504,
        });
      }
      throw err;
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
