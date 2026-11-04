import { useEffect, useState } from "react"
import useSWR from "swr"
import { LuSearch } from "react-icons/lu"
import { api, follow, unfollow, removeFollower } from "../lib/client"
import { Avatar, Empty, useToast } from "./ui"

function Row({ p, canRemove, onOpenProfile, onChanged }) {
    const toast = useToast()
    const [busy, setBusy] = useState(false)

    const run = async (fn, msg) => {
        setBusy(true)
        try {
            await fn(p.Username)
            if (msg) toast(msg)
            onChanged()
        } catch (e) {
            toast(e.message, "bad")
        } finally {
            setBusy(false)
        }
    }

    return (
        <li className="person">
            <Avatar user={p} size={48} />
            <div className="who">
                <b onClick={() => onOpenProfile(p.Username)}>{p.Name}</b>
                <span>@{p.Username}</span>
                {p.Bio && <div className="bio-line">{p.Bio}</div>}
            </div>
            {canRemove && (
                <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => run(removeFollower, "Follower removed")}>Remove</button>
            )}
            {!p.isMe && !canRemove && (
                p.isFollowing ? (
                    <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => run(unfollow)} title="Unfollow">
                        <span className="dot" /> Following
                    </button>
                ) : (
                    <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => run(follow, "Followed @" + p.Username)}>Follow</button>
                )
            )}
        </li>
    )
}

// mode: suggested | search | followers | following
export function PeopleList({ mode, username, q, canRemove, onOpenProfile, onMeChanged, emptyTitle, emptyBody, limit }) {
    const key = `/api/People?mode=${mode}${username ? "&username=" + encodeURIComponent(username) : ""}${q ? "&q=" + encodeURIComponent(q) : ""}`
    const { data, isLoading, mutate } = useSWR(key, (k) => api(k).then((r) => r.data), { revalidateOnFocus: false })
    const rows = limit ? data?.slice(0, limit) : data

    if (isLoading && !data) return <div className="skeleton" style={{ height: 140 }} />
    if (!rows?.length) return <Empty title={emptyTitle || "Nobody here yet"}>{emptyBody}</Empty>
    return (
        <ul className="people">
            {rows.map((p) => (
                <Row
                    key={p.Username}
                    p={p}
                    canRemove={canRemove}
                    onOpenProfile={onOpenProfile}
                    onChanged={() => {
                        mutate()
                        onMeChanged?.()
                    }}
                />
            ))}
        </ul>
    )
}

export function Suggested({ onOpenProfile, onMeChanged, version }) {
    return (
        <aside className="card rail" aria-label="People to follow">
            <h2 className="card-title">People to follow</h2>
            <PeopleList key={version} mode="suggested" onOpenProfile={onOpenProfile} onMeChanged={onMeChanged} emptyTitle="You're following everyone" emptyBody="New writers will show up here." />
        </aside>
    )
}

export function FindPeople({ initial = "", onOpenProfile, onMeChanged }) {
    const [value, setValue] = useState(initial)
    const [q, setQ] = useState(initial)

    useEffect(() => {
        const t = setTimeout(() => setQ(value.trim()), 250)
        return () => clearTimeout(t)
    }, [value])

    return (
        <section className="card" aria-label="Find people">
            <div className="search" style={{ maxWidth: "none", margin: "0 0 12px" }}>
                <LuSearch aria-hidden="true" />
                <input
                    className="input"
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Search writers by name or username"
                    aria-label="Search writers"
                />
            </div>
            {q ? (
                <PeopleList key={q} mode="search" q={q} onOpenProfile={onOpenProfile} onMeChanged={onMeChanged} emptyTitle={`No one matches "${q}"`} emptyBody="Check the spelling or try part of the username." />
            ) : (
                <>
                    <h2 className="card-title">Writers you might like</h2>
                    <PeopleList mode="suggested" onOpenProfile={onOpenProfile} onMeChanged={onMeChanged} emptyTitle="You're following everyone" emptyBody="Search by name to find someone specific." />
                </>
            )}
        </section>
    )
}
