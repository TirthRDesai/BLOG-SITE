import { EncryptData } from "@/pages/EncryptingFunctions"
import { createClient } from "@supabase/supabase-js"

export default async function handler(req, res) {
    const { Username } = req.body
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data, error } = await supabase
        .from('UserData')
        .select('*')
        .eq('Username', Username)

    if (error) {
        return res.status(401).json({ message: error.message, ok: false })
    }

    if (data.length == 0) {
        return res.status(401).json({ message: "User not found", ok: false })
    }

    return await res.status(200).json({ message: "User found", ok: true, data: EncryptData(JSON.stringify(data[0])) })

}