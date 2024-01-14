import React from 'react'
import styles from '../../styles/LoginPageRight.module.css'
import { Balsamiq_Sans } from 'next/font/google'

const balsamiqFont = Balsamiq_Sans({
    subsets: ['latin'],
    weight: '700'
})


function LoginPageRight({ isLogin }) {
    return (
        <div className={styles.LoginPageRightLayout}>
            <div className={styles.MainContainer}>

                <h1 className='text-[2rem] font-bold text-center selection:bg-transparent leading-none' ><span className={balsamiqFont.className}>{isLogin ? "Its Good to See" : "Get Started"}<br />{isLogin ? "You Back" : ""}</span></h1>

                <p className='w-[70%] mt-[3rem] selection:bg-transparent text-center text-[1.1rem]'>
                    <strong>Share your Thoughts...</strong>
                    <br />
                    <strong>Share your Ideas...</strong>
                    <br />
                    <strong>Connect with people...</strong>
                    <br />
                    <strong>Take Opinions...</strong>
                </p>
            </div>
        </div>
    )
}

export default LoginPageRight