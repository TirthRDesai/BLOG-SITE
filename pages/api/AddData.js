import { createClient } from "@supabase/supabase-js"

const CryptoJS = require('crypto-js')
export default async function handler(req, res) {
    try {
        const { Username, Password, Email, Name } = req.body
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        const userdata = {
            Username: Username,
            Password: Password,
            Email: Email,
            Name: Name,
            Bio: "",
            Followers: [],
            Following: [],
            Posts: []
        }

        const { data, error } = await supabase.from("UserData").insert(userdata)

        if (error) {
            return res.status(401).json({ message: error.message, ok: false })
        }


        const out = CryptoJS.AES.encrypt(JSON.stringify(userdata), process.env.NEXT_PUBLIC_KEY)

        return res.status(200).json({ message: "Signup Successful", ok: true, data: out.toString() })
    } catch (e) {
        console.log(e)
        return res.status(401).json({ message: e.message, ok: false })
    }
}