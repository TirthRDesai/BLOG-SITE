import React, { useEffect, useRef, useState } from 'react'
import styles from '../../styles/DashboardRight.module.css'
import EditDetails from './RightSideComponents/EditDetails'
import ShowProfile from './RightSideComponents/ShowProfile'
import Posts from './RightSideComponents/Posts'
import { Button } from '@/components/ui/button'
import { ClientSideCookies } from '../CustomCookie'

function DashboardRight({ Action, Data, setFetchOnCall, UserData, setAction, setData }) {


    const [isPostsLoaded, setIsPostsLoaded] = useState(false)

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

        if (Data.Username != Username) {
            setTimeout(() => {
                setPassedData({
                    Username: Data.Username,
                    Name: Data.Name,
                    Bio: Data.Bio,
                    ProfilePic: Data.ProfilePic,
                    Followers: Data.Followers,
                    Following: Data.Following,
                    ImageData: Data.ImageData
                })
            }, 500)
        }
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

        console.log(BoxCoordinates)

        const ClickedCoordinates = [e.clientX, e.clientY]

        console.log(ClickedCoordinates)
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

    return (

        <div className={styles.DashboardRight}>
            <div
                className='z-30 h-[100vh]'
            >
                <Posts UserData={UserData} />
            </div>

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

                <ShowProfile Data={PassedData} BoxRef={BoxRef} setFetchOnCall={setFetchOnCall} UserData={MainData} />

            </div>

        </div>
    )
}

export default DashboardRight