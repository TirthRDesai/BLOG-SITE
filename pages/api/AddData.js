import { supabase, SELF_FIELDS } from "@/lib/supabaseServer"
import { hashPassword, createSession, USERNAME_RE } from "@/lib/auth"
import { EncryptData } from "@/components/EncryptingFunctions"

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed", ok: false })
    try {
        const { Password, Email, Name } = req.body ?? {}
        const Username = String(req.body?.Username ?? "").trim().toLowerCase()

        if (!USERNAME_RE.test(Username)) {
            return res.status(400).json({ message: "Username must be 3-20 characters: letters, numbers, underscore", ok: false })
        }
        if (typeof Password !== "string" || Password.length < 8 || Password.length > 128) {
            return res.status(400).json({ message: "Password must be 8-128 characters", ok: false })
        }
        if (typeof Email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email) || Email.length > 254) {
            return res.status(400).json({ message: "Invalid email", ok: false })
        }
        if (typeof Name !== "string" || !Name.trim() || Name.length > 80) {
            return res.status(400).json({ message: "Invalid name", ok: false })
        }

        const existing = await supabase.from("UserData").select("Username").eq("Username", Username)
        if (existing.error) return res.status(500).json({ message: "Signup failed", ok: false })
        if (existing.data.length > 0) return res.status(409).json({ message: "Username already taken", ok: false })

        const { data, error } = await supabase.from("UserData").insert({
            Username,
            Password: await hashPassword(Password),
            Email: Email.trim(),
            Name: Name.trim(),
            Bio: "",
            Followers: [],
            Following: [],
            Posts: [],
        }).select(SELF_FIELDS).single()

        if (error) {
            console.log(error)
            return res.status(400).json({ message: "Signup failed", ok: false })
        }

        await createSession(res, Username)
        return res.status(200).json({ message: "Signup Successful", ok: true, data: EncryptData(JSON.stringify(data)) })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Signup failed", ok: false })
    }
}
