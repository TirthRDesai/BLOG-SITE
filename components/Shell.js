import { useState } from "react"
import { LuHome, LuUser, LuUsers, LuUserPlus, LuSearch, LuSettings, LuLogOut } from "react-icons/lu"
import { Avatar, Mark } from "./ui"

const TITLES = { home: "Home", profile: "Profile", connections: "Your people", find: "Find people", settings: "Settings" }

export default function Shell({ me, view, onNav, onLogout, children }) {
    const [q, setQ] = useState("")
    const current = (name, extra) => {
        if (view.name !== name) return undefined
        if (extra && !extra(view)) return undefined
        return "page"
    }
    const mine = (v) => v.username === me.Username
    const items = [
        { label: "Home", icon: LuHome, go: () => onNav("home"), cur: current("home") },
        { label: "Find people", icon: LuUserPlus, go: () => onNav("find"), cur: current("find") },
    ]
    const personal = [
        { label: "Profile", icon: LuUser, go: () => onNav("profile", { username: me.Username }), cur: current("profile", mine) },
        { label: "Followers", icon: LuUsers, count: me.Followers.length, go: () => onNav("connections", { username: me.Username, tab: "followers" }), cur: current("connections", (v) => mine(v) && v.tab === "followers") },
        { label: "Following", icon: LuUsers, count: me.Following.length, go: () => onNav("connections", { username: me.Username, tab: "following" }), cur: current("connections", (v) => mine(v) && v.tab === "following") },
        { label: "Settings", icon: LuSettings, go: () => onNav("settings"), cur: current("settings") },
    ]

    const title = view.name === "profile" && !(view.username === me.Username) ? "Profile" : TITLES[view.name]
    const Item = ({ it }) => (
        <button className="nav-item" aria-current={it.cur} onClick={it.go}>
            <it.icon aria-hidden="true" /> {it.label}
            {it.count !== undefined && <span className="nav-count">{it.count.toLocaleString()}</span>}
        </button>
    )

    return (
        <div className="shell">
            <nav className="sidebar" aria-label="Main">
                <div className="brand"><Mark /> BlogSite</div>
                <div className="nav">
                    {items.map((it) => <Item key={it.label} it={it} />)}
                    <div className="nav-label">You</div>
                    {personal.map((it) => <Item key={it.label} it={it} />)}
                </div>
                <div className="sidebar-foot">
                    <button className="me-row" onClick={() => onNav("profile", { username: me.Username })} aria-label="Open your profile">
                        <Avatar user={me} size={36} />
                        <span className="who"><b>{me.Name}</b><span>@{me.Username}</span></span>
                    </button>
                    <button className="nav-item" onClick={onLogout}><LuLogOut aria-hidden="true" /> Log out</button>
                </div>
            </nav>

            <header className="topbar">
                <h1>{title}</h1>
                <form
                    className="search"
                    role="search"
                    onSubmit={(e) => {
                        e.preventDefault()
                        onNav("find", { q: q.trim() })
                        setQ("")
                    }}
                >
                    <LuSearch aria-hidden="true" />
                    <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search writers" aria-label="Search writers" />
                </form>
                <span className="spacer" />
            </header>

            <main className={"canvas" + (view.name === "home" || view.name === "profile" ? "" : " single")}>{children}</main>

            <nav className="bottomnav" aria-label="Main">
                {[items[0], items[1], personal[0], personal[3]].map((it) => (
                    <button key={it.label} aria-current={it.cur} onClick={it.go}>
                        <it.icon aria-hidden="true" /> {it.label}
                    </button>
                ))}
            </nav>
        </div>
    )
}
