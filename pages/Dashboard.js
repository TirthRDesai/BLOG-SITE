import Head from "next/head"
import { useCallback, useState } from "react"
import { useRouter } from "next/router"
import useSWR from "swr"
import { getSession } from "../lib/auth"
import { api, unwrap } from "../lib/client"
import Shell from "../components/Shell"
import Feed, { Composer } from "../components/Feed"
import { Profile, Connections } from "../components/Profile"
import { FindPeople, Suggested } from "../components/People"
import Settings from "../components/Settings"
import { Confirm, ToastProvider } from "../components/ui"

export default function Dashboard({ Username }) {
    const router = useRouter()
    const { data: me, error: meError, mutate: refreshMe } = useSWR("/api/GetUserData/" + Username, (k) => api(k).then(unwrap), { revalidateOnFocus: true })
    if (meError?.status === 401 && typeof window !== "undefined") window.location.href = "/"
    const [stack, setStack] = useState([{ name: "home" }])
    const [loggingOut, setLoggingOut] = useState(false)
    const [busy, setBusy] = useState(false)
    const view = stack[stack.length - 1]

    // Sidebar destinations reset history; openProfile (below) stacks so Back works.
    const nav = useCallback((name, extra = {}) => {
        setStack([{ name, ...extra }])
        window.scrollTo({ top: 0 })
    }, [])

    const openProfile = useCallback((username) => {
        setStack((s) => [...s, { name: "profile", username }])
        window.scrollTo({ top: 0 })
    }, [])

    const back = stack.length > 1 ? () => setStack((s) => s.slice(0, -1)) : undefined

    const logout = async () => {
        setBusy(true)
        try {
            await api("/api/Logout", { method: "POST" })
        } finally {
            router.push("/")
        }
    }

    if (!me) {
        return (
            <div style={{ padding: 29, maxWidth: 760 }}>
                <div className="skeleton" style={{ marginBottom: 14 }} />
                <div className="skeleton" />
            </div>
        )
    }

    const refresh = () => refreshMe()
    const rail = <Suggested key={me.Following.join(",")} onOpenProfile={openProfile} onMeChanged={refresh} />

    return (
        <ToastProvider>
            <Head><title>BlogSite</title></Head>
            <Shell me={me} view={view} onNav={nav} onLogout={() => setLoggingOut(true)}>
                {view.name === "home" && (
                    <>
                        <div className="col">
                            <Feed
                                me={me}
                                username="*"
                                onOpenProfile={openProfile}
                                onMeChanged={refresh}
                                emptyTitle="It's quiet in here"
                                emptyBody="Publish the first story and it will show up for everyone."
                                header={({ refresh: refreshFeed }) => <Composer me={me} onPosted={() => { refreshFeed(); refresh() }} />}
                            />
                        </div>
                        {rail}
                    </>
                )}
                {view.name === "profile" && (
                    <>
                        <div className="col">
                            <Profile key={view.username} me={me} username={view.username} onOpenProfile={openProfile} onMeChanged={refresh} onNav={nav} onBack={back} />
                        </div>
                        {rail}
                    </>
                )}
                {view.name === "connections" && (
                    <Connections key={view.username} me={me} username={view.username} tab={view.tab} onOpenProfile={openProfile} onMeChanged={refresh} />
                )}
                {view.name === "find" && <FindPeople key={view.q || "find"} initial={view.q || ""} onOpenProfile={openProfile} onMeChanged={refresh} />}
                {view.name === "settings" && <Settings me={me} onMeChanged={refresh} />}
            </Shell>
            {loggingOut && (
                <Confirm title="Log out?" body="You'll need to sign in again to read and write stories." confirmLabel="Log out" busy={busy} onConfirm={logout} onClose={() => setLoggingOut(false)} />
            )}
        </ToastProvider>
    )
}

export async function getServerSideProps(context) {
    const session = await getSession(context.req, context.res)
    if (!session) return { redirect: { destination: "/", permanent: false } }
    return { props: { Username: session.profile.username } }
}
