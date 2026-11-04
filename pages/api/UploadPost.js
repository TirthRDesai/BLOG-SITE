import { Formidable } from "formidable"
import { readFile } from "fs/promises"
import { randomUUID } from "crypto"
import { requireSession } from "@/lib/auth"

const MAX_BYTES = 5 * 1024 * 1024
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed", ok: false })
    const session = await requireSession(req, res)
    if (!session) return
    const { supabase, user } = session

    try {
        const { fields, files } = await new Promise((resolve, reject) => {
            const form = new Formidable({ maxFileSize: MAX_BYTES, maxFiles: 3 })
            form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })))
        })

        const body = fields.TextPart?.[0]
        if (typeof body !== "string" || !body.trim() || body.length > 5000)
            return res.status(400).json({ message: "Post text required (max 5000 chars)", ok: false })

        const images = ["Image1", "Image2", "Image3"].map((k) => files[k]?.[0]).filter(Boolean)
        for (const img of images) {
            if (!EXT[img.mimetype])
                return res.status(400).json({ message: "Only JPEG, PNG or WebP images allowed", ok: false })
        }

        // author_id must equal auth.uid() (RLS); it comes from the verified session.
        const { data: post, error } = await supabase.from("posts").insert({ author_id: user.id, body }).select("id").single()
        if (error) return res.status(400).json({ message: "Could not create post", ok: false })

        const rollback = async (paths) => {
            if (paths.length) await supabase.storage.from("post-images").remove(paths)
            await supabase.from("posts").delete().eq("id", post.id)
        }

        const uploaded = []
        for (let i = 0; i < images.length; i++) {
            const img = images[i]
            const path = `${user.id}/${post.id}-${i}-${randomUUID()}.${EXT[img.mimetype]}`
            const { error: upErr } = await supabase.storage
                .from("post-images")
                .upload(path, await readFile(img.filepath), { contentType: img.mimetype, cacheControl: "3600" })
            if (upErr) {
                await rollback(uploaded)
                return res.status(400).json({ message: "Image upload failed", ok: false })
            }
            uploaded.push(path)
        }

        if (uploaded.length) {
            const { error: imgErr } = await supabase
                .from("post_images")
                .insert(uploaded.map((path, position) => ({ post_id: post.id, path, position })))
            if (imgErr) {
                await rollback(uploaded)
                return res.status(400).json({ message: "Could not save images", ok: false })
            }
        }

        return res.status(200).json({ message: "Post Uploaded", ok: true })
    } catch (e) {
        console.log(e)
        return res.status(400).json({ message: "Upload failed", ok: false })
    }
}

export const config = { api: { bodyParser: false } }
