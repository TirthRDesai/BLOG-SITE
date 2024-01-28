import { createClient } from "@supabase/supabase-js"
const CryptoJs = require('crypto-js')

export default async function handler(req, res) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const { Username, TextPart, Image1, Image2, Image3 } = req.body

    const response = await supabase.from("Posts").insert({
        Username: Username,
        TextPart: TextPart,
    }).select("*")

    if (response.error) {
        return res.status(401).json({ message: response.error.message, ok: false })
    }

    const data = response.data



    if (Image1) {
        const file1 = await convertBase64toFileFormat(Image1)
        const response = await supabase.storage.from("posts").upload(data[0].Image1 + ".jpg", file1, {
            cacheControl: '3600',
            contentType: 'image/jpeg',
            upsert: false
        })

        console.log(response)

        if (response.error) {
            return res.status(401).json({ message: response.error.message, ok: false })
        }

        console.log(response.data.path)
    }

    if (Image2) {
        const file2 = await convertBase64toFileFormat(Image2)
        const response = await supabase.storage.from("posts").upload(data[0].Image2 + ".jpg", file2, {
            cacheControl: '3600',
            contentType: 'image/jpeg',
            upsert: false
        })

        if (response.error) {
            return res.status(401).json({ message: response.error.message, ok: false })
        }

        console.log(response.data.path)
    }

    if (Image3) {
        const file3 = await convertBase64toFileFormat(Image3)
        const response = await supabase.storage.from("posts").upload(data[0].Image3 + ".jpg", file3, {
            cacheControl: '3600',
            contentType: 'image/jpeg',
            upsert: false
        })

        if (response.error) {
            return res.status(401).json({ message: response.error.message, ok: false })
        }

        console.log(response.data.path)
    }

    return res.status(200).json({ message: "Post Uploaded", ok: true })

}

async function convertBase64toFileFormat(base64) {
    const base64Parts = base64.split(',')
    const base64EncodedString = base64Parts[1]
    const byteCharacters = atob(base64EncodedString)

    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)

    const file = new File([byteArray], "image.jpg", { type: "image/jpeg" })

    return file
}


export const config = {
    api: {
        bodyParser: {
            sizeLimit: '100mb',
        }
    }
}