import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Slider from 'react-slick'
import styles from '../../../styles/PostLayout.module.css'

function PostLayout({ PostData, UserData, PostUserData }) {

    const [Data, setData] = useState({
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
            setData({
                id: PostData.id,
                created_at: PostData.created_at,
                Username: PostData.Username,
                TextPart: PostData.TextPart,
                ImagePart: ImagePart,
                IsFollowed: PostData.IsFollowed,
                ProfilePic: PostUserData.ProfilePic != "Default" ? PostUserData.ProfilePic : "../../Assets/defaultProfilePicture.png",
                Name: PostUserData.Name,
                IsFollowed: PostUserData.isFollowed
            })
        }
    }, [PostData, PostUserData])

    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
    };


    return (
        <div className="flex flex-col h-fit w-full justify-center items-center">
            <div className="PostBox border-2 border-slate-600 max-w-[90%] w-[90%] min-w-[60%] flex flex-col justify-start py-4 items-start px-6 rounded-lg h-[350px] bg-[#F8F8FF]">
                <div className="HeaderBar flex flex-row justify-start items-center w-full">
                    <div className="ProfilePic flex flex-row justify-center items-center border-2 border-black rounded-full">

                        <Image class="block h-[48px] aspect-square w-[48px] rounded-full" alt='ProfilePicture' src={Data.ProfilePic} width={400} height={400} unoptimized />


                    </div>
                    <div className="flex flex-row w-full justify-between items-center">
                        <div className="ml-2 border-collapse flex flex-col items-start justify-center">
                            <div className="Name text-slate-600 font-bold text-base">
                                {Data.Name}
                            </div>
                            <div className="Username text-slate-600 font-bold text-sm">
                                @{Data.Username}
                            </div>
                        </div>

                        <div className="ml-2 flex flex-row justify-center items-center">

                            <Button className="bg-green-600 hover:bg-green-800 border-green-900 border-2">
                                {
                                    Data.IsFollowed ? "Unfollow" : "Follow"
                                }
                            </Button>
                        </div>
                    </div>
                </div>
                <div className=" w-full h-full min-w-[200px] text-slate-600 font-bold text-base mt-8 flex flex-row items-start justify-start pb-2">


                    <Slider {...settings} className='aspect-[1] h-[80%] overflow-visible'>
                        {
                            Data.ImagePart.map((data, index) => {
                                return (
                                    <Image key={data} className={styles.slide} alt='PostImage' src={data} width={400} height={400} unoptimized />
                                )
                            })
                        }
                    </Slider>


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