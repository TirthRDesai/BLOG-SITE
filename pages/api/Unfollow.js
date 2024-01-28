import { createClient } from "@supabase/supabase-js"
import { DecryptData } from "../../components/EncryptingFunctions"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default async function handler(req, res) {
    const { AllData } = req.body

    const DecryptedData = JSON.parse(DecryptData(AllData)).toSendData

    const { Username, newFollowing, FriendUsername } = DecryptedData[0]

    const { error } = await supabase.from("UserData").update({ Following: newFollowing }).eq("Username", Username)

    if (error) {
        console.log(error)
        return res.status(401).json({ message: error.message, ok: false })
    }

    const { data, error2 } = await supabase.from("UserData").select("Followers").eq("Username", FriendUsername)

    if (error2) {
        console.log(error2)
        return res.status(401).json({ message: error2.message, ok: false })
    }

    const newFollowers = data[0].Followers.filter((data) => {
        return data != Username
    })

    const { error3 } = await supabase.from("UserData").update({ Followers: newFollowers }).eq("Username", FriendUsername)

    if (error3) {
        console.log(error3)
        return res.status(401).json({ message: error3.message, ok: false })
    }

    return res.status(200).json({ message: "Updated", ok: true })
}
