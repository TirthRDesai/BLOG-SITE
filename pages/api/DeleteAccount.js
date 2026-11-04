import { requireSession } from "@/lib/auth"
import { admin } from "@/lib/supabase/admin"

async function removeFolder(bucket, folder) {
    const storage = admin().storage.from(bucket)
    for (;;) {
        const { data } = await storage.list(folder, { limit: 100 })
        if (!data?.length) return
        await storage.remove(data.map((f) => `${folder}/${f.name}`))
        if (data.length < 100) return
    }
}

// Deleting an auth user needs the service role. We only do it for the verified session user.
// profiles / posts / images rows / follows go away through ON DELETE CASCADE.
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed", ok: false })
    const session = await requireSession(req, res)
    if (!session) return
    const { supabase, user } = session

    try {
        await removeFolder("avatars", user.id)
        await removeFolder("post-images", user.id)

        const { error } = await admin().auth.admin.deleteUser(user.id)
        if (error) return res.status(400).json({ message: "Delete failed", ok: false })

        await supabase.auth.signOut()
        return res.status(200).json({ message: "Account deleted", ok: true })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Delete failed", ok: false })
    }
}
