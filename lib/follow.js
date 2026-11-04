import { requireSession } from "@/lib/auth"

// Shared by FollowUser / Unfollow / RemoveUser. Body: { FriendUsername }.
// The caller is always the session user; the client only names the OTHER user.
//   follow   - me follows friend
//   unfollow - me stops following friend
//   remove   - friend stops following me
// RLS also enforces this (you can only insert follows as yourself).
export async function handleFollowAction(req, res, mode) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed", ok: false })
    const session = await requireSession(req, res)
    if (!session) return
    const { supabase, profile } = session

    const friendUsername = String(req.body?.FriendUsername ?? "").toLowerCase()
    if (!friendUsername || friendUsername === profile.username)
        return res.status(400).json({ message: "Invalid user", ok: false })

    const { data: friend } = await supabase.from("profiles").select("id").eq("username", friendUsername).maybeSingle()
    if (!friend) return res.status(404).json({ message: "User not found", ok: false })

    let result
    if (mode === "follow") {
        result = await supabase
            .from("follows")
            .upsert({ follower_id: profile.id, followee_id: friend.id }, { onConflict: "follower_id,followee_id", ignoreDuplicates: true })
    } else if (mode === "unfollow") {
        result = await supabase.from("follows").delete().eq("follower_id", profile.id).eq("followee_id", friend.id)
    } else {
        result = await supabase.from("follows").delete().eq("follower_id", friend.id).eq("followee_id", profile.id)
    }

    if (result.error) return res.status(400).json({ message: "Update failed", ok: false })
    return res.status(200).json({ message: "Updated", ok: true })
}
