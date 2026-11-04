import { createClient } from "@/lib/supabase/server"
import { admin } from "@/lib/supabase/admin"

// Login with username (or email) + password.
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed", ok: false })

    const identifier = String(req.body?.username ?? "").trim().toLowerCase()
    const password = req.body?.password
    const fail = () => res.status(401).json({ message: "Incorrect username or password", ok: false })

    if (!identifier || typeof password !== "string" || !password) return fail()

    try {
        let email = identifier
        if (!identifier.includes("@")) {
            // Supabase Auth signs in by email; resolve the username server-side only.
            const { data: profile } = await admin().from("profiles").select("id").eq("username", identifier).maybeSingle()
            if (!profile) return fail()
            const { data: u } = await admin().auth.admin.getUserById(profile.id)
            if (!u?.user?.email) return fail()
            email = u.user.email
        }

        const supabase = createClient(req, res)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) return fail()

        return res.status(200).json({ message: "Login successful", ok: true })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Login failed", ok: false })
    }
}
