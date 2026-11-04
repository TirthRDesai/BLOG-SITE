import { supabase } from "@/lib/supabaseServer"
import { requireUser } from "@/lib/auth"
import { DecryptData } from "@/components/EncryptingFunctions"

// Shared by FollowUser / Unfollow / RemoveUser.
// `me` always comes from the session. The client only says WHICH other user to act on.
// mode: "follow"   - me follows friend
//       "unfollow" - me stops following friend
//       "remove"   - friend stops following me (remove a follower)
export async function handleFollowAction(req, res, mode) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed", ok: false })
    const me = await requireUser(req, res)
    if (!me) return

    try {
        const payload = JSON.parse(DecryptData(req.body?.AllData))
        const friend = String(payload?.toSendData?.[0]?.FriendUsername ?? "").toLowerCase()

        if (!friend || friend === me) {
            return res.status(400).json({ message: "Invalid user", ok: false })
        }

        const { data, error } = await supabase
            .from("UserData")
            .select("Username, Followers, Following")
            .in("Username", [me, friend])

        if (error || !data) return res.status(500).json({ message: "Error", ok: false })
        const meRow = data.find((r) => r.Username === me)
        const friendRow = data.find((r) => r.Username === friend)
        if (!meRow || !friendRow) return res.status(404).json({ message: "User not found", ok: false })

        const add = (arr, v) => Array.from(new Set([...(arr ?? []), v]))
        const drop = (arr, v) => (arr ?? []).filter((x) => x !== v)

        let meUpdate, friendUpdate
        if (mode === "follow") {
            meUpdate = { Following: add(meRow.Following, friend) }
            friendUpdate = { Followers: add(friendRow.Followers, me) }
        } else if (mode === "unfollow") {
            meUpdate = { Following: drop(meRow.Following, friend) }
            friendUpdate = { Followers: drop(friendRow.Followers, me) }
        } else {
            meUpdate = { Followers: drop(meRow.Followers, friend) }
            friendUpdate = { Following: drop(friendRow.Following, me) }
        }

        const r1 = await supabase.from("UserData").update(meUpdate).eq("Username", me)
        if (r1.error) return res.status(400).json({ message: "Update failed", ok: false })
        const r2 = await supabase.from("UserData").update(friendUpdate).eq("Username", friend)
        if (r2.error) return res.status(400).json({ message: "Update failed", ok: false })

        return res.status(200).json({ message: "Updated", ok: true })
    } catch (e) {
        console.log(e)
        return res.status(400).json({ message: "Bad request", ok: false })
    }
}
