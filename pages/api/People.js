import { requireSession } from "@/lib/auth"
import { avatarUrl } from "@/lib/shapes"

// GET /api/People?mode=suggested|search|followers|following[&q=...][&username=...]
// Returns [{ Username, Name, Bio, ProfilePic, isFollowing, isMe }]
const FIELDS = "id, username, name, bio, avatar_path"

export default async function handler(req, res) {
    const session = await requireSession(req, res)
    if (!session) return
    const { supabase, profile } = session

    const mode = String(req.query.mode ?? "suggested")
    let rows = []

    if (mode === "suggested") {
        const { data: mine } = await supabase.from("follows").select("followee_id").eq("follower_id", profile.id)
        const skip = [profile.id, ...(mine ?? []).map((f) => f.followee_id)]
        const { data } = await supabase
            .from("profiles")
            .select(FIELDS)
            .not("id", "in", `(${skip.join(",")})`)
            .order("created_at", { ascending: false })
            .limit(6)
        rows = data ?? []
    } else if (mode === "search") {
        // strip characters that have meaning in PostgREST filter syntax / LIKE patterns
        const q = String(req.query.q ?? "").replace(/[^\p{L}\p{N}_ ]/gu, "").trim().slice(0, 40)
        if (q.length < 1) return res.status(200).json({ ok: true, data: [] })
        const { data } = await supabase
            .from("profiles")
            .select(FIELDS)
            .or(`username.ilike.%${q}%,name.ilike.%${q}%`)
            .neq("id", profile.id)
            .order("username")
            .limit(20)
        rows = data ?? []
    } else if (mode === "followers" || mode === "following") {
        const username = String(req.query.username ?? profile.username).toLowerCase()
        const { data: target } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle()
        if (!target) return res.status(404).json({ ok: false, message: "User not found" })
        const followers = mode === "followers"
        const { data } = await supabase
            .from("follows")
            .select(`p:profiles!${followers ? "follows_follower_id_fkey" : "follows_followee_id_fkey"}(${FIELDS})`)
            .eq(followers ? "followee_id" : "follower_id", target.id)
            .order("created_at", { ascending: false })
            .limit(200)
        rows = (data ?? []).map((r) => r.p).filter(Boolean)
    } else {
        return res.status(400).json({ ok: false, message: "Bad mode" })
    }

    const ids = rows.map((r) => r.id)
    let following = new Set()
    if (ids.length) {
        const { data } = await supabase.from("follows").select("followee_id").eq("follower_id", profile.id).in("followee_id", ids)
        following = new Set((data ?? []).map((f) => f.followee_id))
    }

    return res.status(200).json({
        ok: true,
        data: rows.map((r) => ({
            Username: r.username,
            Name: r.name,
            Bio: r.bio,
            ProfilePic: avatarUrl(supabase, r.avatar_path),
            isFollowing: following.has(r.id),
            isMe: r.id === profile.id,
        })),
    })
}
