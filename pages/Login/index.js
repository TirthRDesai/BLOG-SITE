import React, { useEffect, useState } from 'react'
import LoginPageLeft from '../Components/LoginPageLeft'
import LoginPageRight from '../Components/LoginPageRight'
import styles from '../../styles/Login.module.css'

function Login({ setLogin, isLogin, setUsername, setPassword, setName, usernameRef, loginUser, passwordRef, nameRef, emailRef, setEmail }) {

    return (
        <div className={styles.LoginLayout}>
            <LoginPageLeft setUsername={setUsername} setPassword={setPassword} isLogin={isLogin} usernameRef={usernameRef} loginUser={loginUser} passwordRef={passwordRef} setLogin={setLogin} emailRef={emailRef} setEmail={setEmail} nameRef={nameRef} setName={setName} />
            <LoginPageRight isLogin={isLogin} />
        </div>
    )
}

export default Login