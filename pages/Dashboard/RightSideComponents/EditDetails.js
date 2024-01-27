import React, { useEffect, useState } from 'react'
import styles from '../../../styles/DashboardRight.module.css'
import Image from 'next/image'
import { EncryptData } from '@/pages/EncryptingFunctions'
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import ChangeDataSections from './ChangeDataSections'
import defaultProfilePicture from '../../../public/Assets/defaultProfilePicture.png'
import axios from 'axios'

function EditDetails({ Data, setFetchOnCall, BoxRef }) {
    const [isImageLoading, setIsImageLoading] = useState(false)

    const [ReceivedData, setReceivedData] = useState({
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

    useEffect(() => {
        setReceivedData({
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
    }, [Data])

    const OpenFileDialog = async () => {
        return new Promise((resolve, reject) => {
            try {
                const fileInput = document.createElement('input')
                fileInput.type = 'file'
                fileInput.accept = 'image/*'
                fileInput.multiple = false

                fileInput.addEventListener('cancel', (e) => {
                    reject("No Image Selected")
                    setIsImageLoading(false)
                })

                fileInput.onchange = function (e) {
                    const file = fileInput.files[0]
                    // const reader = new FileReader()
                    // reader.onload = function () {
                    //     const dataURL = reader.result
                    //     const imagedata = dataURL.split(",")
                    //     const base64 = imagedata[1]
                    //     resolve(base64)
                    // }

                    // reader.readAsDataURL(file)
                    resolve(file)
                }
                fileInput.click()
            } catch (e) {
                setIsImageLoading(false)
                reject(e)
            }
        });
    }
    const byteSize = str => new Blob([str]).size;
    const ChangeProfilePic = async () => {
        setIsImageLoading(true)
        const file = await OpenFileDialog()

        if (file) {
            let fileFormData = new FormData()
            fileFormData.append('Username', ReceivedData.Username)
            fileFormData.append('FileData', file)
            fileFormData.append('Filename', EncryptData(ReceivedData.ProfilePic + ".jpg"))
            fileFormData.append('Bucket', EncryptData('profile-pictures'))


            const base64 = await new Promise((resolve, reject) => {
                try {
                    const reader = new FileReader()

                    reader.onload = function () {
                        const dataURL = reader.result
                        const imageData = "data:image/jpeg;base64," + dataURL.split(",")[1]
                        resolve(imageData)
                    }

                    reader.readAsDataURL(file)
                } catch (e) {
                    reject(e)
                }
            })

            const response = await axios.post("/api/UploadFile", fileFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            const data = await response.data

            if (data.ok) {
                const output = document.getElementById('user_profile_pic')
                const edit_output = document.getElementById('edit_details_user_pfp')
                edit_output.src = base64
                output.src = base64
                setIsImageLoading(false)
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                })

                Toast.fire({
                    icon: 'success',
                    title: 'Profile Picture Changed'
                })

            } else {
                setIsImageLoading(false)
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                })

                Toast.fire({
                    icon: 'error',
                    title: 'Profile Picture Change Failed'
                })
            }
        }

    }

    const changeData = async (OldValue, NewValue, Column) => {
        if (OldValue != NewValue) {
            const data = {
                [Column]: NewValue
            }

            const response = await fetch('/api/UpdateData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: data,
                    Username: ReceivedData.Username
                })
            })
            const result = await response.json()
            if (result.ok) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                })

                Toast.fire({
                    icon: 'success',
                    title: 'Data Changed'
                })

                ReceivedData[Column] = NewValue
                setReceivedData(ReceivedData)

                Data[Column] = NewValue
            } else {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                })

                Toast.fire({
                    icon: 'error',
                    title: 'Data Change Failed'
                })
            }
            setFetchOnCall(true)
            return response
        } else {
            return { ok: true }
        }

    }

    useEffect(() => {
        const output = document.getElementById('edit_details_user_pfp')
        output.src = document.getElementById("user_profile_pic").src
    }, [])

    return (

        <div className='w-[80%] h-[80%] bg-slate-600 scroll-smooth border-2 border-slate-800 rounded-2xl text-white flex flex-col justify-evenly items-center pt-2' ref={BoxRef} id='EditDetailsPanel'>

            <h2 className={styles.heading + ' text-[20px] underline underline-offset-8 decoration-dashed'}>Edit Details</h2>

            <div className='w-full h-full flex flex-row items-evenly justify-center'>

                <div className='w-[30%] h-full flex flex-col items-center justify-center'>
                    <Image width={400} height={400} alt='profilepicture' className='bg-slate-300 aspect-square w-[120px] max-w-full rounded-full border-2 border-black object-cover' id='edit_details_user_pfp' src={defaultProfilePicture} unoptimized />

                    <div className='w-full h-fit mt-4 flex flex-col items-center justify-center'>
                        <h2 className={styles.heading + ' leading-[32px] text-[20px]'}></h2>

                        {
                            isImageLoading ?
                                <button className={styles.loader}></button> :
                                <Button onClick={() => ChangeProfilePic()}>
                                    Change
                                </Button>
                        }
                    </div>
                </div>

                <div className='w-[60%] h-full flex flex-col items-start justify-center gap-2' >

                    <ChangeDataSections label={"Name"} defaultValue={ReceivedData.Name} action={changeData} />
                    <ChangeDataSections label={"Email"} defaultValue={ReceivedData.Email} action={changeData} />
                    <ChangeDataSections label={"Bio"} defaultValue={ReceivedData.Bio} action={changeData} />
                    <ChangeDataSections label={"Password"} defaultValue={ReceivedData.Password} action={changeData} />
                </div>
            </div>
        </div>

    )
}

export default EditDetails