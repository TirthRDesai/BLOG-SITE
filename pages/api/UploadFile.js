import { Formidable } from "formidable"
import { readFile } from "fs/promises"
import { randomUUID } from "crypto"
import { requireSession } from "@/lib/auth"
import { avatarUrl } from "@/lib/shapes"

const MAX_BYTES = 2 * 1024 * 1024
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }

// Profile picture upload. Path is always <your-user-id>/<random>; storage RLS enforces the folder.
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Invalid Request", ok: false })
    const session = await requireSession(req, res)
    if (!session) return
    const { supabase, user } = session

    try {
        const { files } = await new Promise((resolve, reject) => {
            const form = new Formidable({ maxFileSize: MAX_BYTES, maxFiles: 1 })
            form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })))
        })

        const file = files.FileData?.[0]
        if (!file) return res.status(400).json({ message: "No file", ok: false })
        if (!EXT[file.mimetype]) return res.status(400).json({ message: "Only JPEG, PNG or WebP images allowed", ok: false })

        const { data: current } = await supabase.from("profiles").select("avatar_path").eq("id", user.id).single()

        const path = `${user.id}/${randomUUID()}.${EXT[file.mimetype]}`
        const { error } = await supabase.storage
            .from("avatars")
            .upload(path, await readFile(file.filepath), { contentType: file.mimetype, cacheControl: "3600" })
        if (error) return res.status(400).json({ message: "Upload failed", ok: false })

        const { error: updErr } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", user.id)
        if (updErr) {
            await supabase.storage.from("avatars").remove([path])
            return res.status(400).json({ message: "Upload failed", ok: false })
        }

        if (current?.avatar_path) await supabase.storage.from("avatars").remove([current.avatar_path])

        return res.status(200).json({ message: "Image uploaded", ok: true, url: avatarUrl(supabase, path) })
    } catch (e) {
        console.log(e)
        return res.status(400).json({ message: "Upload failed", ok: false })
    }
}

export const config = { api: { bodyParser: false } }
