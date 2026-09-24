// supabase-client.js
// Initialize Supabase client for authentication
// Replace placeholders with your actual Supabase project URL and publishable anon key.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

const SUPABASE_URL = 'https://ijsvpdraigzvxeeuedzd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FlaAOinEJSeHyLTEaEAJrQ_QR_N3dBe';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
