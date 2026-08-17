import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vstftwxrjpxmomzskqmj.supabase.co';

const metaEnv = (import.meta as any).env || {};
const SUPABASE_ANON_KEY =
  metaEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ya-psp4kKhn4Uz62e_VUZg_sbGDzjQt';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
