import { supabase } from "@/lib/supabaseServer"
import { requireUser } from "@/lib/auth"
import { DecryptData, EncryptData } from '@/components/EncryptingFunctions'

const BUCKETS = ["profile-pictures", "posts"]

export default async function handler(req, res) {
    try {
        if (!(await requireUser(req, res))) return
        const { AllData } = req.body


        const DecryptedData = JSON.parse(DecryptData(AllData))[0]

        const { Filename, Path } = DecryptedData
        if (!BUCKETS.includes(Path) || typeof Filename !== "string" || Filename.includes("..")) {
            return res.status(400).json({ message: "Invalid request", ok: false })
        }
        const { data, error } = await supabase.storage.from(Path).createSignedUrl(Filename, 600)

        if (error) {
            return res.status(401).json({ message: error, ok: false, data: "Default" })
        }

        return res.status(200).json({ message: "Image found", ok: true, data: data.signedUrl })

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