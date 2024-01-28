import { ServerSideCookies } from "@/components/CustomCookie"
import { EncryptData } from "@/components/EncryptingFunctions"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)


export default async function handler(req, res) {

    const { username } = req.query
    let response = null

    if (username == "*") {
        response = await supabase.from("Posts").select("*")
    }
    else {
        response = await supabase.from("Posts").select("*").eq("Username", username)
    }

    if (response.error) {
        return res.status(401).json({ message: response.error.message, ok: false })
    }

    const allPfpsResponse = await supabase.storage.from("profile-pictures").list()

    const allPostsImageResponse = await supabase.storage.from("posts").list()


    if (allPfpsResponse.error) {
        return res.status(401).json({ message: allPfpsResponse.error.message, ok: false })
    }

    if (allPostsImageResponse.error) {
        return res.status(401).json({ message: allPostsImageResponse.error.message, ok: false })
    }

    const allPfps = []

    for (let i = 0; i < allPfpsResponse.data.length; i++) {
        if (allPfpsResponse.data[i].name != ".emptyFolderPlaceholder") {
            allPfps.push(allPfpsResponse.data[i].name)
        }
    }

    const allPostsImages = []

    for (let i = 0; i < allPostsImageResponse.data.length; i++) {
        if (allPostsImageResponse.data[i].name != ".emptyFolderPlaceholder") {
            allPostsImages.push(allPostsImageResponse.data[i].name)
        }
    }

    const data = response.data

    const AllPosts = []

    const serverSideCookies = new ServerSideCookies(req, res)

    const mainUsername = serverSideCookies.getCustomCookie("Username")

    for (let i = 0; i < data.length; i++) {
        const PostData = data[i]
        var UserData = await getUserData(data[i].Username)
        if (UserData == null) {
            continue
        }

        if (allPfps.includes(UserData.ProfilePic + ".jpg")) {
            const { data, error } = supabase.storage.from("profile-pictures").getPublicUrl(UserData.ProfilePic + ".jpg", 600)
            if (error) {
                console.log(error)
                UserData.ProfilePic = "Default"
            }
            else {
                UserData.ProfilePic = data.publicUrl
            }
        } else {
            UserData.ProfilePic = "Default"
        }

        if (UserData.Followers.includes(mainUsername)) {
            UserData.isFollowed = true
        } else {
            UserData.isFollowed = false
        }
        delete (UserData["Followers"])

        if (allPostsImages.includes(PostData.Image1 + ".jpg")) {
            const { data, error } = supabase.storage.from("posts").getPublicUrl(PostData.Image1 + ".jpg", 600)
            if (error) {
                delete (PostData["Image1"])
            }
            else {
                PostData.Image1 = data.publicUrl
            }
        }
        else {
            delete (PostData["Image1"])
        }

        if (allPostsImages.includes(PostData.Image2 + ".jpg")) {
            const { data, error } = supabase.storage.from("posts").getPublicUrl(PostData.Image2 + ".jpg", 600)
            if (error) {
                delete (PostData["Image2"])
            }
            else {
                PostData.Image2 = data.publicUrl
            }
        }
        else {
            delete (PostData["Image2"])
        }

        if (allPostsImages.includes(PostData.Image3 + ".jpg")) {
            const { data, error } = supabase.storage.from("posts").getPublicUrl(PostData.Image3 + ".jpg", 600)
            if (error) {
                delete (PostData["Image3"])
            }
            else {
                PostData.Image3 = data.publicUrl
            }
        }
        else {
            delete (PostData["Image3"])
        }

        AllPosts.push({
            PostData: PostData,
            UserData: UserData
        })
    }

    const endTime = new Date().getTime()

    return res.status(200).json({ message: "Posts found", ok: true, data: JSON.stringify(AllPosts) })

}



const getUserData = async (Username) => {
    const { data, error } = await supabase.from("UserData").select(`
        Username,
        ProfilePic,
        Name,
        Followers
    `).eq("Username", Username)

    if (error) {
        return null
    }

    return data[0]
}

/* 
PostData = {
    id: id,
    Username: Username,
    TextPart: TextPart,
    Image1: Image1,
    Image2: Image2,
    Image3: Image3,
    created_at: timestamp,
}
UserData = {
    Username: Username,
    ProfilePicture: SignedURL,
    Name: "Name",
    isFollowed: true/false,
 } */