import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { LuImagePlus, LuMoreHorizontal, LuTrash2, LuX } from "react-icons/lu"
import { api, unwrap, follow, unfollow, timeAgo } from "../lib/client"
import { Avatar, Confirm, Empty, Modal, useToast } from "./ui"

const MAX_CHARS = 5000
const MAX_IMAGES = 3

export function Composer({ me, onPosted }) {
    const toast = useToast()
    const [text, setText] = useState("")
    const [files, setFiles] = useState([])
    const [busy, setBusy] = useState(false)
    const area = useRef(null)
    const picker = useRef(null)

    const previews = files.map((f) => ({ f, url: URL.createObjectURL(f) }))
    useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)))

    const grow = (el) => {
        el.style.height = "auto"
        el.style.height = el.scrollHeight + "px"
    }

    const addFiles = (list) => {
        const ok = [...list].filter((f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type) && f.size <= 5 * 1024 * 1024)
        if (ok.length < list.length) toast("Photos must be JPEG, PNG or WebP under 5 MB", "bad")
        setFiles((cur) => [...cur, ...ok].slice(0, MAX_IMAGES))
    }

    const submit = async () => {
        if (!text.trim() || busy) return
        setBusy(true)
        try {
            const form = new FormData()
            form.append("TextPart", text)
            files.forEach((f, i) => form.append("Image" + (i + 1), f))
            await api("/api/UploadPost", { method: "POST", form })
            setText("")
            setFiles([])
            if (area.current) area.current.style.height = "auto"
            toast("Story published")
            onPosted?.()
        } catch (e) {
            toast(e.message, "bad")
        } finally {
            setBusy(false)
        }
    }

    return (
        <section className="card composer" aria-label="Write a story">
            <Avatar user={me} size={44} />
            <div className="composer-main">
                <textarea
                    ref={area}
                    value={text}
                    maxLength={MAX_CHARS}
                    placeholder="What's your story today?"
                    aria-label="Your story"
                    rows={1}
                    onChange={(e) => {
                        setText(e.target.value)
                        grow(e.target)
                    }}
                    onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && submit()}
                />
                {previews.length > 0 && (
                    <div className="previews">
                        {previews.map((p, i) => (
                            <div className="preview" key={p.url}>
                                <img src={p.url} alt={`Selected photo ${i + 1}`} />
                                <button aria-label="Remove photo" onClick={() => setFiles((c) => c.filter((_, j) => j !== i))}>
                                    <LuX size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="composer-bar">
                    <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = "" }} />
                    <button className="iconbtn" aria-label="Add photos" disabled={files.length >= MAX_IMAGES} onClick={() => picker.current.click()}>
                        <LuImagePlus size={20} />
                    </button>
                    <span className={"count" + (text.length > MAX_CHARS - 200 ? " near" : "")}>{text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}</span>
                    <button className="btn btn-primary" onClick={submit} disabled={!text.trim() || busy}>
                        {busy ? "Publishing..." : "Publish"}
                    </button>
                </div>
            </div>
        </section>
    )
}

function Media({ images, onOpen }) {
    if (!images.length) return null
    return (
        <div className={"media media-" + images.length}>
            {images.map((src, i) => (
                <button key={src} onClick={() => onOpen(src)} aria-label={`Open photo ${i + 1}`}>
                    <img src={src} alt="" loading="lazy" />
                </button>
            ))}
        </div>
    )
}

function PostCard({ item, me, index, onOpenProfile, onChanged }) {
    const toast = useToast()
    const { PostData: p, UserData: u } = item
    const mine = p.Username === me.Username
    const images = [p.Image1, p.Image2, p.Image3].filter(Boolean)
    const [menu, setMenu] = useState(false)
    const [confirm, setConfirm] = useState(false)
    const [busy, setBusy] = useState(false)
    const [zoom, setZoom] = useState(null)
    const menuRef = useRef(null)

    useEffect(() => {
        if (!menu) return
        const close = (e) => !menuRef.current?.contains(e.target) && setMenu(false)
        document.addEventListener("mousedown", close)
        return () => document.removeEventListener("mousedown", close)
    }, [menu])

    const toggleFollow = async () => {
        setBusy(true)
        try {
            await (u.isFollowed ? unfollow : follow)(u.Username)
            onChanged({ follow: true })
        } catch (e) {
            toast(e.message, "bad")
        } finally {
            setBusy(false)
        }
    }

    const remove = async () => {
        setBusy(true)
        try {
            await api("/api/DeletePost", { method: "POST", json: { PostId: p.id } })
            toast("Story deleted")
            setConfirm(false)
            onChanged({ deleted: p.id })
        } catch (e) {
            toast(e.message, "bad")
            setBusy(false)
        }
    }

    return (
        <article className="post arrive" style={{ "--i": Math.min(index, 8) }}>
            <header className="post-head">
                <Avatar user={u} size={42} />
                <div className="who">
                    <b onClick={() => onOpenProfile(u.Username)}>{u.Name}</b>
                    <span>@{u.Username} · {timeAgo(p.created_at)}</span>
                </div>
                {!mine && (
                    u.isFollowed ? (
                        <button className="pill-following btn-sm" onClick={toggleFollow} disabled={busy} title="Unfollow">
                            <span className="dot" /> Following
                        </button>
                    ) : (
                        <button className="btn btn-outline btn-sm" onClick={toggleFollow} disabled={busy}>Follow</button>
                    )
                )}
                {mine && (
                    <div style={{ position: "relative" }} ref={menuRef}>
                        <button className="iconbtn" aria-label="Story options" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
                            <LuMoreHorizontal size={20} />
                        </button>
                        {menu && (
                            <div className="menu" role="menu">
                                <button className="danger" role="menuitem" onClick={() => { setMenu(false); setConfirm(true) }}>
                                    <LuTrash2 size={16} /> Delete story
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </header>
            <p className="post-text">{p.TextPart}</p>
            <Media images={images} onOpen={setZoom} />
            {zoom && (
                <Modal className="lightbox" onClose={() => setZoom(null)} label="Photo">
                    <img src={zoom} alt="" onClick={() => setZoom(null)} />
                </Modal>
            )}
            {confirm && (
                <Confirm
                    title="Delete this story?"
                    body="It will be removed along with its photos. This can't be undone."
                    confirmLabel="Delete"
                    danger
                    busy={busy}
                    onConfirm={remove}
                    onClose={() => setConfirm(false)}
                />
            )}
        </article>
    )
}

// username: "*" for everyone, or a username for one person's stories.
export default function Feed({ me, username = "*", onOpenProfile, onMeChanged, emptyTitle, emptyBody, header }) {
    const key = "/api/GetPosts/" + encodeURIComponent(username)
    const { data, error, isLoading, mutate } = useSWR(key, (k) => api(k).then(unwrap), { revalidateOnFocus: false, refreshInterval: 60000 })

    return (
        <>
            {header?.({ refresh: () => mutate() })}
            {isLoading && !data && (
                <>
                    <div className="skeleton" />
                    <div className="skeleton" />
                </>
            )}
            {error && !data && <Empty title="Couldn't load stories">Check your connection and refresh.</Empty>}
            {data && data.length === 0 && <div className="card"><Empty title={emptyTitle || "No stories yet"}>{emptyBody || "Be the first to publish."}</Empty></div>}
            {data?.map((item, i) => (
                <PostCard
                    key={item.PostData.id}
                    item={item}
                    me={me}
                    index={i}
                    onOpenProfile={onOpenProfile}
                    onChanged={() => {
                        mutate()
                        onMeChanged?.()
                    }}
                />
            ))}
        </>
    )
}
