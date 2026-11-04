import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useState } from 'react'
import { TbArrowBigRightLinesFilled } from "react-icons/tb";
import styles from "../../../styles/AddPosts.module.css"
import Swal from 'sweetalert2';
import Image from 'next/image'
import { Button } from '@/components/ui/button';
import { MdDeleteForever } from 'react-icons/md'
import PostLayout from './PostLayout';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

function AddPosts({ UserData, setAddPost, setPostsUser }) {
    useEffect(() => {
        UserData.ProfilePic = document.getElementById("user_profile_pic").src
    }, [UserData])

    const [isSharing, setIsSharing] = useState(false)

    const [TextPart, setTextPart] = useState("")
    const [Image1, setImage1] = useState(null)
    const [Image2, setImage2] = useState(null)
    const [Image3, setImage3] = useState(null)

    const [PostData, setPostData] = useState({
        id: "9dpqkxdq5",
        Username: "",
        TextPart: "",
        Image1: "",
        Image2: "",
        Image3: ""
    })

    const [ViewPost, setViewPost] = useState(false)

    const ImageSelected = (e) => {
        if (e.target.files.length > 3) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'You can only upload 3 images at a time',
            })
            return
        }
        if (e.target.files[0]) {
            setImage1(e.target.files[0])

        }
        if (e.target.files[1]) {
            setImage2(e.target.files[1])
        }
        if (e.target.files[2]) {
            setImage3(e.target.files[2])
        }
    }

    const UploadPost = async (e) => {
        e.preventDefault()
        setIsSharing(true)
        if (TextPart == "") {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'You must enter something to post',
            })
            setIsSharing(false)
            return
        }

        try {
            const formData = new FormData()
            formData.append("TextPart", TextPart)
            if (Image1) formData.append("Image1", Image1)
            if (Image2) formData.append("Image2", Image2)
            if (Image3) formData.append("Image3", Image3)

            const response = await fetch("/api/UploadPost", { method: "POST", body: formData })
            const result = await response.json()

            if (!result.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: result.message,
                })
                setIsSharing(false)
                return
            }

            setPostData({
                id: "9dpqkxdq5",
                Username: UserData.Username,
                TextPart: TextPart,
                Image1: Image1 ? URL.createObjectURL(Image1) : null,
                Image2: Image2 ? URL.createObjectURL(Image2) : null,
                Image3: Image3 ? URL.createObjectURL(Image3) : null
            })

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: "Post Uploaded Successfully",
            })
            setAddPost(false)
            setTextPart("")
            setImage1(null)
            setImage2(null)
            setImage3(null)
        } catch (err) {
            console.log(err)
        } finally {
            setIsSharing(false)
        }

    }


    return (
        <div className="h-full w-full flex flex-col items-center justify-center">
            <div className="w-[80%] bg-[#F8F8FF] py-4 border-2 border-slate-600 rounded-lg flex flex-col items-center justify-center">
                <h1 className=' font-bold text-xl w-full text-center mb-6 justify-center items-center flex flex-row'>
                    Think<span className='ml-2 mr-2'><TbArrowBigRightLinesFilled /></span>
                    Create<span className='ml-2 mr-2'><TbArrowBigRightLinesFilled /></span>Share</h1>

                {

                    !ViewPost ? <div className='flex flex-col h-full w-full items-center'>
                        <label className='w-[80%] text-start'>Enter your thoughts:</label>
                        <Textarea className={' mt-2 resize-none  h-[100px] border-2 w-[80%] border-black ' + styles.TextArea} placeholder='Share your ideas...' value={TextPart} onChange={(e) => {
                            setTextPart(e.target.value)
                        }} />


                        <div className='w-[80%] mt-3'>

                            <Input type="file" className="w-fit border-2 border-black hover:cursor-pointer" multiple="multiple" accept="image/*" onChange={(e) => ImageSelected(e)} />

                        </div>

                        <div className='w-[80%] flex flex-row gap-2 mt-2 items-center justify-start'>
                            {
                                Image1 ?
                                    <div className='w-[150px] h-[150px] relative'>

                                        <div className='absolute top-2 right-2'>
                                            <Button className='bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.5)] py-4 ' onClick={() => setImage1(null)}>
                                                <MdDeleteForever className='h-6 w-6' />
                                            </Button>
                                        </div>
                                        <Image alt="Image1" src={URL.createObjectURL(Image1)} width={400} height={400} className='w-full h-full rounded-md object-cover border-2 border-black' />
                                    </div> : ""
                            }

                            {
                                Image2 ?
                                    <div className='w-[150px] h-[150px] relative'>

                                        <div className='absolute top-2 right-2'>
                                            <Button className='bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.5)] py-4 ' onClick={() => setImage2(null)}>
                                                <MdDeleteForever className='h-6 w-6' />
                                            </Button>
                                        </div>
                                        <Image alt="Image2" src={URL.createObjectURL(Image2)} width={400} height={400} className='w-full h-full rounded-md object-cover border-2 border-black' />
                                    </div> : ""
                            }

                            {
                                Image3 ?
                                    <div className='w-[150px] h-[150px] relative'>

                                        <div className='absolute top-2 right-2'>
                                            <Button className='bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.5)] py-4 ' onClick={() => setImage3(null)}>
                                                <MdDeleteForever className='h-6 w-6' />
                                            </Button>
                                        </div>
                                        <Image alt="Image3" src={URL.createObjectURL(Image3)} width={400} height={400} className='w-full h-full rounded-md object-cover border-2 border-black' />
                                    </div> : ""
                            }



                        </div>
                    </div>
                        :
                        // <div className='mt-4 w-full h-full'>
                        <PostLayout UserData={UserData} PostUserData={UserData} PostData={PostData} />
                    // </div>
                }

                <div className='w-[80%] flex flex-row justify-between mt-2'>
                    <div className=''>
                        <Button className='bg-red-600 hover:bg-red-800 border-red-900 border-2' onClick={() => {
                            setTextPart("")
                            setImage1(null)
                            setImage2(null)
                            setImage3(null)
                            setAddPost(false)
                            setPostsUser("*")
                        }}>Cancel</Button>
                    </div>
                    <div className=''>

                        {
                            !ViewPost ?
                                <Button className='bg-blue-700 hover:bg-blue-600 border-2 border-blue-900' onClick={() => {
                                    if (TextPart == "") {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Oops...',
                                            text: 'You must enter something to post',
                                        })
                                        return
                                    }
                                    setPostData({
                                        id: "9dpqkxdq5",
                                        Username: UserData.Username,
                                        TextPart: TextPart,
                                        Image1: Image1 ? URL.createObjectURL(Image1) : null,
                                        Image2: Image2 ? URL.createObjectURL(Image2) : null,
                                        Image3: Image3 ? URL.createObjectURL(Image3) : null
                                    })
                                    setViewPost(true)
                                }}>View Blog</Button> :
                                <Button className='bg-blue-700 hover:bg-blue-600 border-2 border-blue-900' onClick={() => {
                                    setViewPost(false)

                                }}>Edit Blog</Button>
                        }

                        {
                            isSharing ?
                                <Button className='realtive w-[150px] ml-4 bg-green-900'><div className={styles.loader}>
                                    <div className={styles.circle}>
                                        <div className={styles.dot}></div>
                                        <div className={styles.outline}></div>
                                    </div>
                                    <div className={styles.circle}>
                                        <div className={styles.dot}></div>
                                        <div className={styles.outline}></div>
                                    </div>
                                    <div className={styles.circle}>
                                        <div className={styles.dot}></div>
                                        <div className={styles.outline}></div>
                                    </div>
                                    <div className={styles.circle}>
                                        <div className={styles.dot}></div>
                                        <div className={styles.outline}></div>
                                    </div>
                                </div></Button> :
                                <Button className='bg-green-600 hover:bg-green-800 border-green-900 ml-4 border-2' onClick={(e) => {
                                    UploadPost(e)
                                }}>Share</Button>
                        }

                    </div>
                </div>

            </div>
        </div>
    )
}

export default AddPosts