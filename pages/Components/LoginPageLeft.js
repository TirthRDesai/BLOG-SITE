import React, { useEffect, useRef, useState } from 'react'
import styles from '../../styles/LoginPageLeft.module.css'
import { Balsamiq_Sans } from 'next/font/google'
import Image from 'next/image'

const balsamiqFont = Balsamiq_Sans({
    subsets: ['latin'],
    weight: '700'
})

const percentwidth = (element) => {
    var width = element.offsetWidth;
    var parentWidth = element.parentElement.getBoundingClientRect().width;
    var percent = 100 * width / parentWidth;
    return parseInt(percent) + 1 + "%"
}


function LoginPageLeft({ isLogin, setUsername, setPassword, usernameRef, loginUser, passwordRef, setLogin, nameRef, emailRef, setEmail, setName }) {

    const animate_heading_div = (tempHeading) => {
        const headingDiv = document.getElementById("heading")
        const headingSpan = headingDiv.children[0]

        const tempElem = headingSpan.cloneNode(true)
        tempElem.innerText = tempHeading
        tempElem.style.position = "absolute"
        tempElem.style.left = "0"
        tempElem.style.top = "0"
        tempElem.style.width = "fit-content"
        tempElem.style.visibility = "hidden"

        headingDiv.append(tempElem)

        const tempElemWidth = tempElem.getBoundingClientRect().width
        tempElem.remove()

        const newWidth = 100 * tempElemWidth / (headingDiv.getBoundingClientRect().width)


        headingSpan.animate(
            [
                {
                    width: percentwidth(headingSpan),
                },
                {
                    width: "0%",
                },
                {
                    width: parseInt(newWidth) + 1 + "%",
                }

            ], {
            duration: 600,
            easing: "ease-in-out",
            fill: "forwards"
        })
    }

    const animate_fields_open = (field) => {
        const outerDiv = field.current
        const inputField = outerDiv.children[0]
        const icon = outerDiv.children[1]


        outerDiv.style.height = "fit-content"

        // setTimeout(() => {
        //     inputField.style.border = "2px solid #f4f4f4"
        // }, 500)
        inputField.style.borderRadius = "0.75rem"

        outerDiv.animate(
            [
                {
                    marginTop: "0px",
                },
                {
                    marginTop: "1rem",
                }
            ], {
            duration: 600,
            fill: "forwards",
        })


        inputField.animate([{
            borderWidth: "0px"
        }, {
            borderWidth: "2px"
        }, {
            paddingTop: "0.75rem",
            paddingBottom: "0.75rem",
            height: "100%",
            borderWidth: "2px"
        }], {
            duration: 600,
            fill: "forwards",
        })



        icon.style.display = "flex"

        icon.animate(
            [
                {
                    opacity: "0",

                },
                {
                    opacity: "1",
                },
            ], {
            duration: 600,
            fill: "forwards",
        })


    }

    const animate_fields_close = (field) => {
        const outerDiv = field.current
        const inputField = outerDiv.children[0]
        const icon = outerDiv.children[1]

        outerDiv.animate(
            [
                {
                    marginTop: "1rem",
                },
                {
                    marginTop: "0px",
                }
            ], {
            duration: 600,
            fill: "forwards",
        })

        inputField.animate(
            [
                {
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    height: "100%",
                },
                {
                    borderWidth: "2px"

                },
                {
                    paddingTop: "0px",
                    paddingBottom: "0px",
                    height: "0%",
                },
                {
                    paddingTop: "0px",
                    paddingBottom: "0px",
                    height: "0%",
                    borderWidth: "0px"
                }
            ], {
            duration: 600,
            fill: "forwards",
        })



        icon.animate(
            [
                {
                    opacity: "1",
                },
                {
                    opacity: "0",
                },
            ], {
            duration: 600,
            fill: "forwards",
        })

        setTimeout(() => {
            outerDiv.style.height = "0px"
            inputField.style.border = "0px solid #f4f4f4"
            icon.style.display = "none"
        }, 600)
    }



    const newUserClicked = () => {
        passwordRef.current.children[0].value = ""
        let heading = ""
        let tempHeading = ""
        if (isLogin) {
            heading = "Login"
            tempHeading = "Register"
            animate_fields_open(emailRef)
            animate_fields_open(nameRef)
        } else {
            heading = "Register"
            tempHeading = "Login"
            animate_fields_close(emailRef)
            animate_fields_close(nameRef)
        }

        animate_heading_div(tempHeading)


        setLogin(!isLogin)

        setTimeout(() => {
            headingSpan.innerText = tempHeading
        }, 300)

    }

    return (
        <div className={styles.LoginPageLeftLayout}>
            <div className={styles.LoginContainer} id='loginContainer'>
                <div id="heading" className={styles.headingDiv + " selection:bg-transparent flex flex-row w-full justify-center items-center"}>
                    <div id='headingSpan' className={balsamiqFont.className + " align-middle overflow-hidden"}>Login</div>
                </div>
                <diV className={styles.DetailsContainer}>
                    <div className="relative w-full rounded-xl" ref={usernameRef}>
                        <input type="email" className="peer py-3 pe-0 ps-9 block w-full bg-transparent border-2 border-[#f4f4f4] text-base outline-none rounded-xl disabled:opacity-50 disabled:pointer-events-none text-white" placeholder="Enter Username" onChange={(e) => setUsername(e.target.value)} autoComplete='off' />
                        <div className="absolute inset-y-0 start-0 flex items-center justify-end pointer-events-none ps-[10px] peer-disabled:opacity-50 pt-2 peer-disabled:pointer-events-none">
                            <i className="fa-sharp fa-regular fa-at" style={
                                {
                                    width: "1.1rem",
                                    height: "1.1rem",
                                    color: "white",
                                    flexShrink: "0",
                                }
                            }></i>
                        </div>
                    </div>
                    {
                        // h-0 remove
                        // py-3 border-2 
                    }
                    <div className="relative flex items-center justify-center w-full" style={{ marginTop: "0px", height: "0px" }} ref={emailRef}>
                        <input type="email" className="peer py-0 pe-0 ps-9 block w-full bg-transparent text-base outline-none disabled:opacity-50 disabled:pointer-events-none text-white" placeholder="Enter Email" onChange={(e) => setEmail(e.target.value)} style={{ height: "0px" }} autoComplete='off' />
                        <div className="absolute inset-y-0 start-0 hidden items-center justify-end pointer-events-none ps-[10px] peer-disabled:opacity-50 pt-1 opacity-0 border-[#f4f4f4] peer-disabled:pointer-events-none">
                            <i className="fa-regular fa-envelope" style={
                                {
                                    width: "1.1rem",
                                    height: "1.1rem",
                                    color: "white",
                                    flexShrink: "0",
                                }
                            }></i>
                        </div>
                    </div>
                    <div className="relative flex items-center justify-center w-full" style={{ marginTop: "0px", height: "0px" }} ref={nameRef}>
                        <input type="text" className="peer py-0 pe-0 ps-9 block w-full bg-transparent border-0 text-base outline-none disabled:opacity-50 disabled:pointer-events-none text-white" placeholder="Enter Name" onChange={(e) => setName(e.target.value)} autoComplete='off' style={{ height: "0px" }} />
                        <div className="absolute inset-y-0 start-0 hidden items-center justify-end pointer-events-none ps-[10px] peer-disabled:opacity-50 pt-1 opacity-0 peer-disabled:pointer-events-none">
                            <i className="fa-regular fa-id-card" style={
                                {
                                    width: "1.1rem",
                                    height: "1.1rem",
                                    color: "white",
                                    flexShrink: "0",
                                }
                            }></i>
                        </div>
                    </div>

                    <div className="relative w-full mt-4" ref={passwordRef}>
                        <input type="password" className="peer py-3 pe-0 ps-9 block w-full bg-transparent border-2 border-[#f4f4f4] text-base outline-none rounded-xl disabled:opacity-50 disabled:pointer-events-none text-white" placeholder="Enter Password" onPaste={(e) => e.preventDefault()} onChange={(e) => setPassword(e.target.value)} autoComplete='off' />
                        <div className="absolute inset-y-0 start-0 flex items-center justify-end pointer-events-none ps-[10px] peer-disabled:opacity-50 pt-1 peer-disabled:pointer-events-none">
                            <i className="fa-regular fa-key" style={
                                {
                                    width: "1.1rem",
                                    height: "1.1rem",
                                    color: "white",
                                    flexShrink: "0",
                                }
                            }></i>
                        </div>
                    </div>
                </diV>

                <div className='flex flex-col items-center justify-center w-[60%]'>
                    <button className="bg-[rgb(244,244,244)] text-black font-bold py-3 px-6 rounded-xl w-full hover:bg-[rgba(244,244,244,0.8)] max-w-fit" onClick={() => loginUser()}>{isLogin ? "Let's Go" : "Let's Start"}</button>

                    <div className='w-full flex flex-row justify-between mt-4'>

                        <span className="text-white text-sm cursor-pointer hover:underline">{isLogin ? "Forgot Password?" : ""}</span>
                        <span className='text-white text-sm cursor-pointer hover:underline' onClick={newUserClicked}>{isLogin ? "New User?" : "Already have an account?"}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPageLeft