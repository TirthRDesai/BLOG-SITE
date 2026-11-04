import { requireSession } from "@/lib/auth"
import { avatarUrl, postImageUrl } from "@/lib/shapes"

const PAGE_SIZE = 50

// GET /api/GetPosts/<username | *>  (optional ?before=<ISO timestamp> for older posts)
export default async function handler(req, res) {
    const session = await requireSession(req, res)
    if (!session) return
    const { supabase, profile } = session

    const username = String(req.query.username ?? "*").toLowerCase()
    const before = typeof req.query.before === "string" ? req.query.before : null

    let query = supabase
        .from("posts")
        .select("id, created_at, body, author:profiles!posts_author_id_fkey!inner(id, username, name, avatar_path), post_images(path, position)")
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE)

    if (username !== "*") query = query.eq("author.username", username)
    if (before) query = query.lt("created_at", before)

    const { data, error } = await query
    if (error) return res.status(400).json({ message: "Could not load posts", ok: false })

    const { data: following } = await supabase.from("follows").select("followee_id").eq("follower_id", profile.id)
    const followingIds = new Set((following ?? []).map((f) => f.followee_id))

    const AllPosts = data.map((p) => {
        const images = [...(p.post_images ?? [])].sort((a, b) => a.position - b.position)
        const PostData = {
            id: p.id,
            created_at: p.created_at,
            Username: p.author.username,
            TextPart: p.body,
        }
        images.forEach((img, i) => {
            PostData["Image" + (i + 1)] = postImageUrl(supabase, img.path)
        })
        return {
            PostData,
            UserData: {
                Username: p.author.username,
                Name: p.author.name,
                ProfilePic: avatarUrl(supabase, p.author.avatar_path),
                isFollowed: followingIds.has(p.author.id),
            },
        }
    })

    return res.status(200).json({ message: "Posts found", ok: true, data: JSON.stringify(AllPosts) })
}
