import { createClient } from "@supabase/supabase-js";

const env = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env ?? {};

export const configured = Boolean(
  env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY
);

const fallbackUrl = "https://placeholder.supabase.co";
const fallbackKey = "placeholder-public-anon-key";

export const supabase = createClient(
  env.VITE_SUPABASE_URL || fallbackUrl,
  env.VITE_SUPABASE_ANON_KEY || fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export const supabaseConfigured = configured;
