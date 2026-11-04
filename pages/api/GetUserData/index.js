import { requireSession } from "@/lib/auth"
import { getLegacyUser } from "@/lib/shapes"

// POST { Username } - profile of any user; email included only for yourself.
export default async function handler(req, res) {
    const session = await requireSession(req, res)
    if (!session) return
    const Username = String(req.body?.Username ?? "").toLowerCase()
    const isMe = Username === session.profile.username
    const user = await getLegacyUser(session.supabase, Username, isMe ? session.user.email : undefined)
    if (!user) return res.status(404).json({ message: "User not found", ok: false })
    return res.status(200).json({ message: "User found", ok: true, data: JSON.stringify(user) })
}
