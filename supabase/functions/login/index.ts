import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

serve(async (req) => {
  const { password } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: users, error } = await supabase.from('users').select('*');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  for (const user of users) {
    const match = await bcrypt.compare(password, user.password_hash);
    if (match) {
      const { password_hash, ...userData } = user;
      return new Response(JSON.stringify(userData), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 401,
  });
});
