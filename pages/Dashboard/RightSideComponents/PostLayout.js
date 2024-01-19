import React, { useState } from 'react'
import defaultProfilePic from "../../../public/Assets/defaultProfilePicture.png"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Slider from 'react-slick'
import styles from '../../../styles/PostLayout.module.css'

function PostLayout() {

    const [Post, setPost] = useState({
        id: "abcd",
        created_at: "1705620749",
        Username: "tirthdesai",
        TextPart: "Hello World! How are you?",
        ImagePart: [],
        IsFollowed: false
    })

    // useEffect(() => {
    //     if (CurrentPost) {
    //         setPost(CurrentPost)
    //     }
    // }, [CurrentPost])

    const settings = {
        dots: true,
        lazyLoad: true,
        arrows: true,
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

    return (
        <div className="flex flex-col h-fit w-full justify-center items-center mt-6">
            <div className="PostBox border-2 border-slate-600 max-w-[90%] w-[90%] min-w-[60%] flex flex-col justify-start py-4 items-start px-6 rounded-lg h-[350px] bg-[#F8F8FF]">
                <div className="HeaderBar flex flex-row justify-start items-center w-full">
                    <div className="ProfilePic flex flex-row justify-center items-center border-2 border-black rounded-full">

                        <Image class="block h-[48px] aspect-square w-[48px] rounded-full" src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" alt="Image Description" width={400} height={400} unoptimized />

                    </div>
                    <div className="flex flex-row w-full justify-between items-center">
                        <div className="ml-2 border-collapse flex flex-col items-start justify-center">
                            <div className="Name text-slate-600 font-bold text-base">
                                Tirth Desai
                            </div>
                            <div className="Username text-slate-600 font-bold text-sm">
                                @tirthdesai
                            </div>
                        </div>

                        <div className="ml-2 flex flex-row justify-center items-center">

                            <Button className="bg-green-600 hover:bg-green-800 border-green-900 border-2">Follow</Button>
                        </div>
                    </div>
                </div>
                <div className=" w-full h-full min-w-[200px] text-slate-600 font-bold text-base mt-8 flex flex-row items-start justify-start">

                    <Slider {...settings} className='aspect-[4/3] h-[70%] border-[3px] border-black overflow-hidden'>
                        <div className={styles.slide1}>

                        </div>

                        <div className={styles.slide2}>

                        </div>

                        <div className={styles.slide3}>

                        </div>
                    </Slider>

                    <div className="TextPart w-full h-full min-w-[200px] text-slate-600 font-bold text-base mt-2 flex flex-row items-start justify-start ml-4">
                        <p className={styles.comment + " text-slate-600 font-bold line-clamp-4 text-base text-justify leading-6 max-h-[200px] overflow-scroll pr-4"} onClick={(e) => {

                            let className = e.target.className.toString();
                            if (className.includes("line-clamp-4")) {
                                e.target.className = className.replace("line-clamp-4", "line-clamp-none")
                                e.target.style.overflow = "scroll"
                            }
                            else {
                                e.target.className = className.replace("line-clamp-none", "line-clamp-4")
                                e.target.style.overflow = "hidden"
                            }
                        }}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id neque aliquam vestibulum morbi blandit cursus risus. Vitae justo eget magna fermentum iaculis. Tristique senectus et netus et malesuada fames ac turpis egestas. At tempor commodo ullamcorper a lacus. Sem nulla pharetra diam sit. Aenean et tortor at risus. Risus sed vulputate odio ut enim. Porttitor eget dolor morbi non arcu. Morbi leo urna molestie at. Ut diam quam nulla porttitor massa id. Posuere morbi leo urna molestie at elementum eu facilisis. Facilisis magna etiam tempor orci eu lobortis elementum. Sed id semper risus in hendrerit. Posuere morbi leo urna molestie at. Nunc lobortis mattis aliquam faucibus purus in massa tempor. Tincidunt ornare massa eget egestas purus viverra accumsan in.
                        </p>

                    </div>

                </div>
            </div>


        </div >
    )
}

export default PostLayout