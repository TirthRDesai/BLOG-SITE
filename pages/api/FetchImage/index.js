import { createClient } from "@supabase/supabase-js"
import { DecryptData, EncryptData } from '@/pages/EncryptingFunctions'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default async function handler(req, res) {
    try {
        const { AllData } = req.body


        const DecryptedData = JSON.parse(DecryptData(AllData))[0]

        const { Filename, Path } = DecryptedData
        const { data, error } = supabase.storage.from(Path).getPublicUrl(Filename)

        console.log(data)

        if (error) {
            return res.status(401).json({ message: error, ok: false })
        }
        let base64Data = ""
        if (data.publicUrl) {
            base64Data = await getImageBase64(data.publicUrl)
        } else {
            base64Data = "Default"
        }
        console.log(base64Data)

        return res.status(200).json({ message: "Image found", ok: true, data: base64Data })
    } catch (e) {
        return res.status(500).json({ message: e, ok: false })
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
export const config = {
    api: {
        responseLimit: '8mb',
    },
}