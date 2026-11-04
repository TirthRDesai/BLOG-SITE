import { supabase } from "@/lib/supabaseServer"
import { requireUser, hashPassword } from "@/lib/auth"

// Only the logged-in user can change their own account, and only these fields.
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed", ok: false })
    const me = await requireUser(req, res)
    if (!me) return

    const input = req.body?.data ?? {}
    const update = {}

    if ("Name" in input) {
        if (typeof input.Name !== "string" || !input.Name.trim() || input.Name.length > 80)
            return res.status(400).json({ message: "Invalid name", ok: false })
        update.Name = input.Name.trim()
    }
    if ("Bio" in input) {
        if (typeof input.Bio !== "string" || input.Bio.length > 500)
            return res.status(400).json({ message: "Bio too long", ok: false })
        update.Bio = input.Bio
    }
    if ("Email" in input) {
        if (typeof input.Email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.Email))
            return res.status(400).json({ message: "Invalid email", ok: false })
        update.Email = input.Email.trim()
    }
    if ("Password" in input) {
        if (typeof input.Password !== "string" || input.Password.length < 8 || input.Password.length > 128)
            return res.status(400).json({ message: "Password must be 8-128 characters", ok: false })
        update.Password = await hashPassword(input.Password)
    }

    if (Object.keys(update).length === 0) {
        return res.status(400).json({ message: "Nothing to update", ok: false })
    }

    const { error } = await supabase.from("UserData").update(update).eq("Username", me)
    if (error) return res.status(400).json({ message: "Update failed", ok: false })
    return res.status(200).json({ message: "Data Updated", ok: true })
}
