import { createClient } from '@supabase/supabase-js'

/* ============================================================
   Supabase client — used throughout the app for:
   - Auth (sign up, sign in, sign out, session management)
   - Database reads/writes (trades, rules, violations, etc.)
   - Real-time subscriptions (future)

   Uses NEXT_PUBLIC_ env vars so it works in both server
   components and client components. The anon key is safe
   to expose — RLS policies protect the data.
   ============================================================ */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
