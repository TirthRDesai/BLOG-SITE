import { EncryptData } from "@/pages/EncryptingFunctions"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)


export default async function handler(req, res) {

    const { username } = req.query

    let data = ""
    let error = ""

    if (username != "*") {
        const response = await supabase
            .from('Posts')
            .select('*')
            .eq('Username', username)

        data = response.data
        error = response.error
    } else {
        const response = await supabase
            .from('Posts')
            .select('*')

        data = response.data
        error = response.error
    }

    if (error) {
        return res.status(401).json({ message: error.message, ok: false })
    }

    if (data.length == 0) {
        return res.status(401).json({ message: "No Data Found", ok: false })
    }

    return res.status(200).json({ message: "User found", ok: true, data: EncryptData(JSON.stringify(data)) })

}
