import { clearSession } from "@/lib/auth"

export default function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" })
    clearSession(res)
    return res.status(200).json({ ok: true, message: "Logged out" })
}
