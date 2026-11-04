import { Formidable } from "formidable"
import { createReadStream } from "fs"
import { supabase } from "@/lib/supabaseServer"
import { requireUser } from "@/lib/auth"

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

// Profile picture upload ONLY. The target bucket and filename are decided on the server
// (the caller's own ProfilePic id), so clients cannot overwrite arbitrary files.
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Invalid Request", ok: false })
    const me = await requireUser(req, res)
    if (!me) return

    try {
        const { files } = await new Promise((resolve, reject) => {
            const form = new Formidable({ maxFileSize: MAX_BYTES, maxFiles: 1 })
            form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })))
        })

        const file = files.FileData?.[0]
        if (!file) return res.status(400).json({ message: "No file", ok: false })
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            return res.status(400).json({ message: "Only JPEG, PNG or WebP images allowed", ok: false })
        }

        const user = await supabase.from("UserData").select("ProfilePic").eq("Username", me).maybeSingle()
        if (user.error || !user.data?.ProfilePic) {
            return res.status(400).json({ message: "Profile not found", ok: false })
        }

        const { error } = await supabase.storage
            .from("profile-pictures")
            .upload(user.data.ProfilePic + ".jpg", createReadStream(file.filepath), {
                cacheControl: "3600",
                contentType: file.mimetype,
                duplex: "half",
                upsert: true,
            })

        if (error) {
            console.log(error)
            return res.status(400).json({ message: "Upload failed", ok: false })
        }
        return res.status(200).json({ message: "Image uploaded", ok: true })
    } catch (e) {
        console.log(e)
        return res.status(400).json({ message: "Upload failed", ok: false })
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
}
