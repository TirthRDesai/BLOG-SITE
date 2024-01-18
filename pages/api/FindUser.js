import { createClient } from "@supabase/supabase-js"

const CryptoJS = require("crypto-js")

export default async function handler(req, res) {
    try {
        const { Username } = req.body
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)


        const { data, error } = await supabase.from("UserData").select(
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

        const url = supabase.storage.from("profile-pictures").getPublicUrl(data[0].ProfilePic + ".jpg").data.publicUrl

        let imageData = ""

        if (url) {
            imageData = await getImageBase64(url)
        } else {
            imageData = "Default"
        }

        data[0].ImageData = imageData


        data[0].ProfilePic = CryptoJS.AES.encrypt(data[0].ProfilePic, process.env.NEXT_PUBLIC_KEY).toString()


        return await res.status(200).json({ message: "User found", ok: true, data: data[0] })
    }
    catch (e) {
        console.log(e)
        return res.status(401).json({ message: e.message, ok: false })
    }
}
function getImageBase64(url) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => {
                if (response.ok) {
                    return response.arrayBuffer()
                } else {
                    resolve("Default")
                }
            })
            .then(buffer => {
                var base64Data = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));

                resolve(base64Data);
            })
            .catch(error => {
                console.error('Error fetching the image:', error);
                reject(error);
            });
    });
}