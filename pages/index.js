import Head from "next/head"
import { useState } from "react"
import { useRouter } from "next/router"
import { getSession } from "../lib/auth"
import { Mark, Avatar } from "../components/ui"

const USERNAME_RE = /^[a-z0-9_]{3,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Sample() {
    // An illustration of a story card, not real content.
    return (
        <div className="auth-sample" aria-hidden="true">
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Avatar user={{ Name: "Maya Okafor", Username: "maya" }} size={36} />
                <div className="who"><b>Maya Okafor</b><span>@maya · 2m</span></div>
            </div>
            <p>Rain on the 6:40 ferry. Wrote this whole paragraph with cold hands and I regret nothing.</p>
            <div className="sample-photo">
                <svg viewBox="0 0 320 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
                    <rect width="320" height="200" fill="#1c1c1c" />
                    <circle cx="232" cy="64" r="30" fill="#c6f24e" />
                    <path d="M0 132 Q40 118 80 132 T160 132 T240 132 T320 132 V200 H0Z" fill="#2a2a2a" />
                    <path d="M0 160 Q40 146 80 160 T160 160 T240 160 T320 160 V200 H0Z" fill="#111" />
                </svg>
            </div>
        </div>
    )
}

export default function Home() {
    const router = useRouter()
    const [mode, setMode] = useState("login")
    const [form, setForm] = useState({ username: "", name: "", email: "", password: "" })
    const [show, setShow] = useState(false)
    const [error, setError] = useState("")
    const [busy, setBusy] = useState(false)
    const signup = mode === "signup"

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
    const switchMode = (m) => { setMode(m); setError("") }

    const submit = async (e) => {
        e.preventDefault()
        setError("")
        const username = form.username.trim().toLowerCase()
        if (!signup && (!username || !form.password)) return setError("Enter your username and password.")
        if (signup) {
            if (!USERNAME_RE.test(username)) return setError("Username must be 3-20 characters: letters, numbers or underscore.")
            if (!form.name.trim()) return setError("Tell us your name.")
            if (!EMAIL_RE.test(form.email)) return setError("That email doesn't look right.")
            if (form.password.length < 8) return setError("Password must be at least 8 characters.")
        }

        setBusy(true)
        try {
            const res = await fetch(signup ? "/api/AddData" : "/api/CheckData", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    signup
                        ? { Username: username, Password: form.password, Email: form.email, Name: form.name }
                        : { username, password: form.password }
                ),
            })
            const data = await res.json()
            if (!data.ok) throw new Error(data.message)
            if (signup && !data.confirmed) {
                setMode("login")
                setError("")
                setBusy(false)
                return alert(data.message)
            }
            router.push("/Dashboard")
        } catch (err) {
            setError(err.message || "Something went wrong. Try again.")
            setBusy(false)
        }
    }

    return (
        <>
            <Head>
                <title>BlogSite - Tell your story. Get followed.</title>
                <meta name="description" content="Publish short stories with photos, follow the writers you love and grow your own audience." />
            </Head>
            <div className="auth">
                <section className="auth-hero">
                    <div className="brand"><Mark size={32} /> BlogSite</div>
                    <Sample />
                    <h1 className="auth-headline">Tell your story. Get followed.</h1>
                    <p className="auth-sub">Publish short stories with photos, follow the writers you love, and watch your own audience grow.</p>
                </section>

                <section className="auth-panel">
                    <form className="auth-form" onSubmit={submit} noValidate>
                        <h2>{signup ? "Create your account" : "Welcome back"}</h2>
                        <p className="lead">{signup ? "It takes less than a minute." : "Log in to read and write stories."}</p>

                        <div className="field">
                            <label htmlFor="username">Username</label>
                            <input id="username" className="input" autoComplete="username" autoCapitalize="none" spellCheck={false}
                                value={form.username} onChange={set("username")} placeholder="maya_writes" />
                        </div>

                        {signup && (
                            <>
                                <div className="field">
                                    <label htmlFor="name">Your name</label>
                                    <input id="name" className="input" autoComplete="name" value={form.name} onChange={set("name")} placeholder="Maya Okafor" />
                                </div>
                                <div className="field">
                                    <label htmlFor="email">Email</label>
                                    <input id="email" type="email" className="input" autoComplete="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
                                </div>
                            </>
                        )}

                        <div className="field">
                            <label htmlFor="password">Password</label>
                            <div className="pw">
                                <input id="password" type={show ? "text" : "password"} className="input" aria-describedby={signup ? "pw-rules" : undefined}
                                    autoComplete={signup ? "new-password" : "current-password"} value={form.password} onChange={set("password")} />
                                <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show}>{show ? "Hide" : "Show"}</button>
                            </div>
                            {signup && <span className="hint" id="pw-rules">At least 8 characters with upper and lower case letters and a number.</span>}
                        </div>

                        {error && <p className="error-text" role="alert">{error}</p>}

                        <button className="btn btn-primary btn-lg" disabled={busy}>
                            {busy ? "One moment..." : signup ? "Create account" : "Log in"}
                        </button>

                        <p className="switch">
                            {signup ? "Already have an account? " : "New here? "}
                            <button type="button" onClick={() => switchMode(signup ? "login" : "signup")}>{signup ? "Log in" : "Create an account"}</button>
                        </p>
                    </form>
                </section>
            </div>
        </>
    )
}

export async function getServerSideProps(context) {
    const session = await getSession(context.req, context.res)
    if (session) return { redirect: { destination: "/Dashboard", permanent: false } }
    return { props: {} }
}
