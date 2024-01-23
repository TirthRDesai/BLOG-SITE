import { EncryptData } from "@/pages/EncryptingFunctions"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default async function handler(req, res) {

    try {
        const { username } = req.query

        const { data, error } = await supabase
            .from('UserData')
            .select('*')
            .eq('Username', username)

        if (error) {
            return res.status(401).json({ message: error.message, ok: false })
        }

        if (data.length == 0) {
            return res.status(401).json({ message: "No Data Found", ok: false })
        }

        return res.status(200).json({ message: "User found", ok: true, data: EncryptData(JSON.stringify(data[0])) })
    } catch (e) {
        return res.status(500).json({ message: e, ok: false })
    }
}