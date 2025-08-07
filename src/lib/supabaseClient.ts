// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Ensure you have these in a .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);