import { createClient } from "@/lib/supabase/server"

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Verified identity (Supabase Auth checks the JWT with the auth server).
// Returns { supabase, user, profile } or null.
export async function getSession(req, res) {
    const supabase = createClient(req, res)
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) return null
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, name")
        .eq("id", data.user.id)
        .maybeSingle()
    if (!profile) return null
    return { supabase, user: data.user, profile }
}

// For API routes: responds 401 and returns null when not logged in.
export async function requireSession(req, res) {
    const session = await getSession(req, res)
    if (!session) {
        res.status(401).json({ message: "Not authenticated", ok: false })
        return null
    }
    return session
}
