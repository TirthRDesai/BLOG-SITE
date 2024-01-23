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

    const [AllPosts, setAllPosts] = useState([])

    const [Username, setUserame] = useState("")

    useEffect(() => {
        if (MainData.Username != "" && MainData.Username != undefined) {
            setUserame(MainData.Username)
        }
    }, [MainData])

    useEffect(() => {
        async function fetchPosts() {
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
        for (let index = 0; index < AllPosts.length; index++) {
            const Posts = AllPosts[index]
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

                let currentPost = {
                    id: Posts.id,
                    created_at: Posts.created_at,
                    Username: Posts.Username,
                    TextPart: Posts.TextPart,
                    ImagePart: ImagePart,
                    IsFollowed: false
                }
                let present = false
                for (let i = 0; i < FinalPostData.length; i++) {
                    if (FinalPostData[i].id == currentPost.id) {
                        present = true
                        break
                    }
                }

                if (!present) {
                    let newData = FinalPostData
                    newData.push(currentPost)

                    setFinalPostData(newData)
                }
            }
        }
    }, [AllPosts, MainData, FinalPostData])

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
        <div className={styles.PostsMain + ' h-full w-full overflow-scroll overflow-x-hidden z-20 flex flex-col gap-6 pt-6 min-h-0'} ref={mainRef}>
            {
                FinalPostData ?
                    FinalPostData.map((data) => {
                        return <PostLayout CurrentPost={data} key={data.id} />
                    }) : ""
            }
        </div>
    )
}

export default Posts