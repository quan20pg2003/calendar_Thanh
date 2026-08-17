import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vstftwxrjpxmomzskqmj.supabase.co';

// Default Supabase public anon key env variable
const metaEnv = (import.meta as any).env || {};
const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdGZ0d3hyanB4bW9tenNrcW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjUzNDIsImV4cCI6MjA1Njk0MTM0Mn0.placeholder';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
