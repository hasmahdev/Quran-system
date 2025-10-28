import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();
    const supabase = createClient(
      Deno.env.get('APP_SUPABASE_URL')!,
      Deno.env.get('APP_SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: users, error } = await supabase.from('users').select('*');

    if (error) throw error;

    for (const user of users) {
      if (await bcrypt.compare(password, user.password_hash)) {
        const { password_hash, ...userData } = user;
        return new Response(JSON.stringify(userData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
