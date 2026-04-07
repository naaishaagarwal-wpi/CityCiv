//this loads the supabase client so that it can be accessed, code from supabase developer docs: https://supabase.com/docs/guides/auth/server-side/creating-a-client

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );