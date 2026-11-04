import { supabase, PUBLIC_FIELDS, SELF_FIELDS } from "@/lib/supabaseServer"
import { requireUser } from "@/lib/auth"
import { EncryptData } from "@/components/EncryptingFunctions"

// POST { Username } - full profile for yourself, public fields for others. Never the password.
export default async function handler(req, res) {
    const me = await requireUser(req, res)
    if (!me) return
    const Username = String(req.body?.Username ?? "").toLowerCase()
    const { data, error } = await supabase
        .from("UserData")
        .select(Username === me ? SELF_FIELDS : PUBLIC_FIELDS)
        .eq("Username", Username)

    if (error) return res.status(500).json({ message: "Error", ok: false })
    if (data.length === 0) return res.status(404).json({ message: "User not found", ok: false })
    return res.status(200).json({ message: "User found", ok: true, data: EncryptData(JSON.stringify(data[0])) })
}
