import React, { useEffect, useRef, useState } from 'react'
import styles from '../../styles/DashboardRight.module.css'
import EditDetails from './RightSideComponents/EditDetails'
import ShowProfile from './RightSideComponents/ShowProfile'
import Posts from './RightSideComponents/Posts'
import { Button } from '@/components/ui/button'
import { ClientSideCookies } from '../CustomCookie'

function DashboardRight({ Action, Data, setFetchOnCall }) {

    const [Panel, setPanel] = useState('POSTS')

    const EditDetailsPanelRef = useRef(null)
    const ShowProfilePanelRef = useRef(null)

    const [PassedData2, setPassedData2] = useState({
        Username: "",
        Name: "",
        Bio: "",
        ProfilePic: "",
        Followers: [],
        Following: [],
        ImageData: "",
        Password: "",
        Email: ""
    })

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
        } else {
            console.log("HERE")

            setPassedData2({
                Username: Data.Username,
                Name: Data.Name,
                Bio: Data.Bio,
                ProfilePic: Data.ProfilePic,
                Followers: Data.Followers,
                Following: Data.Following,
                ImageData: Data.ImageData,
                Password: Data.Password,
                Email: Data.Email
            })
        }
    }, [Data, Username])

    useEffect(() => {
        const clientSideCookies = new ClientSideCookies()
        const Username = clientSideCookies.getCustomCookie("Username")
        setUsername(Username)
    }, [])

    const [alreadyOpened, setAlreadyOpened] = useState("")

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
            if (Panel == "EDIT") {
                EditDetailsPanelDiv.style.transform = "scale(0)"
                delay = 500

                setTimeout(() => {
                    EditDetailsPanelDiv.style.visibility = "hidden"
                }, 500);

            }
            if (Panel == "PROFILE") {
                if (alreadyOpened != Data.Username) {
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
    }, [Action, Data, Panel, alreadyOpened])

    return (

        <div className={styles.DashboardRight}>
            <div ref={EditDetailsPanelRef} className='absolute invisible w-full h-full inset-0 z-30 transition-transform duration-500' style={{
                transform: "scale(0)"
            }}>
                <EditDetails Data={PassedData2} setFetchOnCall={setFetchOnCall} />
            </div>

            <div ref={ShowProfilePanelRef} className='absolute invisible w-full h-full inset-0 z-30 transition-transform duration-500' style={{
                transform: "scale(0)"
            }}>

                <ShowProfile Data={PassedData} setFetchOnCall={setFetchOnCall} />

            </div>
        </div>
    )
}

export default DashboardRight