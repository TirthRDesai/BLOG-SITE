import { supabase, SELF_FIELDS } from "@/lib/supabaseServer"
import { verifyPassword, hashPassword, createSession } from "@/lib/auth"
import { EncryptData } from "@/components/EncryptingFunctions"

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed", ok: false })

    const username = String(req.body?.username ?? "").trim().toLowerCase()
    const password = req.body?.password

    const { data, error } = await supabase
        .from("UserData")
        .select(SELF_FIELDS + ", Password")
        .eq("Username", username)

    if (error) {
        console.log(error)
        return res.status(500).json({ message: "Login failed", ok: false })
    }

    // Same message for unknown user / wrong password (no user enumeration).
    const fail = () => res.status(401).json({ message: "Incorrect username or password", ok: false })
    if (data.length === 0) return fail()

    const { Password: stored, ...user } = data[0]
    const result = await verifyPassword(stored, password)
    if (!result.ok) return fail()

    if (result.needsUpgrade) {
        await supabase.from("UserData").update({ Password: await hashPassword(password) }).eq("Username", username)
    }

    await createSession(res, user.Username)
    return res.status(200).json({ message: "Login successful", ok: true, data: EncryptData(JSON.stringify(user)) })
}
