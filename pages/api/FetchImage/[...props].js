import { EncryptData } from "@/pages/EncryptingFunctions"
import { createClient } from "@supabase/supabase-js"


const axios = require("axios")
const base64Img = require("base64-img")

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default async function handler(req, res) {
    try {
        const Filename = req.query.props[0] + ".jpg"
        const Path = req.query.props[1]

        const { data, error } = supabase.storage.from(Path).getPublicUrl(Filename)

        if (error) {
            return res.status(401).json({ message: error, ok: false })
        }

        let base64Data = ""
        if (data.publicUrl) {
            try {
                base64Data = await getImageBase64(data.publicUrl)
            } catch (e) {
                console.log(e)
            }
        } else {
            base64Data = "Default"

        }

        return res.status(200).json({ message: "Image found", ok: true, data: base64Data })
    } catch (e) {
        return res.status(500).json({ message: e, ok: false })
    }
}

async function getImageBase64(imageUrl) {
    return new Promise((resolve, reject) => {
        axios.get(imageUrl, { responseType: 'arraybuffer' })
            .then(response => {
                const base64Image = Buffer.from(response.data, 'binary').toString('base64');

                resolve(base64Image)
            })
            .catch(error => {
                console.error(`Error fetching image: ${error.message}`);
                reject(error);
            });
    });
}

export const config = {
    api: {
        responseLimit: '10mb',
    },
}