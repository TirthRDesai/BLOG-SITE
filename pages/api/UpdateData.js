import { requireSession, EMAIL_RE } from "@/lib/auth"

// Edit your own account. name/bio live in `profiles` (RLS: own row, those columns only);
// email/password are managed by Supabase Auth.
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed", ok: false })
    const session = await requireSession(req, res)
    if (!session) return
    const { supabase, user } = session

    const input = req.body?.data ?? {}
    const profileUpdate = {}
    const authUpdate = {}

    if ("Name" in input) {
        if (typeof input.Name !== "string" || !input.Name.trim() || input.Name.length > 80)
            return res.status(400).json({ message: "Invalid name", ok: false })
        profileUpdate.name = input.Name.trim()
    }
    if ("Bio" in input) {
        if (typeof input.Bio !== "string" || input.Bio.length > 500)
            return res.status(400).json({ message: "Bio too long", ok: false })
        profileUpdate.bio = input.Bio
    }
    if ("Email" in input) {
        if (typeof input.Email !== "string" || !EMAIL_RE.test(input.Email))
            return res.status(400).json({ message: "Invalid email", ok: false })
        authUpdate.email = input.Email.trim()
    }
    if ("Password" in input) {
        if (typeof input.Password !== "string" || input.Password.length < 8 || input.Password.length > 128)
            return res.status(400).json({ message: "Password must be 8-128 characters", ok: false })
        authUpdate.password = input.Password
    }

    if (!Object.keys(profileUpdate).length && !Object.keys(authUpdate).length)
        return res.status(400).json({ message: "Nothing to update", ok: false })

    if (Object.keys(profileUpdate).length) {
        const { error } = await supabase.from("profiles").update(profileUpdate).eq("id", user.id)
        if (error) return res.status(400).json({ message: "Update failed", ok: false })
    }
    if (Object.keys(authUpdate).length) {
        const { error } = await supabase.auth.updateUser(authUpdate)
        if (error) return res.status(400).json({ message: error.message, ok: false })
    }
    return res.status(200).json({ message: "Data Updated", ok: true })
}
