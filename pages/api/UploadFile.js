import { createClient } from "@supabase/supabase-js"
import { Formidable } from 'formidable'
import { DecryptData } from "../../components/EncryptingFunctions"
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
    if (req.method === "POST") {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)


        const { err, fields, files } = await new Promise((resolve, reject) => {
            const form = new Formidable()
            form.parse(req, (err, fields, files) => {
                if (err) reject(err)
                resolve({ fields, files })
            })
        })

        if (err) {
            return res.status(500).json({ message: "Error Occurred", ok: false })
        }

        let { Username, Filename, Bucket } = fields

        let { FileData } = files

        Filename = DecryptData(Filename[0])
        Bucket = DecryptData(Bucket[0])
        FileData = FileData[0]
        Username = Username[0]

        const { data, error } = await supabase.storage.from(Bucket).upload(Filename, (require('fs').createReadStream(FileData.filepath)), {
            cacheControl: '3600',
            contentType: 'image/jpeg',
            duplex: 'half',
            upsert: true
        })

        if (error) {
            console.log(error)
            return res.status(401).json({ message: error, ok: false })
        }


        return res.status(200).json({ message: "Image uploaded", ok: true })
    } else {
        return res.status(401).json({ message: "Invalid Request", ok: false })
    }
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

export const config = {
    api: {
        bodyParser: false
    }
}