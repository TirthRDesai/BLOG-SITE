import React, { useEffect, useRef, useState } from 'react'
import styles from '../../styles/DashboardRight.module.css'
import EditDetails from './RightSideComponents/EditDetails'
import ShowProfile from './RightSideComponents/ShowProfile'
import Posts from './RightSideComponents/Posts'
import { Button } from '@/components/ui/button'
import { ClientSideCookies } from '../CustomCookie'

function DashboardRight({ Action, Data, setFetchOnCall, UserData }) {

    const [Panel, setPanel] = useState('POSTS')

    const EditDetailsPanelRef = useRef(null)
    const ShowProfilePanelRef = useRef(null)

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

        if (Action == "EDIT") {
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
            }, delay)
        }
        else if (Action == "PROFILE") {
            console.log(Action)
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
            }, delay)
        }


        setPanel(Action)
    }, [Action, Data, Panel, Username])

    return (

        <div className={styles.DashboardRight}>
            <div ref={EditDetailsPanelRef} className='absolute invisible w-full h-full inset-0 z-30 transition-transform duration-500' style={{
                transform: "scale(0)"
            }}>
                <EditDetails Data={MainData} setFetchOnCall={setFetchOnCall} />
            </div>

            <div ref={ShowProfilePanelRef} className='absolute invisible w-full h-full inset-0 z-30 transition-transform duration-500' style={{
                transform: "scale(0)"
            }}>

                <ShowProfile Data={PassedData} setFetchOnCall={setFetchOnCall} UserData={MainData} />

            </div>
        </div>
    )
}

export default DashboardRight