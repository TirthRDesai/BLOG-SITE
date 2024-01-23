import React, { Suspense, useEffect, useState } from 'react'
import styles from "../../styles/Dashboard.module.css"
import DashboardLeft from './DashboardLeft'
import DashboardRight from './DashboardRight'
import { ServerSideCookies } from '../CustomCookie'
import DashboardFallback from './DashboardFallback'
import useSWR from 'swr'
import { DecryptData } from '../EncryptingFunctions'


function Dashboard({ Username, NewUser }) {

    const [fetchOnCall, setFetchOnCall] = useState(false)

    const [UserData, setUserData] = useState(null)

    const [Action, setAction] = useState('POSTS')
    const [Data, setData] = useState({})

    useEffect(() => {
        if (NewUser == "true" || NewUser == true) {
            // console.log("HERE")

        }
    }, [NewUser])

    useEffect(() => {
        async function fetchData() {
            const response = await fetch("/api/GetUserData/" + Username, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }

            })
            const userData = await response.json()
            if (userData.ok) {
                setUserData(JSON.parse(DecryptData(userData.data)))
            }
            setFetchOnCall(false)
        }
        if (fetchOnCall) {
            fetchData()
        }
    }, [fetchOnCall, Username])

    const fetcher =
        async (Username) => {
            const response = await fetch("/api/GetUserData/" + Username, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const userData = await response.json()

            return JSON.parse(DecryptData(userData.data))
        }

    const { data, error } = useSWR(
        Username,
        fetcher,
        {
            refreshInterval: 600 * 1000,
            revalidateOnFocus: true
        }
    )
    useEffect(() => {
        if (data) {
            setUserData(data)
        }
    }, [data])

    if (error) {
        console.log(error)
        return (
            <div>
                Error
            </div>
        )
    }

    if (!data) {
        return (
            <DashboardFallback />
        )
    }



    return (

        <div className={styles.DashboardLayout}>
            <DashboardLeft UserData={UserData} setFetchOnCall={setFetchOnCall} setAction={setAction} setData={setData} />
            <DashboardRight Action={Action} Data={Data} setFetchOnCall={setFetchOnCall} UserData={UserData} setAction={setAction} setData={setData} />
        </div>
    )


}

export default Dashboard

export async function getServerSideProps(context) {
    const { req, res } = context

    try {
        // const { NewUser } = context.query

        const serverSideCookie = new ServerSideCookies(req, res)

        try {
            const cookies = serverSideCookie.getCustomAllCookie()
            const isLoggedIn = cookies.isLoggedIn

            if (isLoggedIn == "No" || isLoggedIn == undefined) {
                return {
                    redirect: {
                        destination: '/',
                        permanent: false,
                    },
                }
            }

            const { Username } = cookies

            return {
                props: {
                    Username: Username,
                    NewUser: true
                }
            }
        } catch (e) {

            serverSideCookie.clear()
            console.log(e)

            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            }
        }
    } catch (e) {
        console.log(e)
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }
}