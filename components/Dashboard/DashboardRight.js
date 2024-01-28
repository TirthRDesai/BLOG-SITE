import React, { useEffect, useRef, useState } from 'react'
import styles from '../../styles/DashboardRight.module.css'
import EditDetails from './RightSideComponents/EditDetails'
import ShowProfile from './RightSideComponents/ShowProfile'
import Posts from './RightSideComponents/Posts'
import { Button } from '@/components/ui/button'
import { ClientSideCookies } from '../CustomCookie'

function DashboardRight({ Action, Data, setFetchOnCall, UserData, setAction, setData }) {

    const [Panel, setPanel] = useState('POSTS')
    const EditDetailsPanelRef = useRef(null)
    const ShowProfilePanelRef = useRef(null)
    const overlayRef = useRef(null)
    const BoxRef = useRef(null)
    const [MainData, setMainData] = useState({
        id: "",
        created_at: "",
        Username: "",
        Name: "",
        Email: "",
        Password: "",
        Bio: "",
        ProfilePic: "",
        Followers: [],
        Following: [],
        Posts: [],
        ImageData: ""
    })
    const [BoxCoordinates, setBoxCoordinates] = useState({
        initial: [],
        final: []
    })
    const [postsUser, setPostsUser] = useState("*")


    useEffect(() => {
        if (BoxRef.current) {
            setTimeout(() => {
                const Box = BoxRef.current
                const BoxRect = Box.getBoundingClientRect()
                const BoxCoordinates = {
                    initial: [BoxRect.left, BoxRect.top],
                    final: [BoxRect.right, BoxRect.bottom]
                }
                setBoxCoordinates(BoxCoordinates)
            }, 1100)
        }
    }, [BoxRef])

    useEffect(() => {
        if (UserData) {
            setMainData({
                id: UserData.id,
                created_at: UserData.created_at,
                Username: UserData.Username,
                Name: UserData.Name,
                Email: UserData.Email,
                Password: UserData.Password,
                Bio: UserData.Bio,
                ProfilePic: UserData.ProfilePic,
                Followers: UserData.Followers,
                Following: UserData.Following,
                Posts: UserData.Posts,
                ImageData: UserData.ImageData
            })
        }
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

    const [Username, setUsername] = useState("")

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
    }, [Data, Username])

    useEffect(() => {
        const clientSideCookies = new ClientSideCookies()
        const Username = clientSideCookies.getCustomCookie("Username")
        setUsername(Username)
    }, [])

    useEffect(() => {

        const EditDetailsPanelDiv = EditDetailsPanelRef.current
        const ShowProfilePanelDiv = ShowProfilePanelRef.current

        let delay = 100

        const overlayDiv = overlayRef.current


        if (Action == "EDIT") {
            overlayDiv.style.display = "flex"

            overlayDiv.style.opacity = "1"


            if (Panel == "PROFILE") {
                ShowProfilePanelDiv.style.transform = "scale(0)"
                delay = 500

                setTimeout(() => {
                    ShowProfilePanelDiv.style.visibility = "hidden"
                }, 500);

            }
            EditDetailsPanelDiv.style.visibility = "visible"
            setTimeout(() => {
                EditDetailsPanelDiv.style.transform = "scale(1)"
                setTimeout(() => {
                    const EditDetailsPanel = document.getElementById("EditDetailsPanel")
                    const EditDetailsPanelRect = EditDetailsPanel.getBoundingClientRect()
                    const EditDetailsPanelCoordinates = {
                        initial: [EditDetailsPanelRect.left, EditDetailsPanelRect.top],
                        final: [EditDetailsPanelRect.right, EditDetailsPanelRect.bottom]
                    }
                    setBoxCoordinates(EditDetailsPanelCoordinates)
                }, delay + 500)
            }, delay)
        }
        else if (Action == "PROFILE") {
            overlayDiv.style.display = "flex"
            overlayDiv.style.opacity = "1"

            if (Panel == "EDIT") {
                EditDetailsPanelDiv.style.transform = "scale(0)"
                delay = 500

                setTimeout(() => {
                    EditDetailsPanelDiv.style.visibility = "hidden"
                }, 500);

            }
            if (Panel == "PROFILE") {
                if (Username != Data.Username) {
                    ShowProfilePanelDiv.style.transform = "scale(0)"
                    delay = 500

                    setTimeout(() => {
                        ShowProfilePanelDiv.style.visibility = "hidden"
                    }, 500);
                }
            }

            setTimeout(() => {
                ShowProfilePanelDiv.style.visibility = "visible"
                ShowProfilePanelDiv.style.transform = "scale(1)"
                setTimeout(() => {
                    const ShowProfilePanel = document.getElementById("ShowProfilePanel")
                    const ShowProfilePanelRect = ShowProfilePanel.getBoundingClientRect()
                    const ShowProfilePanelCoordinates = {
                        initial: [ShowProfilePanelRect.left, ShowProfilePanelRect.top],
                        final: [ShowProfilePanelRect.right, ShowProfilePanelRect.bottom]
                    }
                    setBoxCoordinates(ShowProfilePanelCoordinates)
                }, delay + 500)
            }, delay)
        }


        setPanel(Action)


    }, [Action, Data, Panel, Username])

    const CloseAllPanels = (e) => {
        const ClickedCoordinates = [e.clientX, e.clientY]

        if (!(ClickedCoordinates[0] >= BoxCoordinates.initial[0] && ClickedCoordinates[0] <= BoxCoordinates.final[0] && ClickedCoordinates[1] >= BoxCoordinates.initial[1] && ClickedCoordinates[1] <= BoxCoordinates.final[1])) {


            const EditDetailsPanelDiv = EditDetailsPanelRef.current
            const ShowProfilePanelDiv = ShowProfilePanelRef.current

            const overlayDiv = overlayRef.current

            overlayDiv.style.opacity = "0"

            setTimeout(() => {
                overlayDiv.style.display = "none"
            }, 500);

            if (Panel == "EDIT") {
                EditDetailsPanelDiv.style.transform = "scale(0)"
                setTimeout(() => {
                    EditDetailsPanelDiv.style.visibility = "hidden"
                }, 500);
            }
            else if (Panel == "PROFILE") {
                ShowProfilePanelDiv.style.transform = "scale(0)"
                setTimeout(() => {
                    ShowProfilePanelDiv.style.visibility = "hidden"
                }, 500);
            }
            setAction("POSTS")
            setData({})
        }
    }

    const slideInAnimation = (elem, duration, fill, delay) => {
        elem.animate([
            { transform: 'translateY(-60%)', opacity: "0" },
            { transform: 'translateY(0%)', opacity: "1" }
        ], {
            duration: duration,
            fill: fill,
            delay: delay,
            iterations: 1
        })

        setTimeout(() => {
            elem.classList.remove("invisible")
        }, delay)
    }

    const slideOutAnimation = (elem, duration, fill, delay) => {
        elem.animate([
            { transform: 'translateY(0%)', opacity: "1" },
            { transform: 'translateY(-60%)', opacity: "0" }
        ], {
            duration: duration,
            fill: fill,
            delay: delay,
            iterations: 1
        })

        setTimeout(() => {
            elem.classList.add("invisible")
        }, delay + duration)
    }

    const resetAll = (barItems, items) => {
        barItems.classList.remove("flex")
        barItems.classList.add("hidden")

        for (let i = 0; i < items.length; i++) {
            items[i].classList.add("invisible")
        }
    }


    const barsClicked = () => {
        const inp =
            document.getElementsByClassName(styles.checkIcon)[0]
        const barItems = document.getElementById("barItems")
        const items = barItems.children

        if (inp.checked) {
            inp.checked = false

            for (let i = 0; i < items.length; i++) {
                slideOutAnimation(items[2 - i], 500, "forwards", i * 300)
            }

            setTimeout(() => {
                barItems.classList.remove("flex")
                barItems.classList.add("hidden")
            }, 1600)
        }
        else {
            inp.checked = true
            resetAll(barItems, items)

            barItems.classList.remove("hidden")
            barItems.classList.add("flex")

            for (let i = 0; i < items.length; i++) {
                slideInAnimation(items[i], 500, "forwards", i * 300)
            }
        }
    }

    useEffect(() => {
        if (postsUser) {
            const ShowProfilePanel = ShowProfilePanelRef.current
            if (ShowProfilePanel.style.transform === "scale(1)") {
                ShowProfilePanel.style.transform = "scale(0)"
                const overlay = overlayRef.current

                overlay.style.opacity = "0"
                overlay.style.display = "none"
                setTimeout(() => {

                    ShowProfilePanel.style.visibility = "invisible"
                }, 500);
            }
        }
    }, [postsUser])

    return (

        <div className={styles.DashboardRight}>

            <div className=' absolute flex flex-col justify-center items-end top-4 right-4 h-fit w-fit' >
                <div className='relative h-fit w-fit bg-black py-3 rounded-xl cursor-pointer px-2' onClick={() => barsClicked()}>
                    <input className={styles.checkIcon + " absolute invisible z-20 w-full h-full"} name="check-icon" type="checkbox" />
                    <label className={styles.iconMenu + " w-full h-full z-10"} for="check-icon" >
                        <div className={styles.bar}></div>
                        <div className={styles.bar}></div>
                        <div className={styles.bar}></div>
                    </label>
                </div>
                <div className=' flex-col gap-2 mt-2 hidden' id='barItems'>
                    <Button className='w-full invisible opacity-30'>Add Post</Button>
                    <Button className='w-full invisible opacity-30'
                        onClick={() => {
                            setPostsUser(Username)
                        }}
                    >Your Posts</Button>
                    <Button className='w-full invisible opacity-30'>Delete Account</Button>
                </div>
            </div>

            {
                <div
                    className='z-30 h-[100vh]'
                >
                    <Posts UserData={UserData} PostsUser={postsUser} setPostsUser={setPostsUser} />
                </div>
            }

            <div ref={overlayRef} className='absolute top-0 left-0 hidden h-full w-full border-4 border-slate-600 z-40 bg-[rgba(0,0,0,0.8)] transition-opacity duration-500' style={{ opacity: 0 }} >
            </div>

            <div ref={EditDetailsPanelRef} className=' flex justify-center items-center absolute invisible inset-0 z-50 transition-transform duration-500' style={{
                transform: "scale(0)"
            }} onClick={(e) => CloseAllPanels(e)}>
                <EditDetails Data={MainData} BoxRef={BoxRef} setFetchOnCall={setFetchOnCall} />
            </div>

            <div ref={ShowProfilePanelRef} className='w-auto h-auto flex justify-center items-center absolute invisible inset-0 z-50 transition-transform duration-500' style={{
                transform: "scale(0)"
            }} onClick={(e) => CloseAllPanels(e)}>
                <ShowProfile Data={PassedData} BoxRef={BoxRef} setFetchOnCall={setFetchOnCall} UserData={MainData} PostsUser={postsUser} setPostsUser={setPostsUser} />
            </div>

        </div>
    )
}

export default DashboardRight