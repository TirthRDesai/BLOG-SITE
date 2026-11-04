import { requireSession } from "@/lib/auth"
import { getLegacyUser } from "@/lib/shapes"

export default async function handler(req, res) {
    try {
        const session = await requireSession(req, res)
        if (!session) return
        const username = String(req.query.username ?? "").toLowerCase()
        const isMe = username === session.profile.username
        const user = await getLegacyUser(session.supabase, username, isMe ? session.user.email : undefined)
        if (!user) return res.status(404).json({ message: "No Data Found", ok: false })
        return res.status(200).json({ message: "User found", ok: true, data: JSON.stringify(user) })
    } catch (e) {
        return res.status(500).json({ message: "Error", ok: false })
    }
}
