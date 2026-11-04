import { useState } from "react"
import useSWR from "swr"
import { LuArrowLeft } from "react-icons/lu"
import { api, unwrap, follow, unfollow } from "../lib/client"
import { Avatar, Empty, useToast } from "./ui"
import Feed from "./Feed"
import { PeopleList } from "./People"

export function Profile({ me, username, onOpenProfile, onMeChanged, onNav, onBack }) {
    const toast = useToast()
    const isMe = username === me.Username
    const { data: user, error, mutate } = useSWR(
        "/api/GetUserData/" + encodeURIComponent(username),
        (k) => api(k).then(unwrap),
        { revalidateOnFocus: false }
    )
    const [busy, setBusy] = useState(false)

    if (error) return <div className="card"><Empty title="Writer not found">This profile doesn&apos;t exist or was deleted.</Empty></div>
    if (!user) return <div className="skeleton" />

    const following = user.Followers.includes(me.Username)

    const toggle = async () => {
        setBusy(true)
        try {
            await (following ? unfollow : follow)(user.Username)
            await mutate()
            onMeChanged()
        } catch (e) {
            toast(e.message, "bad")
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            {onBack && (
                <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={onBack}>
                    <LuArrowLeft size={16} /> Back
                </button>
            )}
            <section className="card profile-card arrive">
                <div className="profile-top">
                    <Avatar user={user} size={96} />
                    <div className="names">
                        <h2>{user.Name}</h2>
                        <div className="handle">@{user.Username}</div>
                    </div>
                    {isMe ? (
                        <button className="btn btn-outline" onClick={() => onNav("settings")}>Edit profile</button>
                    ) : following ? (
                        <button className="btn btn-ghost" onClick={toggle} disabled={busy}><span className="dot" /> Following</button>
                    ) : (
                        <button className="btn btn-primary" onClick={toggle} disabled={busy}>Follow</button>
                    )}
                </div>
                <p className={"bio" + (user.Bio ? "" : " empty")}>{user.Bio || (isMe ? "Add a bio so people know what you write about." : "No bio yet.")}</p>
                <div className="stats">
                    <button className="stat" onClick={() => onNav("connections", { username: user.Username, tab: "followers" })}>
                        <b>{user.Followers.length.toLocaleString()}</b><span>{user.Followers.length === 1 ? "Follower" : "Followers"}</span>
                    </button>
                    <button className="stat" onClick={() => onNav("connections", { username: user.Username, tab: "following" })}>
                        <b>{user.Following.length.toLocaleString()}</b><span>Following</span>
                    </button>
                </div>
            </section>
            <Feed
                key={user.Username}
                me={me}
                username={user.Username}
                onOpenProfile={onOpenProfile}
                onMeChanged={() => { mutate(); onMeChanged() }}
                emptyTitle={isMe ? "You haven't published yet" : `${user.Name} hasn't published yet`}
                emptyBody={isMe ? "Your first story is one tap away on Home." : "Check back soon."}
            />
        </>
    )
}

export function Connections({ me, username, tab: initialTab, onOpenProfile, onMeChanged, onTab }) {
    const [tab, setTab] = useState(initialTab || "followers")
    const isMe = username === me.Username
    const { data: user } = useSWR("/api/GetUserData/" + encodeURIComponent(username), (k) => api(k).then(unwrap))

    const pick = (t) => {
        setTab(t)
        onTab?.(t)
    }

    return (
        <section className="card" aria-label="Connections">
            <h2 className="card-title">{isMe ? "Your people" : `${user?.Name ?? "@" + username}'s people`}</h2>
            <div className="tabs" role="tablist">
                <button className="tab" role="tab" aria-selected={tab === "followers"} onClick={() => pick("followers")}>
                    Followers {user ? <small>{user.Followers.length}</small> : null}
                </button>
                <button className="tab" role="tab" aria-selected={tab === "following"} onClick={() => pick("following")}>
                    Following {user ? <small>{user.Following.length}</small> : null}
                </button>
            </div>
            <PeopleList
                key={tab + username}
                mode={tab}
                username={username}
                canRemove={isMe && tab === "followers"}
                onOpenProfile={onOpenProfile}
                onMeChanged={onMeChanged}
                emptyTitle={tab === "followers" ? "No followers yet" : "Not following anyone yet"}
                emptyBody={tab === "followers" ? "Publish a story and people will find you." : "Find writers on the Find people page."}
            />
        </section>
    )
}
