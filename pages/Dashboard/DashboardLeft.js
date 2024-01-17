import React, { useEffect, useRef, useState } from 'react'
import styles from '../../styles/DashboardLeft.module.css'
import { EncryptData, DecryptData } from '../EncryptingFunctions'
import Image from 'next/image'
import defaultProfilePicture from '../../public/Assets/defaultProfilePicture.png'
import Swal from 'sweetalert2'
import { useMemo } from 'react'

function DashboardLeft({ UserData, setFetchOnCall, setAction, setData }) {
    const Followers = useMemo(() => UserData ? UserData.Followers ? UserData.Followers : [] : [], [UserData])
    const Following = useMemo(() => UserData ? UserData.Following ? UserData.Following : [] : [], [UserData]);

    const ProfilePic = useMemo(() => UserData ? UserData.ProfilePic ? UserData.ProfilePic : "Default" : "Default", [UserData])

    const [findIsLoading, setFindIsLoading] = useState(false)
    const friendUsernameInpRef = useRef(null)

    useEffect(() => {
        const user_profile_pic = document.getElementById("user_profile_pic")

        async function setBase64() {
            const base64Data = await FetchImage(ProfilePic, "profile-pictures")
            if (base64Data != "Default") {
                user_profile_pic.src = "data:image/jpeg;base64," + base64Data
            }


        }

        if (ProfilePic != "Default") {
            setBase64()
        }
    }, [ProfilePic])

    const FetchImage = async (Filename, Path) => {
        const base64Data = await fetch("/api/FetchImage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                AllData:
                    EncryptData(
                        JSON.stringify(
                            [
                                {
                                    Filename: Filename + ".jpg",
                                    Path: Path
                                }
                            ]
                        )
                    )
            })
        }).then(res => res.json()).then(data => {
            if (data.ok) {
                return data.data
            } else {
                return "Default"
            }
        })

        return base64Data
    }

    const isDescendant = (parent, child) => {
        var node = child.parentNode;
        while (node != null) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    const ExpandCard = (target) => {
        const cards = document.getElementById("container").children

        let heading = null
        let content = null

        for (let i = 0; i < cards.length; i++) {
            heading = cards[i].children[0]
            content = cards[i].children[1]

            heading.style.lineHeight = "1.75rem"
            heading.style.fontSize = "1.25rem"

            if (cards[i] == target || isDescendant(cards[i], target)) {
                cards[i].style.height = "100%"
                heading.style.height = "20%"
                heading.style.color = "	#4b0082"
                heading.style.fontWeight = "900"
                content.style.display = "flex"
                content.style.height = "100%"
                content.style.justifyContent = "flex-start"
                content.style.marginTop = "20px"
                continue
            }

            cards[i].style.height = "20%"


            heading.style.height = "100%"
            heading.style.color = "black"
            heading.style.fontWeight = "700"

            content.style.display = "none"

            content.style.height = "0%"
            content.style.justifyContent = "center"
            content.style.marginTop = "0px"

        }
    }

    const CollapseCard = (target) => {
        const cards = document.getElementById("container").children

        let heading = null
        let content = null

        for (let i = 0; i < cards.length; i++) {
            heading = cards[i].children[0]
            content = cards[i].children[1]

            heading.style.lineHeight = "1.75rem"
            heading.style.fontSize = "1.25rem"

            cards[i].style.height = "20%"

            heading.style.height = "100%"
            heading.style.color = "black"
            heading.style.fontWeight = "700"

            content.style.display = "none"

            content.style.height = "0%"
            content.style.justifyContent = "center"
            content.style.marginTop = "0px"
        }

    }

    const logoutUser = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You will be logged out of your account!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4b0082',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout!'
        }).then((result) => {
            if (result.isConfirmed) {
                const Toast = Swal.mixin({
                    toast: true,
                    title: "Logged Out Successfully",
                    position: 'bottom-end',
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                })
                Toast.fire()
                localStorage.clear()
                window.location.reload()
            }
        })
    }

    const follow_user = (data, e) => {
        e.target.disabled = true
        e.target.style.cursor = "wait"
        const newFollowing = [
            ...UserData.Following,
            data.Username
        ]

        const newFollowers = [
            ...data.Followers,
            UserData.Username
        ]

        const toSendData = [
            {
                Username: UserData.Username,
                newFollowing: newFollowing,
                FriendUsername: data.Username,
                newFollowers: newFollowers
            }
        ]

        fetch("/api/FollowUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    AllData: EncryptData(JSON.stringify({ toSendData }))
                }
            )
        }).then(res => res.json()).then(data => {
            if (data.ok) {
                const Toast = Swal.mixin({
                    toast: true,
                    title: "Success!",
                    text: "Followed",
                    position: 'bottom-end',
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                })
                Toast.fire()
                e.target.style.display = "none"
                setFetchOnCall(true)

            } else {
                const Toast = Swal.mixin({
                    toast: true,
                    title: "Error!",
                    text: "Error Occurred",
                    position: 'bottom-end',
                    icon: "error",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                })
                Toast.fire()
                e.target.disabled = false
            }
        })
    }

    const search_user = (e) => {
        setFindIsLoading(true)
        const username = friendUsernameInpRef.current.value
        const checkList = UserData.Following.map((data) => {
            return data.Username
        })

        console.log(checkList)

        fetch("/api/FindUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Username: username
            })
        }).then(res => res.json()).then(data => {
            if (data.ok) {
                const searchResults = document.getElementById("searchresults")
                searchResults.innerHTML = ""
                const search_result_container = document.createElement("div")
                search_result_container.className = "w-full h-full flex flex-col items-end justify-center gap-1 mt-4"
                const div = document.createElement("div")
                div.className = "flex flex-row items-center justify-start gap-8 w-[90%]"
                const img = document.createElement("img")
                if (data.data.ImageData != "Default") {
                    img.src = 'data:image/png;base64,' + data.data.ImageData
                } else {
                    img.src = "../../Assets/defaultProfilePicture.png"
                }
                img.className = "w-[60px] aspect-square object-cover border-2 border-black bg-slate-300 rounded-full"
                const div2 = document.createElement("div")
                div2.className = "flex flex-col items-start justify-center"
                const h1 = document.createElement("h1")
                h1.className = " font-extrabold text-xl "
                if (data.data.Username != UserData.Username) {
                    h1.className += "hover:underline"
                }

                h1.addEventListener('click', () => {
                    if (data.data.Username != UserData.Username) {
                        setAction("PROFILE")
                        setData(data.data)
                    }
                })

                h1.innerText = data.data.Name
                const h2 = document.createElement("h2")
                h2.className = " text-sm text-blue-800 font-bold"
                h2.innerText = "@" + data.data.Username
                div2.appendChild(h1)
                div2.appendChild(h2)
                div.appendChild(img)
                div.appendChild(div2)


                const action_container = document.createElement("div")

                action_container.className = "flex flex-row items-center justify-center w-[90%] gap-4"

                const follow_btn = document.createElement("button")
                follow_btn.className = "border-2 rounded-lg px-2 py-1 bg-green-800 text-[white] border-green-900 text-sm hover:bg-green-900 transition-colors duration-600"
                follow_btn.innerText = "Follow"
                follow_btn.addEventListener("click", (e) => follow_user(data.data, e))

                const message_btn = document.createElement("button")
                message_btn.className = "border-2 rounded-lg px-2 py-1 bg-blue-800 text-[white] border-blue-900 text-sm hover:bg-blue-900 transition-colors duration-600"
                message_btn.innerText = "Message"
                message_btn.addEventListener("click", () => {
                    const Toast = Swal.mixin({
                        toast: true,
                        title: "Error!",
                        text: "This feature is not available yet",
                        position: 'bottom-end',
                        icon: "error",
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    })
                    Toast.fire()
                })

                const thats_you_span = document.createElement("span")
                thats_you_span.className = "text-sm text-gray-600 font-semibold w-full h-full inset-0 flex flex-col justify-center items-center"
                thats_you_span.innerText = "That's You!"


                if (data.data.Username != UserData.Username) {
                    if (!(UserData.Following.includes(data.data.Username))) {
                        action_container.style.flexDirection = "row"
                        action_container.appendChild(follow_btn)
                    }
                    action_container.appendChild(message_btn)
                } else {
                    action_container.appendChild(thats_you_span)
                }

                search_result_container.appendChild(div)
                search_result_container.appendChild(action_container)


                searchResults.appendChild(search_result_container)
                setFindIsLoading(false)

            } else {

                if (data.message == "User not found") {
                    const searchResults = document.getElementById("searchresults")
                    searchResults.innerHTML = ""
                    const span = document.createElement("span")
                    span.className = " text-lg text-gray-600 font-semibold w-full h-full inset-0 flex flex-col justify-center items-center"
                    span.innerText = "No User Found"
                    searchResults.appendChild(span)
                } else {
                    const Toast = Swal.mixin({
                        toast: true,
                        title: "Error!",
                        text: "An error occurred while fetching data",
                        position: 'bottom-end',
                        icon: "error",
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    })
                    Toast.fire()
                }

                setFindIsLoading(false)
            }
        })
    }

    const Unfollow = (username, e) => {
        e.target.disabled = true
        e.target.style.cursor = "wait"

        const newFollowing = UserData.Following.filter((data) => {
            return data != username
        })

        const newFollowers = UserData.Followers.filter((data) => {
            return data != username
        })

        const toSendData = [
            {
                Username: UserData.Username,
                newFollowing: newFollowing,
                FriendUsername: username,
                newFollowers: newFollowers
            }
        ]

        fetch("/api/Unfollow", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    AllData: EncryptData(JSON.stringify({ toSendData }))
                }
            )
        }).then(res => res.json()).then(data => {
            if (data.ok) {
                const Toast = Swal.mixin({
                    toast: true,
                    title: "Success!",
                    text: "Unfollowed Successfully",
                    position: 'bottom-end',
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                })
                Toast.fire()
                setFetchOnCall(true)
            } else {
                const Toast = Swal.mixin({
                    toast: true,
                    title: "Error!",
                    text: "Error Occurred",
                    position: 'bottom-end',
                    icon: "error",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                })
                Toast.fire()
                e.target.disabled = false
            }
        })
    }

    useEffect(() => {
        const followersProfilePicture = document.getElementsByClassName("followersProfilePicture")
        const followingProfilePicture = document.getElementsByClassName("followingProfilePicture")

        const friendName = document.getElementsByClassName("friendName")

        let allImageTags = []

        for (let i = 0; i < followersProfilePicture.length; i++) {
            allImageTags.push(followersProfilePicture[i])
        }

        for (let i = 0; i < followingProfilePicture.length; i++) {
            allImageTags.push(followingProfilePicture[i])
        }

        async function setBase64() {

            let BaseData = {}
            let fullData = {}

            for (let i = 0; i < allImageTags.length; i++) {

                const username = allImageTags[i].alt
                friendName[i].className += " hover:underline"


                if (BaseData[username]) {
                    if (BaseData[username]["IMG"] != "") {
                        allImageTags[i].src = BaseData[username]["IMG"]
                    }
                    friendName[i].innerText = BaseData[username]["NAME"]
                    friendName[i].addEventListener('click', () => {
                        setAction("PROFILE")
                        setData(fullData[username])
                    })
                    continue
                }

                const ProfilePic = await fetch("/api/FindUser", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        Username: username
                    })
                })
                const result = await ProfilePic.json()
                BaseData[username] = {
                    "IMG": "",
                    "NAME": ""
                }

                fullData[username] = result.data

                friendName[i].addEventListener('click', (e) => {
                    setAction("PROFILE")
                    setData(fullData[username])
                })

                if (result.ok && result.data.ImageData != "Default") {
                    allImageTags[i].src = "data:image/png;base64," + result.data.ImageData

                    BaseData[username]["IMG"] = "data:image/png;base64," + result.data.ImageData
                }

                friendName[i].innerText = result.data.Name
                BaseData[username]["NAME"] = result.data.Name


            }
        }

        setBase64()

    }, [Followers, Following, setAction, setData])

    return (
        <div className={styles.DashboardLeft}>
            <div className='w-3/4 h-full gap-4 py-6 rounded-[10px] flex flex-col items-center justify-center px-[14px] overflow-hidden' id='container' onMouseLeave={(e) => CollapseCard(e.target)}>

                <div className={styles.Cards} onMouseEnter={(e) => ExpandCard(e.target)} >

                    <div className={styles.heading}>Profile</div>

                    <div className={styles.content}>
                        <div className={'flex flex-row items-center justify-start gap-8 w-[90%]'}>
                            <Image alt='ProfilePic' height={400} width={400} className='w-[80px] aspect-square object-cover border-2 border-black bg-slate-300 rounded-full' id="user_profile_pic" src={defaultProfilePicture} unoptimized />
                            <div className='flex flex-col items-start justify-center'>
                                <h1 className=' font-extrabold text-2xl'>{UserData ? UserData.Name : ""}</h1>
                                <h2 className=' text-base text-blue-800 font-bold'>@{UserData ? UserData.Username : ""}</h2>
                            </div>
                        </div>
                        <div className='flex flex-col items-start justify-center gap-8 w-[90%] mt-4'>
                            <p className={styles.Bio + ' text-sm text-justify text-black font-semibold'}>{UserData ? UserData.Bio : ""}</p>
                            <div className='flex flex-row gap-6 justify-evenly items-center w-full'>

                                <button
                                    className='
                                border-2 rounded-lg px-4 py-2 bg-green-800 text-[white] border-green-900 hover:bg-green-900 transition-colors duration-600
                                '
                                    onClick={() => {
                                        setAction("EDIT")
                                        setData(UserData)
                                    }}
                                >Edit Details</button>

                                <button className='border-2 rounded-lg px-4 py-2 bg-red-800 text-[white] border-red-900 hover:bg-red-900 transition-colors duration-600' onClick={() => logoutUser()}>Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.Cards + ' relative'} onMouseEnter={(e) => ExpandCard(e.target)} >
                    <div className={styles.heading}>Followers</div>
                    <div className={styles.content}>
                        {
                            Followers.length > 0 ?
                                Followers.map((username, index) => {
                                    return (
                                        <div className='flex flex-row items-center justify-start min-h-[60px] mt-4 overflow-hidden gap-8 w-[90%]' key={username}>
                                            <Image alt={username} height={400} width={400} className='w-[60px] aspect-square object-cover border-2 border-black bg-slate-300 rounded-full followersProfilePicture' src={defaultProfilePicture} unoptimized />
                                            <div className='flex flex-row justify-between w-full h-full border-none items-start'>
                                                <div className='flex flex-col items-start justify-center'>
                                                    <h1 className=' font-extrabold text-xl hover:underline friendName'></h1>
                                                    <h2 className=' text-sm text-blue-800 font-bold'>@{username}</h2>
                                                </div>
                                                <div className='h-full w-fit flex justify-center items-center'>
                                                    <button className='border-2 rounded-lg px-2 py-2 bg-red-800 text-[white] border-red-900 hover:bg-red-900 transition-colors duration-600' onClick={(e) => Unfollow(username, e)}>
                                                        <i className="fa-solid fa-trash text-[16px]"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }) : <span className=' absolute 
                                text-lg text-gray-600 font-semibold w-full h-full inset-0 flex flex-col justify-center items-center 
                                '>No Followers Found</span>
                        }
                    </div>
                </div>
                <div className={styles.Cards} onMouseEnter={(e) => ExpandCard(e.target)} >
                    <div className={styles.heading}>Following</div>
                    <div className={styles.content}>
                        {
                            Following.length > 0 ?
                                Following.map((username, index) => {
                                    return (
                                        <div className='flex flex-row items-center justify-start min-h-[60px] mt-4 overflow-hidden gap-8 w-[90%]' key={username} >
                                            <Image alt={username} height={400} width={400} className='w-[60px] h-[60px] object-cover border-2 border-black bg-slate-300 rounded-full followingProfilePicture' src={defaultProfilePicture} unoptimized />
                                            <div className='flex flex-row justify-between w-full h-full border-none items-start'>
                                                <div className='flex flex-col items-start justify-center'>
                                                    <h1 className=' font-extrabold text-xl friendName'></h1>
                                                    <h2 className=' text-sm text-blue-800 font-bold'>@{username}</h2>
                                                </div>
                                                <div className='h-full w-fit flex justify-center items-center'>
                                                    <button className='border-2 rounded-lg px-2 py-2 bg-red-800 text-[white] border-red-900 hover:bg-red-900 transition-colors duration-600' onClick={(e) => Unfollow(username, e)}>
                                                        <i className="fa-solid fa-trash text-[16px]"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }) : <span className=' absolute 
                                text-lg text-gray-600 font-semibold w-full h-full inset-0 flex flex-col justify-center items-center 
                                '>No Following Found</span>
                        }
                    </div>

                </div>
                <div className={styles.Cards} onMouseEnter={(e) => ExpandCard(e.target)} >
                    <div className={styles.heading}>Search</div>
                    <div className={styles.content}>
                        <div className='flex flex-row items-center justify-start gap-8 w-[90%]'>
                            <input type='text' ref={friendUsernameInpRef} placeholder='Enter Username' className='border-2 border-black rounded-lg px-4 py-2 w-full outline-none' />
                            {
                                !findIsLoading ? <button className='border-2 rounded-lg px-4 py-2 bg-blue-800 text-[white] border-blue-900 hover:bg-blue-900 transition-colors duration-600' onClick={(e) => search_user(e)}>Find</button> :
                                    <button className='border-2 rounded-lg px-4 py-2 bg-blue-800 text-[white] flex items-center justify-center border-blue-900 hover:bg-blue-900 transition-colors duration-600'>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                                            viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                    </button>

                            }
                        </div>
                        <div id='searchresults' className='w-full h-[60%] flex flex-col items-around justify-around'></div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default DashboardLeft