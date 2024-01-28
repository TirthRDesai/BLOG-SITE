import { createClient } from "@supabase/supabase-js"
import { DecryptData } from "../../components/EncryptingFunctions"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default async function handler(req, res) {

    try {
        const { AllData } = req.body

        const DecryptedData = JSON.parse(DecryptData(AllData)).toSendData

        let { Username, newFollowing, FriendUsername, newFollowers } = DecryptedData[0]

        if (!newFollowers) {
            newFollowers = []

            const { data, error } = await supabase.from("UserData").select("Followers").eq("Username", FriendUsername)

            if (error) {
                console.log(error)
                return res.status(401).json({ message: error, ok: false })
            }

            newFollowers = data[0].Followers.filter((data) => {
                return data != Username
            })
        }


        const { error } = await supabase.from("UserData").update({ Following: newFollowing }).eq("Username", Username)

        if (error) {
            console.log(error)
            return res.status(401).json({ message: error.message, ok: false })
        }

        const { error2 } = await supabase.from("UserData").update({ Followers: newFollowers }).eq("Username", FriendUsername)

        if (error2) {
            console.log(error2)
            return res.status(401).json({ message: error2.message, ok: false })
        }

        return res.status(200).json({ message: "Updated", ok: true })
    } catch (e) {
        console.log(e)
        return res.status(401).json({ message: e.message, ok: false })
    }
}
