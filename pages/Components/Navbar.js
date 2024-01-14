import React from 'react'
import styles from "../../styles/Navbar.module.css"
import Image from 'next/image'

function Navbar() {
    return (
        <div className={styles.layout}>
            <Image alt="Logo" className={styles.logoSVG} src={"/blog2.svg"} width={0} height={0} />

            <div className={styles.navOptions}>
                <div className={styles.navOption}>Home</div>
                <div className={styles.navOption}>About</div>
                <div className={styles.navOption}>Contact</div>
                <div className={styles.navOption}>Login</div>
            </div>

            <input type='text' placeholder='Search for trendings...' className={styles.searchBar} />
        </div>
    )
}

export default Navbar