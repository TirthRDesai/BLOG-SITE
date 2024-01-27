import React, { Suspense, useEffect, useRef, useState } from 'react'
import StaticFunctions from '@/pages/api/StaticFunctions';
import { DecryptData } from '@/pages/EncryptingFunctions';
import PostLayout from './PostLayout';
import styles from '../../../styles/Posts.module.css'
import useSWR, { mutate } from 'swr';
import Swal from 'sweetalert2';

const FallbackComp = () => {
    return (
        <div className="flex flex-col gap-4 w-full h-full items-center justify-start overscroll-auto">
            <div className="flex gap-4 items-center w-[80%]">
                <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                <div className="flex flex-col gap-4">
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-4 w-28"></div>
                </div>
            </div>
            <div className="skeleton min-h-32 w-[80%]"></div>

            <div className="flex mt-4 gap-4 items-center w-[80%]">
                <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                <div className="flex flex-col gap-4">
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-4 w-28"></div>
                </div>
            </div>
            <div className="skeleton min-h-32 w-[80%]"></div>

            <div className="flex mt-4 gap-4 items-center w-[80%]">
                <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                <div className="flex flex-col gap-4">
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-4 w-28"></div>
                </div>
            </div>
            <div className="skeleton min-h-32 w-[80%]"></div>
        </div>
    )
}

const ErrorComp = ({ error }) => {
    return (
        <h1>Error Occured: <br />{error.toString()}</h1>
    )
}

function Posts({ UserData, PostsUser }) {

    const [SWRdata, setSWRdata] = useState([])

    const [SWRerror, setSWRerror] = useState("")

    const [key, setKey] = useState("AllPosts")

    const [showFallback, setShowFallback] = useState(true)

    useEffect(() => {
        if (key != PostsUser && PostsUser != null) {
            setShowFallback(true)
            if (PostsUser == "*") {
                setKey("AllPosts")
            }
            else {
                setKey(PostsUser + "Posts")
            }
            setSWRdata([])
        }
    }, [PostsUser, key])

    const getUserData = async (Username) => {
        const staticFunctions = new StaticFunctions(Username)
        const response = await staticFunctions.GetData()
        const data = await JSON.parse(DecryptData(response))
        if (data.ok) {
            const result = await JSON.parse(DecryptData(data.data))
            return result
        } else {
            return {}
        }
    }

    const postsFetcher = async () => {
        if (UserData != null) {
            const staticFunctions = new StaticFunctions(UserData.Username)
            const response = await staticFunctions.GetPosts(PostsUser)
            const data = await JSON.parse(DecryptData(response))


            const FetchImage = async (Filename, Path) => {

                const ImageData = await fetch("/api/FetchImage/" + Filename + "/" + Path, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(res => {
                    if (res.ok) {
                        return res.json()
                    } else {
                        return "Default"
                    }

                }).then(result => {
                    if (result.ok) {
                        return result.data
                    } else {
                        return "Default"
                    }
                })

                return ImageData
            }

            if (data.ok) {
                const AllPosts = JSON.parse(DecryptData(data.data))

                let FinalPostData = []

                for (let index = 0; index < AllPosts.length; index++) {

                    const Posts = AllPosts[index]

                    let ImagePart = []

                    if (Posts && Posts.id != "") {
                        let imageData = ""

                        if (Posts.Image1 != "NOIMAGE") {
                            imageData = await FetchImage(Posts.Image1, "posts")
                            ImagePart.push("data:image/jpeg;base64," + imageData)
                            if (Posts.Image2 != "NOIMAGE") {
                                imageData = await FetchImage(Posts.Image2, "posts")
                                ImagePart.push("data:image/jpeg;base64," + imageData)
                                if (Posts.Image3 != "NOIMAGE") {
                                    imageData = await FetchImage(Posts.Image3, "posts")
                                    ImagePart.push("data:image/jpeg;base64," + imageData)
                                }
                            }


                            const PostUserData = await getUserData(Posts.Username)

                            let ProfilePicSrc = "../../Assets/defaultProfilePicture.png"

                            if (PostUserData != {}) {
                                const imageData = await FetchImage(PostUserData.ProfilePic, "profile-pictures")


                                if (imageData == "Default") {
                                    ProfilePicSrc = "../../Assets/defaultProfilePicture.png"
                                } else {
                                    ProfilePicSrc =
                                        "data:image/jpeg;base64," + imageData
                                }
                            }

                            let toAppendData = {
                                id: Posts.id,
                                created_at: Posts.created_at,
                                Username: Posts.Username,
                                TextPart: Posts.TextPart,
                                ImagePart: ImagePart,
                                IsFollowed: UserData.Following.includes(Posts.Username),
                                ProfilePicSrc: ProfilePicSrc,
                                Name: PostUserData.Name,
                                IsFollowed: PostUserData.Followers.includes(UserData.Username)
                            }


                            FinalPostData.push(toAppendData)
                        }
                    }

                }
                return FinalPostData

            } else {
                return (
                    <h1>Could not fetch posts.</h1>
                )
            }
        } else {
            throw new Error("UserData is Not Loaded")
        }
    }


    const { data, error } = useSWR(
        key,
        postsFetcher,
        {
            refreshInterval: 150000 * 1000,
            refreshWhenHidden: false,
            refreshWhenOffline: false,
            revalidateOnFocus: false,
            revalidateOnMount: false,
            revalidateOnReconnect: false,
            shouldRetryOnError: true,
            errorRetryInterval: 5000,
            errorRetryCount: 2,
        }
    )

    useEffect(() => {
        if (data != null) {
            setShowFallback(false)
            setSWRdata(data)
        } else {
            setShowFallback(true)
            setSWRdata(null)
        }
    }, [data])

    useEffect(() => {
        if (error) {
            setSWRerror(error)
        }
    }, [error])


    if (!SWRdata) {
        return (
            <div className={styles.PostsMain + ' h-full w-full overflow-scroll overflow-x-hidden z-20 flex flex-col gap-6 pt-6 min-h-0'}>
                <FallbackComp />
            </div>
        )
    }


    if (SWRerror) {
        if (SWRerror.message != "UserData is Not Loaded") {
            return (
                <ErrorComp error={SWRerror} />
            )
        }
    }





    return (
        <div className={styles.PostsMain + ' h-full w-full overflow-scroll overflow-x-hidden z-20 flex flex-col gap-6 pt-6 min-h-0'}>
            {
                showFallback ? <FallbackComp /> :
                    SWRdata.length > 0 ? SWRdata.map((post) => {
                        return (
                            <PostLayout key={post.id} PostData={post} UserData={UserData} />
                        )
                    }) : ""
            }
        </div>
    )
}

export default Posts
