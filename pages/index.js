import { useEffect, useRef, useState } from 'react'
import Login from '../components/Login'
import { EncryptData, DecryptData } from '../components/EncryptingFunctions'
import { useRouter } from 'next/router'
import { ClientSideCookies, ServerSideCookies } from '../components/CustomCookie'

const CryptoJS = require('crypto-js')

export default function Home({ response }) {

    const clientSideCookies = new ClientSideCookies()

    const [login, setLogin] = useState(true)
    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)
    const [name, setName] = useState(null)
    const [email, setEmail] = useState(null)

    const usernameRef = useRef(null)
    const passwordRef = useRef(null)
    const nameRef = useRef(null)
    const emailRef = useRef(null)

    const router = useRouter()


    const [baseUrl, setBaseUrl] = useState("")
    useEffect(() => {
        setBaseUrl(location.origin)
    }, [])

    const shakeAnimation = (field) => {
        field.animate([
            { transform: 'translateX(0px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(0px)' },
        ], {
            duration: 100,
            iterations: 3
        })
    }


    const loginUser = async () => {
        const usernameField = usernameRef.current
        const passwordField = passwordRef.current

        const usernameInput = usernameField.children[0]
        const passwordInput = passwordField.children[0]

        if (password == null || password.trim().length == 0) {
            shakeAnimation(passwordField)
            passwordInput.style.borderColor = 'red'
            setTimeout(() => passwordInput.style.borderColor = "#f4f4f4", 3000)
        }
        if (username == null || username.trim().length == 0) {
            shakeAnimation(usernameField)
            usernameInput.style.borderColor = 'red'
            setTimeout(() => usernameInput.style.borderColor = "#f4f4f4", 3000)
        }

        if (!login) {
            const nameField = nameRef.current
            const emailField = emailRef.current

            const nameInput = nameField.children[0]
            const emailInput = emailField.children[0]

            if (name == null) {
                shakeAnimation(nameField)
                nameInput.style.borderColor = 'red'
                setTimeout(() => nameInput.style.borderColor = "#f4f4f4", 3000)
            }
            if (email == null) {
                shakeAnimation(emailField)
                emailInput.style.borderColor = 'red'
                setTimeout(() => emailInput.style.borderColor = "#f4f4f4", 3000)
            }
            if (password == null) {
                shakeAnimation(passwordField)
                passwordInput.style.borderColor = 'red'
                setTimeout(() => passwordInput.style.borderColor = "#f4f4f4", 3000)
            }
            if (username == null) {
                shakeAnimation(usernameField)
                usernameInput.style.borderColor = 'red'
                setTimeout(() => usernameInput.style.borderColor = "#f4f4f4", 3000)
            }


            if (username == null) {
                usernameInput.focus()
                return
            } else if (email == null) {
                emailInput.focus()
                return
            } else if (name == null) {
                nameInput.focus()
                return
            } else if (password == null) {
                passwordInput.focus()
                return
            }
        }

        if (username == null || username.trim().length == 0) {
            usernameInput.focus()
            return
        } else if (password == null ||
            password.trim().length == 0) {
            passwordInput.focus()
            return
        }


        if (login) {
            const sendData = {
                username: username,
                password: password
            }

            const response = await fetch(baseUrl + "/api/CheckData", {
                method: "POST",
                body: JSON.stringify(sendData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const result = await response.json()
            if (result.ok) {
                const data = CryptoJS.AES.decrypt(result.data, process.env.NEXT_PUBLIC_KEY)
                const DataReceived = JSON.parse(data.toString(CryptoJS.enc.Utf8))

                clientSideCookies.setCustomCookie("Username", DataReceived.Username)
                clientSideCookies.setCustomCookie("isLoggedIn", "Yes")

                router.push({
                    pathname: "/Dashboard",
                    query: {
                        NewUser: false
                    }
                }, "Dashboard")
            } else {
                alert(result.message)
            }
        } else {
            const sendData = {
                Username: username,
                Password: password,
                Name: name,
                Email: email
            }
            const response = await fetch(baseUrl + "/api/AddData", {
                method: "POST",
                body: JSON.stringify(sendData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const result = await response.json()

            if (result.ok) {
                const data = CryptoJS.AES.decrypt(result.data, process.env.NEXT_PUBLIC_KEY)
                const DataReceived = JSON.parse(data.toString(CryptoJS.enc.Utf8))

                clientSideCookies.setCustomCookie("Username", DataReceived.Username)
                clientSideCookies.setCustomCookie("isLoggedIn", "Yes")
                router.push({
                    pathname: "/Dashboard",
                    query: {
                        NewUser: true
                    }
                }, "Dashboard")
            } else {
                alert(result.message)
            }
        }
    }

    useEffect(() => {
        const inputBox = usernameRef.current.children[0]
        if (username != null) {
            inputBox.value = username.toLowerCase()
        }
    }, [username])


    return (
        <div>
            <Login setLogin={setLogin} isLogin={login} setUsername={setUsername} setPassword={setPassword} setName={setName} usernameRef={usernameRef} loginUser={loginUser} passwordRef={passwordRef} nameRef={nameRef} setEmail={setEmail} emailRef={emailRef} />
        </div>
    )
}

export async function getServerSideProps(context) {
    const { req, res } = context


    const serverSideCookie = new ServerSideCookies(req, res)


    const isLoggedIn = serverSideCookie.getCustomCookie("isLoggedIn")

    if (isLoggedIn == "Yes") {
        return {
            redirect: {
                destination: "/Dashboard",

                permanent: false,


            }
        }
    }

    serverSideCookie.setCustomCookie("isLoggedIn", "No")

    return {
        props: {
            response: "result"
        }
    }
}