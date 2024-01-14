import { createClient } from "@supabase/supabase-js"

const CryptoJs = require('crypto-js')

export default async function handler(req, res) {

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const { username, password } = req.body

    const { data, error } = await supabase
        .from('UserData')
        .select('*')
        .eq('Username', username)

    if (error) {
        console.log(error)
        return res.status(401).json({ message: error.message, ok: false })
    }

    if (data.length == 0) {
        return res.status(401).json({ message: "User not found", ok: false })
    }

    if (data[0].Password == password) {
        const out = CryptoJs.AES.encrypt(JSON.stringify(data[0]), process.env.NEXT_PUBLIC_KEY)
        return res.status(200).json({ message: "Login successful", ok: true, data: out.toString() })
    } else {
        return res.status(401).json({ message: "Incorrect password", ok: false })
    }
}