import { requireSession } from "@/lib/auth"
import { getLegacyUser } from "@/lib/shapes"

export default async function handler(req, res) {
    try {
        const session = await requireSession(req, res)
        if (!session) return
        const Username = String(req.body?.Username ?? "").trim().toLowerCase()
        const user = await getLegacyUser(session.supabase, Username)
        if (!user) return res.status(404).json({ message: "User not found", ok: false })
        return res.status(200).json({ message: "User found", ok: true, data: user })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error", ok: false })
    }
}
