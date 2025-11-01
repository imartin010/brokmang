/**
 * Supabase Browser Client
 * Uses SSR client to properly handle cookies for authentication
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

