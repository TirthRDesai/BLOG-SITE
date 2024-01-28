import { createClient } from "@supabase/supabase-js"
import { Formidable } from 'formidable'

const CryptoJs = require('crypto-js')
const fs = require('fs')

export default async function handler(req, res) {
    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        // const { Username, TextPart, Image1, Image2, Image3 } = req.body

        const { err, fields, files } = await new Promise((resolve, reject) => {
            const form = new Formidable()
            form.parse(req, (err, fields, files) => {
                if (err) reject(err)
                resolve({ fields, files })
            })
        })

        if (err) {
            console.log(err)
            return res.status(500).json({ message: "Error Occurred", ok: false })
        }

        let { Username, TextPart } = fields
        Username = Username[0]
        TextPart = TextPart[0]


        let { Image1, Image2, Image3 } = files
        Image1 = Image1[0]
        Image2 = Image2[0]
        Image3 = Image3[0]


        const response = await supabase.from("Posts").insert({
            Username: Username,
            TextPart: TextPart,
        }).select("*")

        if (response.error) {
            return res.status(401).json({ message: response.error.message, ok: false })
        }

        const selectedData = response.data

        if (Image1) {
            const { data, error } = await supabase.storage.from("posts").upload(selectedData[0].Image1 + ".jpg", (fs.createReadStream(Image1.filepath)), {
                cacheControl: '3600',
                contentType: 'image/jpeg',
                duplex: 'half',
                upsert: true
            })

            if (error) {
                console.log(error)
                return res.status(401).json({ message: error, ok: false })
            }

        }

        if (Image2) {
            const { data, error } = await supabase.storage.from("posts").upload(selectedData[0].Image2 + ".jpg", fs.createReadStream(Image2.filepath), {
                cacheControl: '3600',
                contentType: 'image/jpeg',
                duplex: 'half',
                upsert: true
            })

            if (error) {
                console.log(error)
                return res.status(401).json({ message: error, ok: false })
            }
        }

        if (Image3) {
            const { data, error } = await supabase.storage.from("posts").upload(selectedData[0].Image3 + ".jpg", fs.createReadStream(Image3.filepath), {
                cacheControl: '3600',
                contentType: 'image/jpeg',
                duplex: 'half',
                upsert: true
            })

            if (error) {
                console.log(error)
                return res.status(401).json({ message: error, ok: false })
            }
        }

        return res.status(200).json({ message: "Post Uploaded", ok: true })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error Occurred", ok: false })

    }
}


export const config = {
    api: {
        bodyParser: false
    }
}