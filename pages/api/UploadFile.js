import { createClient } from "@supabase/supabase-js"
import { DecryptData } from "../EncryptingFunctions"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default async function handler(req, res) {
    const { AllData } = req.body

    const DecryptedData = JSON.parse(DecryptData(AllData))

    const { Username, Base64Data, Filename, Bucket } = DecryptedData

    const fileData = await convertBase64toFileFormat(Base64Data)

    const { data, error } = await supabase.storage.from(Bucket).upload(Filename, fileData, {
        cacheControl: '3600',
        upsert: true
    })

    if (error) {
        console.log(error)
        return res.status(401).json({ message: error, ok: false })
    }

    return res.status(200).json({ message: "Image uploaded", ok: true })
}

async function convertBase64toFileFormat(byteString) {
    const byteCharacters = atob(byteString)

    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)

    const file = new File([byteArray], "image.jpg", { type: "image/jpeg" })

    return file
}