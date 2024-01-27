
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default async function handler(req, res) {
    try {
        const Filename = req.query.props[0] + ".jpg"
        const Path = req.query.props[1]

        const { data, error } = await supabase.storage.from(Path).createSignedUrl(Filename, 600)


        if (error) {
            return res.status(401).json({ message: error, ok: false })
        }

        return res.status(200).json({ message: "Image found", ok: true, data: data.signedUrl })
    } catch (e) {
        return res.status(500).json({ message: e, ok: false })
    }
}