import { Formidable } from "formidable"
import { createReadStream } from "fs"
import { supabase } from "@/lib/supabaseServer"
import { requireUser } from "@/lib/auth"

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed", ok: false })
    const me = await requireUser(req, res)
    if (!me) return

    try {
        const { fields, files } = await new Promise((resolve, reject) => {
            const form = new Formidable({ maxFileSize: MAX_BYTES, maxFiles: 3 })
            form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })))
        })

        const TextPart = fields.TextPart?.[0]
        if (typeof TextPart !== "string" || !TextPart.trim() || TextPart.length > 5000) {
            return res.status(400).json({ message: "Post text required (max 5000 chars)", ok: false })
        }

        const images = ["Image1", "Image2", "Image3"].map((k) => files[k]?.[0] ?? null)
        for (const img of images) {
            if (img && !ALLOWED_TYPES.includes(img.mimetype)) {
                return res.status(400).json({ message: "Only JPEG, PNG or WebP images allowed", ok: false })
            }
        }

        // Username comes from the session, never from the request.
        const insert = await supabase.from("Posts").insert({ Username: me, TextPart }).select("*").single()
        if (insert.error) {
            console.log(insert.error)
            return res.status(400).json({ message: "Could not create post", ok: false })
        }
        const post = insert.data

        for (let i = 0; i < images.length; i++) {
            const img = images[i]
            if (!img) continue
            const { error } = await supabase.storage
                .from("posts")
                .upload(post["Image" + (i + 1)] + ".jpg", createReadStream(img.filepath), {
                    cacheControl: "3600",
                    contentType: img.mimetype,
                    duplex: "half",
                    upsert: false,
                })
            if (error) {
                console.log(error)
                return res.status(400).json({ message: "Image upload failed", ok: false })
            }
        }

        return res.status(200).json({ message: "Post Uploaded", ok: true })
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
