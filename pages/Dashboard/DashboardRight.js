import React, { useEffect, useState } from 'react'
import styles from '../../styles/DashboardRight.module.css'

function DashboardRight() {

    const [rerender, setRerender] = useState(false)

    useEffect(() => {
        if (rerender == true) {
            const ws = new WebSocket('ws://localhost:8080')

            console.log('DashboardRight')

            console.log(ws)


            ws.onerror = (err) => {
                console.log(
                    "Socket encountered error: ",
                    err,
                    "Closing socket"
                );

                ws.close();
            }


            ws.onopen = () => {
                ws.send("HELLO SERVER")

                console.log("Connection Opened")
            };

            ws.onmessage = (event) => {
                console.log('Received:', event.data);
            };
            ws.onclose = () => {
                console.log('Disconnected from WebSocket server');
            };
            setRerender(false)
        }
    }, [rerender])
    return (
        <div className={styles.DashboardRight}>
            <button className='bg-red-500 px-4 py-2 text-center text-white border-2 border-red-800 rounded-xl' onClick={() => setRerender(true)}>RE-RENDER</button>
        </div>
    )
}

export default DashboardRight