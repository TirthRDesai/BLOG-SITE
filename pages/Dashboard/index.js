import React, { Suspense, useEffect, useState } from 'react'
import styles from "../../styles/Dashboard.module.css"
import DashboardLeft from './DashboardLeft'
import DashboardRight from './DashboardRight'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import getUserData from '../api/GetUserData'
import { getCookies } from 'cookies-next'
import { ServerSideCookies } from '../CustomCookie'
import DashboardFallback from './DashboardFallback'
import useSWR from 'swr'
import { DecryptData } from '../EncryptingFunctions'


function Dashboard({ Username }) {

    const [fetchOnCall, setFetchOnCall] = useState(false)

    const [UserData, setUserData] = useState(null)

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
        }
        if (fetchOnCall) {
            fetchData()
            setFetchOnCall(false)
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

            console.log(JSON.parse(DecryptData(userData.data)))
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
            console.log(data)
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
            <DashboardLeft UserData={UserData} setFetchOnCall={setFetchOnCall} />
            <DashboardRight />
        </div>
    )


}

export default Dashboard

export async function getServerSideProps(context) {
    const { req, res } = context

    const serverSideCookie = new ServerSideCookies(req, res)

    try {
        const cookies = serverSideCookie.getCustomAllCookie()
        const isLoggedIn = cookies.isLoggedIn

        if (isLoggedIn == "No" || isLoggedIn == undefined) {
            console.log("GOING BACK")
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
}