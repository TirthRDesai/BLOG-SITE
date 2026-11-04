import { supabase, PUBLIC_FIELDS, SELF_FIELDS } from "@/lib/supabaseServer"
import { requireUser } from "@/lib/auth"
import { EncryptData } from "@/components/EncryptingFunctions"

export default async function handler(req, res) {
    try {
        const me = await requireUser(req, res)
        if (!me) return
        const username = String(req.query.username ?? "").toLowerCase()

        const { data, error } = await supabase
            .from("UserData")
            .select(username === me ? SELF_FIELDS : PUBLIC_FIELDS)
            .eq("Username", username)

        if (error) return res.status(500).json({ message: "Error", ok: false })
        if (data.length === 0) return res.status(404).json({ message: "No Data Found", ok: false })

        return res.status(200).json({ message: "User found", ok: true, data: EncryptData(JSON.stringify(data[0])) })
    } catch (e) {
        return res.status(500).json({ message: "Error", ok: false })
    }
}
