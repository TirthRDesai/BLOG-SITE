import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import defaultProfilePicture from '../../../public/Assets/defaultProfilePicture.png'
import styles from '../../../styles/DashboardRight.module.css'
import { Button } from '@/components/ui/button'
import StaticFunctions from '@/pages/api/StaticFunctions'
import { DecryptData } from '@/pages/EncryptingFunctions'
import Swal from 'sweetalert2'

function ShowProfile({ Data, setFetchOnCall, UserData, BoxRef }) {
    const bgImgRef = useRef(null)
    const smallImgRef = useRef(null)

    const [Username, setUsername] = useState("")

    const [isFollowed, setIsFollowed] = useState(false)
    const [isUnfollowing, setIsUnfollowing] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)

    useEffect(() => {
        setUsername(UserData.Username)
    }, [UserData])

    const [PassedData, setPassedData] = useState({
        Username: "",
        Name: "",
        Bio: "",
        ProfilePic: "",
        Followers: [],
        Following: [],
        ImageData: ""
    })

    useEffect(() => {
        setPassedData({
            Username: Data.Username,
            Name: Data.Name,
            Bio: Data.Bio,
            ProfilePic: Data.ProfilePic,
            Followers: Array.from(new Set(Data.Followers)),
            Following: Array.from(new Set(Data.Following)),
            ImageData: Data.ImageData
        })
        if (Data.Followers) {
            if (Data.Followers.includes(Username)) {
                setIsFollowed(true)
            } else {
                setIsFollowed(false)
            }
        }
    }, [Data, Username])

    useEffect(() => {
        const image = bgImgRef.current
        const smallImage = smallImgRef.current
        if (PassedData.ImageData == "Default") {
            image.style.backgroundImage = `url('../../Assets/defaultProfilePicture.png')`

            smallImage.src = "../../Assets/defaultProfilePicture.png"
        } else {

            if (PassedData.ImageData) {
                image.style.backgroundImage = `url('data:image/png;base64,${PassedData.ImageData}')`
                smallImage.src = `data:image/png;base64,${PassedData.ImageData}`
            }
        }
    }, [bgImgRef, smallImgRef, PassedData])

    useEffect(() => {
        const statscontainer = document.getElementsByClassName("statscontainer")

        for (let i = 0; i < statscontainer.length; i++) {
            statscontainer[i].addEventListener('mouseenter', () => {
                statscontainer[i].style.transform = "scale(1)"
            }
            )
            statscontainer[i].addEventListener('mouseleave', () => {
                statscontainer[i].style.transform = "scale(0.8)"
            }
            )
        }
    }, [])

    const UnfollowBtn = async (e) => {
        e.target.style.pointerEvents = "none"

        setIsUnfollowing(true)
        const staticFunctions = new StaticFunctions(Username)

        const response = await staticFunctions.UnfollowUser(PassedData.Username, UserData.Following)


        const result = JSON.parse(DecryptData(response))

        if (result.ok) {
            setFetchOnCall(true)
            setIsFollowed(false)

            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            })

            Toast.fire({
                icon: 'success',
                title: 'Unfollowed User'
            })
        } else {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            })

            Toast.fire({
                icon: 'error',
                title: 'Error Unfollowing User'
            })
        }

        setIsUnfollowing(false)
        e.target.style.pointerEvents = "all"
    }

    const FollowBtn = async (e) => {
        console.log(PassedData.Followers)
        e.target.style.pointerEvents = "none"

        setIsFollowing(true)
        const staticFunctions = new StaticFunctions(Username)

        const response = await staticFunctions.FollowUser(PassedData.Username, PassedData.Followers, UserData.Following)

        const result = JSON.parse(DecryptData(response))

        if (result.ok) {
            setFetchOnCall(true)
            setIsFollowed(true)

            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            })

            Toast.fire({
                icon: 'success',
                title: 'Followed User'
            })
        } else {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            })

            Toast.fire({
                icon: 'error',
                title: 'Error Following User'
            })
        }

        setIsFollowing(false)
        e.target.style.pointerEvents = "all"
    }


    return (
        <div className={' w-[80%] h-[80%] bg-slate-600 scroll-smooth border-4 border-slate-800 rounded-2xl text-white flex flex-col justify-evenly items-center relative overflow-hidden'} ref={BoxRef} id='ShowProfilePanel'>
            <div className={styles.FriendProfileContainer} ref={bgImgRef}></div>
            <div className='text-red-600 bg-[rgba(255,255,255,0.65)] rounded-full w-[160px] h-[160px] z-30 overflow-hidden'>
                <Image src={defaultProfilePicture} alt='ProfPic' className='w-full h-full object-cover border-2 border-black rounded-full' ref={smallImgRef} unoptimized />
            </div>
            <div className='absolute h-full w-full z-30' id='stats-grid'>
                <div className='w-full place-items-center h-full grid grid-cols-2 grid-rows-2 gap-0'>
                    <div className='statscontainer w-[70%] h-[70%] flex flex-col items-start px-2 justify-center bg-[rgba(0,0,0,0.6)] rounded-lg scale-[0.8] transition-transform duration-500'>
                        <span className='mt-2'><span className=' font-bold'>Name:</span> <br /><span className='ml-4'>{PassedData.Name}</span></span>
                        <span className='mt-2 mb-2'><span className=' font-bold'>Username:</span> <br /><span className='ml-4'>@{PassedData.Username}</span></span>
                    </div>
                    <div className='statscontainer w-[70%] h-[70%] flex flex-col items-center px-2 justify-center bg-[rgba(0,0,0,0.6)] rounded-lg scale-[0.8] transition-transform duration-500'>
                        <span className='mt-2 text-[24px]'><span className=' font-semibold '>Followers: </span>{PassedData.Followers ? (new Set(PassedData.Followers)).size : 0}</span>
                        <span className='mt-2 text-[24px] mb-2'><span className=' font-semibold'>Following:</span> {PassedData.Followers ? PassedData.Following.length : 0}</span>

                    </div>
                    <div className='statscontainer w-[70%] h-[70%] flex flex-col items-start px-2 justify-start bg-[rgba(0,0,0,0.6)] rounded-lg scale-[0.8] transition-transform duration-500'>
                        <span className='mt-4'>
                            <span className=' font-bold'>Bio:</span> <br /><span className='ml-2 text-justify line-clamp-4 mr-2'>{PassedData.Bio}</span>
                        </span>
                    </div>
                    <div className='statscontainer w-[70%] h-[70%] flex flex-col items-center px-2 justify-center gap-4 bg-[rgba(0,0,0,0.6)] rounded-lg scale-[0.8] transition-transform duration-500'>

                        {
                            isFollowed ?
                                <Button className='w-[80%] text-[16px] bg-red-500 hover:bg-red-700' onClick={(e) => UnfollowBtn(e)}>
                                    {
                                        isUnfollowing ?
                                            <span className={styles.loader}></span> :
                                            "Unfollow"
                                    }
                                </Button> :
                                <Button className='w-[80%] text-[16px] bg-green-500 hover:bg-green-700' onClick={(e) => { FollowBtn(e) }}>
                                    {
                                        isFollowing ?
                                            <span className={styles.loader}></span> :
                                            "Follow"
                                    }
                                </Button>
                        }

                        <Button className='bg-blue-500 w-[80%] text-[16px] hover:bg-blue-700'>View Posts</Button>

                    </div>

                </div>
            </div>
        </div>
    )
}

export default ShowProfile