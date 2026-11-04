import { supabase } from "@/lib/supabaseServer"
import { requireUser } from "@/lib/auth"

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed", ok: false })
    const me = await requireUser(req, res)
    if (!me) return

    const { PostId } = req.body ?? {}
    if (PostId === undefined || PostId === null || PostId === "") {
        return res.status(400).json({ message: "PostId required", ok: false })
    }

    // Look up THIS post and verify the caller owns it.
    const { data, error } = await supabase
        .from("Posts")
        .select("id, Username, Image1, Image2, Image3")
        .eq("id", PostId)
        .maybeSingle()

    if (error) return res.status(500).json({ message: "Error", ok: false })
    if (!data) return res.status(404).json({ message: "Post not found", ok: false })
    if (data.Username !== me) return res.status(403).json({ message: "Not your post", ok: false })

    const paths = [data.Image1, data.Image2, data.Image3].filter(Boolean).map((n) => n + ".jpg")
    if (paths.length > 0) {
        const { error: rmError } = await supabase.storage.from("posts").remove(paths)
        if (rmError) console.log(rmError)
    }

    const del = await supabase.from("Posts").delete().eq("id", PostId)
    if (del.error) return res.status(400).json({ message: "Delete failed", ok: false })

    return res.status(200).json({ message: "Deleted", ok: true })
}
