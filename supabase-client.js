// supabase-client.js - with CDN fallback for reliability
const CDN_URLS = [
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm',
  'https://unpkg.com/@supabase/supabase-js@2.45.4/dist/index.js',
  'https://esm.sh/@supabase/supabase-js@2.45.4'
];

const SUPABASE_URL = 'https://ijsvpdraigzvxeeuedzd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FlaAOinEJSeHyLTEaEAJrQ_QR_N3dBe';

let _supabase = null;
async function getSupabase() {
  if (_supabase) return _supabase;
  for (const url of CDN_URLS) {
    try {
      const mod = await import(url);
      const createClient = mod.createClient;
      _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
      return _supabase;
    } catch (e) { console.warn('CDN failed:', url); }
  }
  throw new Error('Could not load Supabase client');
}

export const supabase = await getSupabase();
