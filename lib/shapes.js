// Adapters from the normalized DB schema to the shapes the dashboard UI already expects.

export const avatarUrl = (supabase, path) =>
    path ? supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl : "Default"

export const postImageUrl = (supabase, path) =>
    supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl

// Public profile + follower/following username lists. `email` only for the user themself.
export async function getLegacyUser(supabase, username, email) {
    const { data: p, error } = await supabase
        .from("profiles")
        .select("id, username, name, bio, avatar_path, created_at")
        .eq("username", username)
        .maybeSingle()
    if (error || !p) return null

    const [followers, following] = await Promise.all([
        supabase.from("follows").select("u:profiles!follows_follower_id_fkey(username)").eq("followee_id", p.id),
        supabase.from("follows").select("u:profiles!follows_followee_id_fkey(username)").eq("follower_id", p.id),
    ])

    const out = {
        id: p.id,
        created_at: p.created_at,
        Username: p.username,
        Name: p.name,
        Bio: p.bio,
        ProfilePic: avatarUrl(supabase, p.avatar_path),
        Followers: (followers.data ?? []).map((r) => r.u?.username).filter(Boolean),
        Following: (following.data ?? []).map((r) => r.u?.username).filter(Boolean),
        Posts: [],
    }
    if (email !== undefined) out.Email = email
    return out
}
