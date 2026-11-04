import { createClient } from "@/lib/supabase/server"

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" })
    await createClient(req, res).auth.signOut()
    return res.status(200).json({ ok: true, message: "Logged out" })
}
