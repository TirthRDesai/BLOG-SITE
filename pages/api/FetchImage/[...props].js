
import { supabase } from "@/lib/supabaseServer"
import { requireUser } from "@/lib/auth"

const BUCKETS = ["profile-pictures", "posts"]

export default async function handler(req, res) {
    try {
        if (!(await requireUser(req, res))) return
        const Filename = JSON.parse(req.query.props[0])
        const Path = req.query.props[1]
        if (!BUCKETS.includes(Path) || !Array.isArray(Filename) || Filename.length > 20) {
            return res.status(400).json({ message: "Invalid request", ok: false })
        }

        const urls = []

        // for (let i = 0; i < Filename.length; i++) {
        //     const { data, error } = await supabase.storage
        //         .from(Path)
        //         .createSignedUrl(Filename[i], 600)

        //     if (error) {
        //         urls.push("Default")
        //         continue
        //     }
        //     else {
        //         urls.push(data.signedUrl)
        //     }
        // }

        const response = await supabase.storage.from(Path).createSignedUrls(Filename, 600)

        if (response.error) {
            if (response.error.message == "Object not found") {
                return res.status(200).json({ message: "Image not found", ok: false, data: "Default" })
            }
        }

        response.data.forEach((url) => {
            urls.push(url.signedUrl)
        })

        return res.status(200).json({ message: "Image found", ok: true, data: urls })
    } catch (e) {
        return res.status(500).json({ message: e, ok: false })
    }
}