import React, { useEffect, useState } from 'react'
import styles from "../styles/Dashboard.module.css"
import DashboardLeft from '../components/Dashboard/DashboardLeft'
import DashboardRight from '../components/Dashboard/DashboardRight'
import { getSessionUser } from '../lib/auth'
import DashboardFallback from '../components/Dashboard/DashboardFallback'
import useSWR from 'swr'
import { DecryptData } from '../components/EncryptingFunctions'


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
    const { req } = context
    const Username = await getSessionUser(req)

    if (!Username) {
        return { redirect: { destination: '/', permanent: false } }
    }

    return { props: { Username, NewUser: false } }
}
