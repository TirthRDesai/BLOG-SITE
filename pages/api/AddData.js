import { createClient } from "@/lib/supabase/server"
import { admin } from "@/lib/supabase/admin"
import { USERNAME_RE, EMAIL_RE } from "@/lib/auth"

// Signup. Supabase Auth hashes the password and owns the account; a DB trigger creates the profile.
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed", ok: false })
    try {
        const { Password, Email, Name } = req.body ?? {}
        const Username = String(req.body?.Username ?? "").trim().toLowerCase()

        if (!USERNAME_RE.test(Username))
            return res.status(400).json({ message: "Username must be 3-20 characters: letters, numbers, underscore", ok: false })
        if (typeof Password !== "string" || Password.length < 8 || Password.length > 128)
            return res.status(400).json({ message: "Password must be 8-128 characters", ok: false })
        if (typeof Email !== "string" || !EMAIL_RE.test(Email) || Email.length > 254)
            return res.status(400).json({ message: "Invalid email", ok: false })
        if (typeof Name !== "string" || !Name.trim() || Name.length > 80)
            return res.status(400).json({ message: "Invalid name", ok: false })

        const taken = await admin().from("profiles").select("id").eq("username", Username).maybeSingle()
        if (taken.data) return res.status(409).json({ message: "Username already taken", ok: false })

        const supabase = createClient(req, res)
        const { data, error } = await supabase.auth.signUp({
            email: Email.trim(),
            password: Password,
            options: { data: { username: Username, name: Name.trim() } },
        })

        if (error) {
            return res.status(400).json({ message: error.message, ok: false })
        }

        // With email confirmation enabled in production there is no session until the user confirms.
        return res.status(200).json({
            message: data.session ? "Signup Successful" : "Check your email to confirm your account",
            ok: true,
            confirmed: !!data.session,
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Signup failed", ok: false })
    }
}
