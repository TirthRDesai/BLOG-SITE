import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Slider from 'react-slick'
import styles from '../../../styles/PostLayout.module.css'
import StaticFunctions from '@/pages/api/StaticFunctions'
import { DecryptData, EncryptData } from '@/pages/EncryptingFunctions'

function PostLayout({ CurrentPost }) {

    const [getImage1, setGetImage1] = useState(false)
    const [getImage2, setGetImage2] = useState(false)
    const [getImage3, setGetImage3] = useState(false)

    const [Post, setPost] = useState({
        id: "",
        created_at: "",
        Username: "",
        TextPart: "",
        ImagePart: [],
        ImageData: [],
        IsFollowed: false
    })

    const [PersonData, setPersonData] = useState({
        Username: "",
        ProfilePic: "",
        Name: "",
        ImageData: "../../Assets/DefaultProfilePicture.png"
    })


    const CustomFetch = async () => {
        console.log(Post.ImagePart[0])
        const data = await FetchImage(Post.ImagePart[0], "posts")
        console.log(data)
    }

    useEffect(() => {
        if (CurrentPost) {
            setPost({
                id: CurrentPost.id,
                created_at: CurrentPost.created_at,
                Username: CurrentPost.Username,
                TextPart: CurrentPost.TextPart,
                ImagePart: CurrentPost.ImagePart,
                IsFollowed: CurrentPost.IsFollowed,
                ImageData: []
            })
        }
    }, [CurrentPost])

    const settings = {
        dots: true,
        lazyLoad: true,
        arrows: false,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 0,
        autoplay: true,
        autoplaySpeed: 5000,
        cssEase: "linear",
        pauseOnHover: true,
        pauseOnFocus: true,
        pauseOnDotsHover: true,
        fade: true,
    };

    const convertToBase64 = async (url) => {
        const response = await fetch(url)
        const blob = await response.blob()
        const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = () => {
                let base64data = reader.result
                resolve(base64data)
            }
        })
        return base64Data
    }

    useEffect(() => {
        if (getImage3) {
            const FetchImage = async (Filename, Path) => {

                const base64Data = await fetch("/api/FetchImage/" + Filename + "/" + Path, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(res => {
                    if (res.ok) {
                        return res.json()
                    } else {
                        console.log(res.status)
                    }

                }).then(data => {
                    if (data.ok) {
                        return data.data
                    } else {
                        return "Default"
                    }
                })
                return base64Data
            }

            async function setData() {
                const data = await FetchImage(Post.ImagePart[2], "posts")
                Post.ImageData.push("data:image/jpeg;base64," + data)
                setGetImage3(false)
            }
            setData()
        }
    }, [getImage3, Post])

    useEffect(() => {
        if (getImage2) {
            const FetchImage = async (Filename, Path) => {

                const url = await fetch("/api/FetchImage/" + Filename + "/" + Path, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(res => {
                    if (res.ok) {
                        return res.json()
                    } else {
                        console.log(res.status)
                    }

                }).then(data => {

                    if (data.ok) {
                        return data.data
                    } else {
                        return "Default"
                    }
                })
                return url
            }

            async function setData() {
                const data = await FetchImage(Post.ImagePart[1], "posts")
                Post.ImageData.push("data:image/jpeg;base64," + data)
                setGetImage2(false)

                if (Post.ImagePart.length > 2) {
                    setGetImage3(true)
                }
            }
            setData()
        }
    }, [getImage2, Post])



    useEffect(() => {
        if (getImage1) {
            const FetchImage = async (Filename, Path) => {

                const url = await fetch("/api/FetchImage/" + Filename + "/" + Path, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(res => {
                    if (res.ok) {
                        return res.json()
                    } else {
                        console.log(res.status)
                    }

                }).then(data => {
                    if (data.ok) {
                        return data.data
                    } else {
                        return "Default"
                    }
                })

                return url
            }

            async function setData() {
                const data = await FetchImage(Post.ImagePart[0], "posts")
                Post.ImageData.push("data:image/jpeg;base64," + data)
                setGetImage1(false)

                if (Post.ImagePart.length > 1) {
                    setGetImage2(true)
                }
            }
            setData()
        }
    }, [getImage1, Post])

    useEffect(() => {
        if (Post) {
            async function setData() {
                const staticFunctions = new StaticFunctions(Post.Username)
                const response = await staticFunctions.GetData()
                const result = JSON.parse(DecryptData(response))

                if (result.ok) {
                    if (Post.ImagePart.length > 0) {
                        setGetImage1(true)
                    }

                    const data = JSON.parse(DecryptData(result.data))

                    setPersonData({
                        Username: data.Username,
                        ProfilePic: data.ProfilePic,
                        Name: data.Name,
                        ImageData: ""
                    })

                }
            }
            setData()
        }
    }, [Post])

    useEffect(() => {
        async function getProfilePicture() {
            if (PersonData.Username != undefined && PersonData.ImageData == "") {
                if (PersonData.ProfilePic != "Default" && PersonData.ProfilePic != "") {
                    const response = await fetch("/api/FetchImage/" + PersonData.ProfilePic + "/profile-pictures")


                    if (response.ok) {
                        const data = await response.json()

                        if (data.ok) {

                            setPersonData({
                                Username: PersonData.Username,
                                ProfilePic: PersonData.ProfilePic,
                                Name: PersonData.Name,
                                ImageData: "data: image/ jpeg;base64," + data.data
                            })
                        } else {
                            setPersonData({
                                Username: PersonData.Username,
                                ProfilePic: PersonData.ProfilePic,
                                Name: PersonData.Name,
                                ImageData: "../../../Assets/DefaultProfilePicture.png"
                            })
                        }
                    }

                }
                else {
                    setPersonData({
                        Username: PersonData.Username,
                        ProfilePic: PersonData.ProfilePic,
                        Name: PersonData.Name,
                        ImageData: "../../../Assets/DefaultProfilePicture.png"
                    })
                }
            }
        }


        getProfilePicture()

    }, [PersonData])



    return (
        <div className="flex flex-col h-fit w-full justify-center items-center">
            <div className="PostBox border-2 border-slate-600 max-w-[90%] w-[90%] min-w-[60%] flex flex-col justify-start py-4 items-start px-6 rounded-lg h-[350px] bg-[#F8F8FF]">
                <div className="HeaderBar flex flex-row justify-start items-center w-full">
                    <div className="ProfilePic flex flex-row justify-center items-center border-2 border-black rounded-full">
                        {
                            PersonData.ImageData != "" ?
                                <Image class="block h-[48px] aspect-square w-[48px] rounded-full" alt='ProfilePicture' src={PersonData.ImageData} width={400} height={400} unoptimized /> :
                                <Image class="block h-[48px] aspect-square w-[48px] rounded-full" alt='ProfilePicture' src="../../Assets/DefaultProfilePicture.png" width={400} height={400} unoptimized />
                        }

                    </div>
                    <div className="flex flex-row w-full justify-between items-center">
                        <div className="ml-2 border-collapse flex flex-col items-start justify-center">
                            <div className="Name text-slate-600 font-bold text-base">
                                {PersonData.Name}
                            </div>
                            <div className="Username text-slate-600 font-bold text-sm">
                                @{PersonData.Username}
                            </div>
                        </div>

                        <div className="ml-2 flex flex-row justify-center items-center">

                            <Button className="bg-green-600 hover:bg-green-800 border-green-900 border-2">
                                {
                                    Post.IsFollowed ? "Unfollow" : "Follow"
                                }
                            </Button>
                        </div>
                    </div>
                </div>
                <div className=" w-full h-full min-w-[200px] text-slate-600 font-bold text-base mt-8 flex flex-row items-start justify-start pb-2">

                    {
                        Post.ImagePart.length == Post.ImageData.length && Post.ImagePart.length > 0 ?
                            <Slider {...settings} className='aspect-[1] h-[70%] max-h-[80%] overflow-visible'>
                                {
                                    Post.ImageData.map((data, index) => {
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
                            {Post.TextPart}
                        </p>

                    </div>

                </div>
            </div>


        </div>
    )
}

export default PostLayout