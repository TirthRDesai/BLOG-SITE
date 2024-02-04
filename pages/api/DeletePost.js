import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { Username, PostId } = req.body;
        const { data, error } = await supabase
            .from("Posts").select(`
                Image1,
                Image2,
                Image3
            `)

        if (error) {
            return res.status(400).json({ error: error.message, ok: false });
        }

        const result = data[0]

        const urlList = (await supabase.storage.from("posts").list()).data

        let toDelete = []

        for (let i = 0; i < urlList.length; i++) {
            if (urlList[i].name.includes(result.Image1)) {
                toDelete.push(urlList[i].name)
            }
            if (urlList[i].name.includes(result.Image2)) {
                toDelete.push(urlList[i].name)
            }
            if (urlList[i].name.includes(result.Image3)) {
                toDelete.push(urlList[i].name)
            }
            if (toDelete.length == 3) {
                break
            }
        }

        for (let i = 0; i < toDelete.length; i++) {
            console.log(toDelete[i])
            const deleteResponse = await supabase.storage.from("posts").remove(toDelete[i])

            if (deleteResponse.error) {
                return res.status(400).json({ error: deleteResponse.error.message, ok: false });
            }
        }

        const { error1 } = await supabase.from("Posts").delete().eq("id", PostId)

        if (error1) {
            return res.status(400).json({ error: error1.message, ok: false });
        }

        return res.status(200).json({ message: "Deleted", ok: true });

    }
}