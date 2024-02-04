import React, { Suspense, useEffect, useRef, useState } from 'react'
import PostLayout from './PostLayout';
import styles from '../../../styles/Posts.module.css'
import useSWR, { mutate } from 'swr';
import { Button } from '@/components/ui/button';

const FallbackComp = () => {
    return (
        <div className="flex flex-col gap-4 w-full h-full items-center justify-start overscroll-auto">
            <div className="flex gap-4 items-center w-[80%]">
                <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                <div className="flex flex-col gap-4">
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-4 w-28"></div>
                </div>
            </div>
            <div className="skeleton min-h-32 w-[80%]"></div>

            <div className="flex mt-4 gap-4 items-center w-[80%]">
                <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                <div className="flex flex-col gap-4">
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-4 w-28"></div>
                </div>
            </div>
            <div className="skeleton min-h-32 w-[80%]"></div>

            <div className="flex mt-4 gap-4 items-center w-[80%]">
                <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                <div className="flex flex-col gap-4">
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-4 w-28"></div>
                </div>
            </div>
            <div className="skeleton min-h-32 w-[80%]"></div>
        </div>
    )
}

const ErrorComp = ({ error }) => {
    return (
        <h1>Error Occured: <br />{error.toString()}</h1>
    )
}

function Posts({ UserData, PostsUser, setPostsUser, setAction, setData, setFetchOnCall }) {

    const [refreshInterval, setRefreshInterval] = useState(2000)
    const [shouldFetch, setShouldFetch] = useState(true)

    const [SWRdata, setSWRdata] = useState([])

    const [SWRerror, setSWRerror] = useState("")

    const [key, setKey] = useState("AllPosts")

    const [showFallback, setShowFallback] = useState(true)

    useEffect(() => {
        if (key != PostsUser && PostsUser != null) {
            setShowFallback(true)
            if (PostsUser == "*") {
                setKey("AllPosts")
            }
            else {
                setKey(PostsUser + "Posts")
            }
            setSWRdata([])
        }
    }, [PostsUser, key])

    const postsFetcher = async () => {
        if (UserData != null && shouldFetch) {
            setShouldFetch(false)
            let requested = Posts
            if (key == "AllPosts") {
                requested = "*"
            } else {
                requested = key.slice(0, -5)
            }

            const response = await fetch('/api/GetPosts/' + requested, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            const result = await JSON.parse(data.data)

            setShouldFetch(true)
            setRefreshInterval(600 * 1000)

            return result

        } else {
            return null
        }
    }




    const { data, error } = useSWR(
        key,
        postsFetcher,
        {
            refreshInterval: refreshInterval,
            refreshWhenHidden: false,
            refreshWhenOffline: false,
            revalidateOnFocus: false,
            revalidateOnMount: true,
            revalidateOnReconnect: true,
            shouldRetryOnError: true,
            errorRetryInterval: 1000,
            errorRetryCount: 5
        }
    )

    useEffect(() => {
        if (data != null) {
            setShowFallback(false)
            setSWRdata(data)
            setRefreshInterval(150000 * 60)
            setShouldFetch(true)
        } else {
            setShowFallback(true)
            setSWRdata(null)
            setRefreshInterval(500)

        }
    }, [data])

    useEffect(() => {
        if (error) {
            setSWRerror(error)
            setShouldFetch(true)
            setRefreshInterval(500)
        }
    }, [error])


    if (!SWRdata) {
        return (
            <div className={styles.PostsMain + ' h-full w-full overflow-scroll overflow-x-hidden z-20 flex flex-col gap-6 pt-6 min-h-0'}>
                <FallbackComp />
            </div>
        )
    }


    if (SWRerror) {
        if (SWRerror.message != "UserData is Not Loaded") {
            return (
                <ErrorComp error={SWRerror} />
            )
        }
    }





    return (
        <div className={styles.PostsMain + ' h-full w-full overflow-scroll overflow-x-hidden z-20 flex flex-col gap-6 pt-6 min-h-0'}>
            {
                showFallback ?
                    <FallbackComp /> :
                    SWRdata.length > 0 ? SWRdata.map((post) => {
                        return (
                            <PostLayout key={post.PostData.id} PostData={post.PostData} UserData={UserData} PostUserData={post.UserData} setAction={setAction} setData={setData} setFetchOnCall={setFetchOnCall} />
                        )
                    }) : ""
            }
            {
                PostsUser != "*" ?
                    <Button className='absolute bottom-4 right-4' onClick={() => {
                        setPostsUser("*")
                    }}>All Posts</Button> : ""
            }
        </div>
    )
}

export default Posts
