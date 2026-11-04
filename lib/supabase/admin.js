import { createClient } from "@supabase/supabase-js"

// SERVER ONLY. Bypasses RLS - use sparingly and only after verifying the caller yourself.
// Used for: username -> email lookup at login, uniqueness check at signup, account deletion.
let client
export function admin() {
    if (!client) {
        if (!process.env.SUPABASE_SECRET_KEY) throw new Error("SUPABASE_SECRET_KEY is not set")
        client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
        })
    }
    return client
}
