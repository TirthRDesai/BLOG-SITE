import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import defaultProfilePicture from '../../../public/Assets/defaultProfilePicture.png'
import styles from '../../../styles/DashboardRight.module.css'

function ShowProfile({ Data, setFetchOnCall }) {
    const bgImgRef = useRef(null)
    const smallImgRef = useRef(null)

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
            Followers: Data.Followers,
            Following: Data.Following,
            ImageData: Data.ImageData
        })
    }, [Data])

    useEffect(() => {
        const image = bgImgRef.current
        const smallImage = smallImgRef.current
        if (PassedData.ImageData == "Default") {
            image.style.backgroundImage = `url('../../Assets/defaultProfilePicture.png')`

            smallImage.src = "../../Assets/defaultProfilePicture.png"
        } else {
            image.style.backgroundImage = `url('data:image/png;base64,${PassedData.ImageData}')`

            smallImage.src = `data:image/png;base64,${PassedData.ImageData}`
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

    return (
        <div className='w-full h-full flex flex-col items-center justify-center '>
            <div className={' w-[80%] h-[80%] bg-slate-600 scroll-smooth border-4 border-slate-800 rounded-2xl text-white flex flex-col justify-evenly items-center relative overflow-hidden'}>
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
                        <div className='statscontainer w-[70%] h-[70%] flex flex-col items-start px-2 justify-center bg-[rgba(0,0,0,0.6)] rounded-lg scale-[0.8] transition-transform duration-500'>

                        </div>
                        <div className='statscontainer w-[70%] h-[70%] flex flex-col items-start px-2 justify-start bg-[rgba(0,0,0,0.6)] rounded-lg scale-[0.8] transition-transform duration-500'>
                            <span className='mt-4'>
                                <span className=' font-bold'>Bio:</span> <br /><span className='ml-2 text-justify line-clamp-4 mr-2'>{PassedData.Bio}</span>
                            </span>
                        </div>
                        <div className='statscontainer w-[70%] h-[70%] flex flex-col items-start px-2 justify-center bg-[rgba(0,0,0,0.6)] rounded-lg scale-[0.8] transition-transform duration-500'>
                            <h2 className={styles.heading + ' text-[20px]'}></h2>
                            <h2 className={styles.heading + ' text-[20px]'}>Comments</h2>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShowProfile