import React, { Suspense, useEffect, useRef, useState } from 'react'
import StaticFunctions from '@/pages/api/StaticFunctions';
import { DecryptData } from '@/pages/EncryptingFunctions';
import PostLayout from './PostLayout';
import styles from '../../../styles/Posts.module.css'
import useSWR from 'swr';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';


function SetPosts({ UserData }) {
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
        const staticFunctions = new StaticFunctions(UserData.Username)
        const response = await staticFunctions.GetPosts("")
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

                        // console.log("HELLO \n" + PostUserData)

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

                // return (
                //     <h1>{FinalPostData.forEach(
                //         (post) => {
                //             console.log(post)
                //             return (
                //                 <h1>{post.id}</h1>
                //             )
                //         }
                //     )}</h1>
                // )


            }
            return FinalPostData

        } else {
            return (
                <h1>Could not fetch posts.</h1>
            )
        }
    }


    const responseSWR = useSWR(
        "HELLO",
        postsFetcher,
        {
            refreshInterval: 1500 * 1000,
            refreshWhenHidden: false,
            refreshWhenOffline: false,
            revalidateOnFocus: true,
            suspense: true
        }
    )

    let SWRdata = responseSWR.data
    let SWRerror = responseSWR.error


    if (SWRerror) {
        console.log(error)
    }

    if (!SWRdata) {
        return <h1>Loading Posts SWRdata...</h1>
    }

    return (
        SWRdata.map((post) => {
            return (
                <PostLayout key={post.id} PostData={post} UserData={UserData} />
            )
        })

    )


}

function Posts({ UserData, AllPosts }) {

    return (
        <div className={styles.PostsMain + ' h-full w-full overflow-scroll overflow-x-hidden z-20 flex flex-col gap-6 pt-6 min-h-0'}>
            <ErrorBoundary fallback={<h2>Could not fetch posts.</h2>}>
                <Suspense fallback={
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
                }>

                    {
                        UserData ? <SetPosts UserData={UserData} /> :
                            <h1>Loading posts CONDITION...</h1>
                    }


                </Suspense>
            </ErrorBoundary>
        </div>
    )
}

export default Posts
