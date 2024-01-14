import { createClient } from "@supabase/supabase-js"

const CryptoJS = require("crypto-js")

export default async function handler(req, res) {

    const { data, Username } = req.body

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const { error } = await supabase.from("UserData").update(data).eq("Username", Username)

    if (error) {
        return res.status(401).json({ message: error.message, ok: false })
    }

    return res.status(200).json({ message: "Data Updated", ok: true })
}