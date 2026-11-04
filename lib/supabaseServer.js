import { createClient } from "@supabase/supabase-js"

// Server-only client. Prefer the service-role key (never exposed to the browser,
// bypasses RLS, so authorization MUST be enforced in our API routes - see lib/auth.js).
// Falls back to the anon key so local dev keeps working before the key is configured.
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
})

export const PUBLIC_FIELDS = "Username, Name, ProfilePic, Bio, Followers, Following"
export const SELF_FIELDS = "id, created_at, Username, Name, Email, ProfilePic, Bio, Followers, Following, Posts"
