import React, { useEffect, useState } from 'react'
import Navbar from '../Components/Navbar'
import LoginPageLeft from '../Components/LoginPageLeft'
import LoginPageRight from '../Components/LoginPageRight'
import styles from '../../styles/Login.module.css'
import rightGroup from '../../public/Assets/LoginPageRightYellowGroup.png'
import Image from 'next/image'

function Login({ setLogin, isLogin, setUsername, setPassword, setName, usernameRef, loginUser, passwordRef, nameRef, emailRef, setEmail }) {

    return (
        <div className={styles.LoginLayout}>
            <LoginPageLeft setUsername={setUsername} setPassword={setPassword} isLogin={isLogin} usernameRef={usernameRef} loginUser={loginUser} passwordRef={passwordRef} setLogin={setLogin} emailRef={emailRef} setEmail={setEmail} nameRef={nameRef} setName={setName} />
            <LoginPageRight isLogin={isLogin} />
        </div>
    )
}

export default Login