import React, { useEffect, useState } from 'react'
import StaticFunctions from '@/pages/api/StaticFunctions';
import { DecryptData } from '@/pages/EncryptingFunctions';
import PostLayout from './PostLayout';
import styles from '../../../styles/Posts.module.css'

function Posts({ UserData }) {
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

    const [Posts, setPosts] = useState({
        id: "",
        created_at: "",
        Username: "",
        TextPart: "",
        Image1: "",
        Image2: "",
        Image3: ""
    })

    const [currentPost, setCurrentPost] = useState({
        id: "",
        created_at: "",
        Username: "",
        TextPart: "",
        ImagePart: [],
        IsFollowed: false
    })

    const [AllPosts, setAllPosts] = useState([])
    useEffect(() => {
        async function fetchPosts() {
            const staticFunctions = new StaticFunctions(MainData.Username)
            const response = await staticFunctions.GetPosts("")
            const data = await JSON.parse(DecryptData(response))
            if (data.ok) {
                setAllPosts(data.data)
            }
        }
        fetchPosts()
    }, [MainData])

    useEffect(() => {
        if (AllPosts.length > 0) {
            const TimestampSortedPosts = Posts.sort((a, b) => {
                return b.created_at - a.created_at
            })

            setPosts(TimestampSortedPosts)
        }
    }, [AllPosts, Posts])

    useEffect(() => {
        let ImagePart = []

        if (Posts && Posts.id != "") {
            if (Posts.Image1 != "NOIMAGE") {
                ImagePart.push(Posts.Image1)
            }
            setCurrentPost({
                id: Posts.id,
                created_at: Posts.created_at,
                Username: Posts.Username,
                TextPart: Posts.TextPart,
                ImagePart: ImagePart,
                IsFollowed: true ? MainData.Following.includes(Posts.Username) : false
            })
        }
    }, [Posts, MainData])

    useEffect(() => {
        if (currentPost && currentPost.id != "") {

        }
    }, [currentPost])

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

    return (
        <div className={styles.PostsMain + ' h-full w-full overflow-scroll overflow-x-hidden'}>

            <PostLayout />
            <PostLayout />
            <PostLayout />
            <PostLayout />

        </div>
    )
}

export default Posts