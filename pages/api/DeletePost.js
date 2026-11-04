import { requireSession } from "@/lib/auth"

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed", ok: false })
    const session = await requireSession(req, res)
    if (!session) return
    const { supabase, user } = session

    const PostId = String(req.body?.PostId ?? "")
    if (!/^[0-9a-f-]{36}$/i.test(PostId)) return res.status(400).json({ message: "Invalid PostId", ok: false })

    const { data: post } = await supabase
        .from("posts")
        .select("id, author_id, post_images(path)")
        .eq("id", PostId)
        .maybeSingle()

    if (!post) return res.status(404).json({ message: "Post not found", ok: false })
    if (post.author_id !== user.id) return res.status(403).json({ message: "Not your post", ok: false })

    // RLS only allows deleting your own post; image rows cascade.
    const { error } = await supabase.from("posts").delete().eq("id", PostId)
    if (error) return res.status(400).json({ message: "Delete failed", ok: false })

    const paths = (post.post_images ?? []).map((i) => i.path)
    if (paths.length) await supabase.storage.from("post-images").remove(paths)

    return res.status(200).json({ message: "Deleted", ok: true })
}
