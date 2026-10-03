import { createClient } from '@supabase/supabase-js';

// Publishable (public) key - safe in browser. Never put the secret/service_role key here.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ssaqdsqopxclkplstpzj.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_8iMUvlGLPHOEpAXbHUhImw_hN76bxo_';

export const supabase = createClient(url, key);
