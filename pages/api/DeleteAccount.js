import { supabase } from "@/lib/supabaseServer"
import { requireUser, clearSession } from "@/lib/auth"

// Replaces the old client-side deletion that used the public anon key from the browser.
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed", ok: false })
    const me = await requireUser(req, res)
    if (!me) return

    const posts = await supabase.from("Posts").select("id, Image1, Image2, Image3").eq("Username", me)
    if (posts.error) return res.status(500).json({ message: "Error", ok: false })

    const paths = posts.data
        .flatMap((p) => [p.Image1, p.Image2, p.Image3])
        .filter(Boolean)
        .map((n) => n + ".jpg")
    if (paths.length > 0) await supabase.storage.from("posts").remove(paths)
    await supabase.from("Posts").delete().eq("Username", me)

    const user = await supabase.from("UserData").select("ProfilePic").eq("Username", me).maybeSingle()
    if (user.data?.ProfilePic) {
        await supabase.storage.from("profile-pictures").remove([user.data.ProfilePic + ".jpg"])
    }

    // Remove from everyone else's follower/following lists.
    const others = await supabase
        .from("UserData")
        .select("Username, Followers, Following")
        .or(`Followers.cs.{${me}},Following.cs.{${me}}`)
    for (const o of others.data ?? []) {
        await supabase.from("UserData").update({
            Followers: (o.Followers ?? []).filter((x) => x !== me),
            Following: (o.Following ?? []).filter((x) => x !== me),
        }).eq("Username", o.Username)
    }

    const del = await supabase.from("UserData").delete().eq("Username", me)
    if (del.error) return res.status(400).json({ message: "Delete failed", ok: false })

    clearSession(res)
    return res.status(200).json({ message: "Account deleted", ok: true })
}
