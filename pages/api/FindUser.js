import { createClient } from "@supabase/supabase-js"

export default async function handler(req, res) {
    try {
        const { Username } = req.body
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)


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

        const response = await supabase.storage.from("profile-pictures").createSignedUrl(data[0].ProfilePic + ".jpg", 300)

        const errorSignedURL = response.error

        if (errorSignedURL) {
            if (errorSignedURL.message == "Object not found") {
                data[0].ImageData = "Default"
                return await res.status(200).json({ message: "User found", ok: true, data: data[0] })
            }
            else {
                return res.status(401).json({ message: errorSignedURL.message, ok: false })
            }
        }

        const signedURL = response.data.signedUrl

        data[0].ImageData = signedURL

        return await res.status(200).json({ message: "User found", ok: true, data: data[0] })
    }
    catch (e) {
        console.log(e)
        return res.status(401).json({ message: e.message, ok: false })
    }
}