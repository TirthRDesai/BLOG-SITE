import { useRef, useState } from "react"
import { api } from "../lib/client"
import { Avatar, Confirm, useToast } from "./ui"

function useSave(toast, onDone) {
    const [busy, setBusy] = useState(false)
    const save = async (data, okMsg) => {
        setBusy(true)
        try {
            await api("/api/UpdateData", { method: "POST", json: { data } })
            toast(okMsg)
            onDone?.()
            return true
        } catch (e) {
            toast(e.message, "bad")
            return false
        } finally {
            setBusy(false)
        }
    }
    return [busy, save]
}

export default function Settings({ me, onMeChanged }) {
    const toast = useToast()
    const [name, setName] = useState(me.Name)
    const [bio, setBio] = useState(me.Bio || "")
    const [email, setEmail] = useState(me.Email || "")
    const [password, setPassword] = useState("")
    const [photoBusy, setPhotoBusy] = useState(false)
    const [photo, setPhoto] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [typed, setTyped] = useState("")
    const [deleting, setDeleting] = useState(false)
    const picker = useRef(null)

    const [profileBusy, saveProfile] = useSave(toast, onMeChanged)
    const [emailBusy, saveEmail] = useSave(toast)
    const [pwBusy, savePw] = useSave(toast)

    const uploadPhoto = async (file) => {
        if (!file) return
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024)
            return toast("Photo must be JPEG, PNG or WebP under 2 MB", "bad")
        setPhotoBusy(true)
        try {
            const form = new FormData()
            form.append("FileData", file)
            const r = await api("/api/UploadFile", { method: "POST", form })
            setPhoto(r.url)
            toast("Profile photo updated")
            onMeChanged()
        } catch (e) {
            toast(e.message, "bad")
        } finally {
            setPhotoBusy(false)
        }
    }

    const deleteAccount = async () => {
        setDeleting(true)
        try {
            await api("/api/DeleteAccount", { method: "POST" })
            window.location.href = "/"
        } catch (e) {
            toast(e.message, "bad")
            setDeleting(false)
        }
    }

    return (
        <div className="settings">
            <section className="card section">
                <h3>Profile photo</h3>
                <div className="avatar-edit">
                    <Avatar user={{ ...me, ProfilePic: photo || me.ProfilePic }} size={84} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <input ref={picker} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => { uploadPhoto(e.target.files[0]); e.target.value = "" }} />
                        <button className="btn btn-outline" disabled={photoBusy} onClick={() => picker.current.click()}>
                            {photoBusy ? "Uploading..." : "Choose photo"}
                        </button>
                        <span className="hint">JPEG, PNG or WebP, up to 2 MB.</span>
                    </div>
                </div>
            </section>

            <form className="card section" onSubmit={(e) => { e.preventDefault(); saveProfile({ Name: name, Bio: bio }, "Profile saved") }}>
                <h3>Public profile</h3>
                <div className="field">
                    <label htmlFor="s-name">Display name</label>
                    <input id="s-name" className="input" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="field">
                    <label htmlFor="s-bio">Bio</label>
                    <textarea id="s-bio" className="textarea" value={bio} maxLength={500} onChange={(e) => setBio(e.target.value)} placeholder="What do you write about?" />
                    <span className="hint">{bio.length} / 500</span>
                </div>
                <div><button className="btn btn-primary" disabled={profileBusy || !name.trim()}>{profileBusy ? "Saving..." : "Save profile"}</button></div>
            </form>

            <form className="card section" onSubmit={(e) => { e.preventDefault(); saveEmail({ Email: email }, "Check your inbox if a confirmation is required") }}>
                <h3>Email</h3>
                <div className="row">
                    <div className="field">
                        <label htmlFor="s-email">Email address</label>
                        <input id="s-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <button className="btn btn-ghost" disabled={emailBusy || email === me.Email}>{emailBusy ? "Saving..." : "Update"}</button>
                </div>
            </form>

            <form className="card section" onSubmit={async (e) => { e.preventDefault(); if (await savePw({ Password: password }, "Password changed")) setPassword("") }}>
                <h3>Password</h3>
                <div className="row">
                    <div className="field">
                        <label htmlFor="s-pw">New password</label>
                        <input id="s-pw" type="password" autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby="pw-hint" />
                        <span className="hint" id="pw-hint">At least 8 characters with upper and lower case letters and a number.</span>
                    </div>
                    <button className="btn btn-ghost" disabled={pwBusy || password.length < 8}>{pwBusy ? "Saving..." : "Change"}</button>
                </div>
            </form>

            <section className="card section">
                <h3>Delete account</h3>
                <p className="hint" style={{ fontSize: 14, color: "var(--muted)" }}>Permanently removes your profile, stories, photos and follows. This can&apos;t be undone.</p>
                <div><button className="btn btn-danger" onClick={() => { setTyped(""); setConfirmDelete(true) }}>Delete my account</button></div>
            </section>

            {confirmDelete && (
                <Confirm
                    title="Delete your account?"
                    body={<>Type <b style={{ color: "#fff" }}>{me.Username}</b> to confirm.</>}
                    confirmLabel="Delete forever"
                    danger
                    busy={deleting}
                    disabled={typed.trim().toLowerCase() !== me.Username}
                    onConfirm={deleteAccount}
                    onClose={() => setConfirmDelete(false)}
                >
                    <input className="input" autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={me.Username} aria-label="Type your username to confirm" />
                </Confirm>
            )}
        </div>
    )
}
