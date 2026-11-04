import { supabase } from "@/lib/supabaseServer"
import { requireUser } from "@/lib/auth"

export default async function handler(req, res) {
    try {
        if (!(await requireUser(req, res))) return
        const Username = String(req.body?.Username ?? "").toLowerCase()


        let { data, error } = await supabase.from("UserData").select(
            `
            Username,
            Name,
            ProfilePic,
            Bio,
            Followers,
            Following
            `
        ).eq("Username", Username)

        if (error) {
            return res.status(401).json({ message: error.message, ok: false })
        }

        if (data.length == 0) {
            return res.status(401).json({ message: "User not found", ok: false })
        }

        const allImages = (await supabase.storage.from("profile-pictures").list()).data

        let temp = "Default"

        for (let i = 0; i < allImages.length; i++) {
            if (allImages[i].name == (data[0].ProfilePic + ".jpg")) {
                temp = allImages[i].name
                break
            }
        }

        if (temp != "Default") {
            const response = supabase.storage.from("profile-pictures").getPublicUrl(temp)

            const errorSignedURL = response.error

            if (errorSignedURL) {
                temp = "Default"
                return await res.status(200).json({ message: "User found", ok: true, data: data[0] })
            }

            temp = response.data.publicUrl

        }

        data[0].ProfilePic = temp

        return await res.status(200).json({ message: "User found", ok: true, data: data[0] })
    }
    catch (e) {
        console.log(e)
        return res.status(401).json({ message: e.message, ok: false })
    }
}