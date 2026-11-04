import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Slider from 'react-slick'
import styles from '../../../styles/PostLayout.module.css'
import StaticFunctions from '@/pages/api/StaticFunctions'
import { DecryptData } from '@/components/EncryptingFunctions'
import Swal from 'sweetalert2'
import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

function PostLayout({ PostData, UserData, PostUserData, setAction, setData, setFetchOnCall }) {

    const [Data, setMainData] = useState({
        id: "",
        created_at: "",
        Username: "",
        TextPart: "",
        ImagePart: [],
        IsFollowed: "",
        ProfilePic: "",
        Name: "",
        IsFollowed: ""
    })

    const postRef = useRef()


    useEffect(() => {
        if (PostData) {
            let ImagePart = []
            if (PostData.Image1) {
                ImagePart.push(PostData.Image1)
            }
            if (PostData.Image2) {
                ImagePart.push(PostData.Image2)
            }
            if (PostData.Image3) {
                ImagePart.push(PostData.Image3)
            }
            setMainData({
                id: PostData.id,
                created_at: PostData.created_at,
                Username: PostData.Username,
                TextPart: PostData.TextPart,
                ImagePart: ImagePart,
                IsFollowed: PostData.IsFollowed,
                ProfilePic: PostUserData.ProfilePic != "Default" ? PostUserData.ProfilePic : "../../Assets/defaultProfilePicture.png",
                Name: PostUserData.Name,
                IsFollowed: UserData.Following.includes(PostUserData.Username)
            })
        }
    }, [PostData, PostUserData, UserData])

    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
    };

    const UnfollowUser = async (e, friendUsername) => {
        const button = e.target
        button.style.cursor = "wait"
        button.onclick = null
        // button.style.pointerEvents = 'none';

        const staticFunction = new StaticFunctions(UserData.Username)
        const response = await staticFunction.UnfollowUser(friendUsername, UserData.Following)

        const result = JSON.parse(DecryptData(response))
        const toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            timer: 3000,
            showConfirmButton: false,
            timerProgressBar: true
        })
        if (result.ok) {
            toast.fire({
                title: "Success",
                icon: "success",
                text: "Unfollowed Successfully"
            })
        } else {
            toast.fire({
                title: "Error",
                icon: "error",
                text: "Error Occurred"
            })
        }
        button.onclick = (e, friendUsername) => {
            UnfollowUser(e, friendUsername)
        }
        setFetchOnCall(true)
        // button.style.pointerEvents = "auto"
        button.style.cursor = "pointer"
    }

    const FollowUser = async (e, friendUsername) => {
        const button = e.target
        button.style.cursor = "wait"
        button.onclick = null
        // button.style.pointerEvents = 'none';

        const staticFunction = new StaticFunctions(UserData.Username)
        const response = await staticFunction.FollowUser(friendUsername, UserData.Following)

        const result = JSON.parse(DecryptData(response))
        const toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
        })
        if (result.ok) {
            toast.fire({
                title: "Success",
                icon: "success",
                text: "Followed Successfully",
            })
        } else {
            toast.fire({
                title: "Error",
                icon: "error",
                text: "Error Occurred"
            })
        }
        // button.style.pointerEvents = "auto"
        button.onclick = (e, friendUsername) => {
            FollowUser(e, friendUsername)
        }
        button.style.cursor = "pointer"
        setFetchOnCall(true)
    }

    // Images are now deleted server-side by /api/DeletePost (which also checks ownership).
    const DeleteImages = async () => true

    const DeletePost = async (e, postId) => {
        const button = e.target
        let isPostDeleted = false
        button.style.cursor = "wait"
        button.onclick = null
        // button.style.pointerEvents = 'none';

        const staticFunction = new StaticFunctions(UserData.Username)
        const response = await staticFunction.DeletePost(postId)

        const result = JSON.parse(DecryptData(response))


        const toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
        })

        const ImageResponse = await DeleteImages()
        if (ImageResponse && result.ok) {
            isPostDeleted = true
        }

        if (isPostDeleted) {

            toast.fire({
                title: "Success",
                icon: "success",
                text: "Post Deleted Successfully",
            })

            if (postRef.current) {
                postRef.current.style.display = "none"
            }

        } else {
            toast.fire({
                title: "Error",
                icon: "error",
                text: "Error Occurred"
            })
        }
        // button.style.pointerEvents = "auto"
        button.onclick = (e, postId) => {
            DeletePost(e, postId)
        }
        button.style.cursor = "pointer"
        setFetchOnCall(true)
    }


    return (
        <div className="flex flex-col h-fit w-full justify-center items-center">
            <div className="PostBox border-2 border-slate-600 max-w-[90%] w-[90%] min-w-[60%] flex flex-col justify-start py-4 items-start px-6 rounded-lg max-h-[350px] bg-[#F8F8FF]" id={Data.id} ref={postRef}>
                <div className="HeaderBar flex flex-row justify-start items-center w-full">
                    <div className="ProfilePic flex flex-row justify-center items-center border-2 border-black rounded-full">

                        <Image class="block h-[48px] aspect-square w-[48px] rounded-full" alt='ProfilePicture' src={Data.ProfilePic} width={400} height={400} unoptimized />


                    </div>
                    <div className="flex flex-row w-full justify-between items-center">
                        <div className="ml-2 border-collapse flex flex-col items-start justify-center">
                            <div className="Name text-slate-600 font-bold text-base">
                                {Data.Name}
                            </div>
                            <div className="Username text-slate-600 font-bold text-sm hover:underline cursor-pointer" onClick={() => {
                                if (Data.Username == UserData.Username) {
                                    setAction("EDIT")
                                    setData(UserData)
                                } else {
                                    setAction("PROFILE")
                                    setData({
                                        Username: Data.Username
                                    })
                                }
                            }}>
                                @{Data.Username}
                            </div>
                        </div>
                        <div className="ml-2 border-collapse flex flex-col items-start justify-center">
                            {
                                UserData.Username != Data.Username && Data.IsFollowed ?
                                    <Button className="bg-red-600 border-2 hover:bg-red-500 border-red-800 text-white font-semibold text-sm rounded-lg px-4 py-2" onClick={(e) => UnfollowUser(e, Data.Username)} style={{
                                        cursor: "pointer"
                                    }} >
                                        Unfollow
                                    </Button>
                                    :
                                    UserData.Username != Data.Username && !Data.IsFollowed ?
                                        <Button className="bg-green-600 border-green-800 border-2 hover:bg-green-500 text-white font-semibold text-sm rounded-lg px-4 py-2" onClick={(e) => FollowUser(e, Data.Username)} style={{
                                            cursor: "pointer"
                                        }}>
                                            Follow
                                        </Button>
                                        :
                                        <Button className="bg-red-600 border-2 hover:bg-red-500 border-red-800  text-white font-semibold text-sm rounded-lg px-4 py-2" onClick={(e) => DeletePost(e, Data.id)}>
                                            Delete
                                        </Button>

                            }
                        </div>

                    </div>
                </div>
                <div className=" w-full h-full min-w-[200px] text-slate-600 font-bold text-base mt-8 flex flex-row items-start justify-start pb-2">


                    {
                        Data.ImagePart.length > 0 ?
                            <Slider {...settings} className='w-[60%] h-full overflow-hidden'>
                                {
                                    Data.ImagePart.map((data, index) => {
                                        return (
                                            <Image key={data} className={styles.slide} alt='PostImage' src={data} width={400} height={400} unoptimized />
                                        )
                                    })
                                }
                            </Slider> : ""
                    }


                    <div className="TextPart w-full h-full min-w-[200px] text-slate-600 font-bold text-base mt-2 flex flex-row items-start justify-start ml-4">
                        <p className={styles.comment + " text-slate-600 font-bold line-clamp-4 text-base text-justify leading-6 max-h-[200px] overflow-scroll pr-4 cursor-text "} onClick={(e) => {

                            let className = e.target.className.toString();
                            if (className.includes("line-clamp-4")) {
                                e.target.className = className.replace("line-clamp-4", "line-clamp-none")
                                e.target.style.overflow = "scroll"
                            }
                            else {
                                e.target.scrollTop = 0
                                e.target.className = className.replace("line-clamp-none", "line-clamp-4")
                                e.target.style.overflow = "hidden"
                            }
                        }}>
                            {Data.TextPart}
                        </p>

                    </div>

                </div>
            </div>
        </div>
    )
}

export default PostLayout