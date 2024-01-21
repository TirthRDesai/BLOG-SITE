import React, { useEffect, useRef, useState } from 'react'
import StaticFunctions from '@/pages/api/StaticFunctions';
import { DecryptData } from '@/pages/EncryptingFunctions';
import PostLayout from './PostLayout';
import styles from '../../../styles/Posts.module.css'

function Posts({ UserData }) {

    const mainRef = useRef(null)

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

    const [FinalPostData, setFinalPostData] = useState([])

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

    const [Username, setUserame] = useState("")

    useEffect(() => {
        if (MainData.Username != "" && MainData.Username != undefined) {
            setUserame(MainData.Username)
        }
    }, [MainData])

    useEffect(() => {
        async function fetchPosts() {
            console.log("FETCHING POSTS")
            const staticFunctions = new StaticFunctions(Username)
            const response = await staticFunctions.GetPosts("")
            const data = await JSON.parse(DecryptData(response))
            if (data.ok) {
                setAllPosts(JSON.parse(DecryptData(data.data)))
            }
        }
        fetchPosts()
    }, [Username])

    useEffect(() => {
        if (AllPosts.length > 0) {
            for (let i = 0; i < AllPosts.length; i++) {
                setPosts({
                    id: AllPosts[i].id,
                    created_at: AllPosts[i].created_at,
                    Username: AllPosts[i].Username,
                    TextPart: AllPosts[i].TextPart,
                    Image1: AllPosts[i].Image1,
                    Image2: AllPosts[i].Image2,
                    Image3: AllPosts[i].Image3
                })
            }
        }
    }, [AllPosts])

    useEffect(() => {
        let ImagePart = []

        if (Posts && Posts.id != "") {
            if (Posts.Image1 != "NOIMAGE") {
                ImagePart.push(Posts.Image1)
            }
            if (Posts.Image2 != "NOIMAGE") {
                ImagePart.push(Posts.Image2)
            }
            if (Posts.Image3 != "NOIMAGE") {
                ImagePart.push(Posts.Image3)
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
        if (currentPost.id != undefined && currentPost.id != null && currentPost.id != "" && currentPost.Username != Username) {
            let present = false
            for (let i = 0; i < FinalPostData.length; i++) {
                if (FinalPostData[i].id == currentPost.id) {
                    present = true
                    break
                }
            }

            if (!present) {
                setFinalPostData([...FinalPostData, currentPost])
            }

        }
    }, [currentPost, FinalPostData, Username])

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
        <div className={styles.PostsMain + ' h-full w-full overflow-scroll overflow-x-hidden'} ref={mainRef}>
            {
                FinalPostData ?
                    FinalPostData.map((data) => {
                        { console.log(data) }
                        return <PostLayout CurrentPost={data} key={data.id} />
                    }) : ""
            }
        </div>
    )
}

export default Posts