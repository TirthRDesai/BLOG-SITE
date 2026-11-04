import { createContext, useCallback, useContext, useEffect, useState } from "react"

export function Mark({ size = 28 }) {
    // A speech bubble with a hand-drawn "b": the product's own mark.
    return (
        <svg className="mark" width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
            <path d="M4 14a10 10 0 1 1 5 8.7L4 24l1.6-4.8A9.9 9.9 0 0 1 4 14z" fill="var(--accent)" />
            <path d="M11 8.5v10.8M11 14.6c0-2 1.5-3.1 3.2-3.1 2 0 3.3 1.4 3.3 3.3s-1.3 3.3-3.3 3.3c-1.7 0-3.2-1.1-3.2-3.5" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
    )
}

// Stable pale tint per person (identity, not data).
const hue = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7)

export function Avatar({ user, size = 40 }) {
    const name = user?.Name || user?.Username || "?"
    const url = user?.ProfilePic && user.ProfilePic !== "Default" ? user.ProfilePic : null
    if (url) return <img className="avatar" style={{ "--s": size + "px" }} src={url} alt="" loading="lazy" />
    const h = hue(user?.Username || name)
    return (
        <span className="avatar" style={{ "--s": size + "px", background: `hsl(${h} 32% 20%)`, color: `hsl(${h} 70% 82%)` }} aria-hidden="true">
            {name.trim()[0]?.toUpperCase()}
        </span>
    )
}

/* ---- toasts ---- */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
    const [items, setItems] = useState([])
    const push = useCallback((text, kind = "ok") => {
        const id = Math.random()
        setItems((l) => [...l, { id, text, kind }])
        setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 3200)
    }, [])
    return (
        <ToastCtx.Provider value={push}>
            {children}
            <div className="toasts" role="status" aria-live="polite">
                {items.map((t) => (
                    <div key={t.id} className={"toast" + (t.kind === "bad" ? " bad" : "")}>{t.text}</div>
                ))}
            </div>
        </ToastCtx.Provider>
    )
}

/* ---- modal: Escape closes, click outside closes ---- */
export function Modal({ onClose, children, className = "modal", label }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose()
        document.addEventListener("keydown", onKey)
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.removeEventListener("keydown", onKey)
            document.body.style.overflow = prev
        }
    }, [onClose])
    return (
        <div className={"overlay" + (className === "lightbox" ? " lightbox" : "")} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className={className === "lightbox" ? "" : className} role="dialog" aria-modal="true" aria-label={label}>
                {children}
            </div>
        </div>
    )
}

export function Confirm({ title, body, children, confirmLabel, danger, onConfirm, onClose, busy, disabled }) {
    return (
        <Modal onClose={onClose} label={title}>
            <h3>{title}</h3>
            <p>{body}</p>
            {children}
            <div className="actions">
                <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                <button className={"btn " + (danger ? "btn-danger" : "btn-primary")} onClick={onConfirm} disabled={busy || disabled}>
                    {busy ? "Working..." : confirmLabel}
                </button>
            </div>
        </Modal>
    )
}

export function Empty({ title, children }) {
    return (
        <div className="empty">
            <b>{title}</b>
            <span>{children}</span>
        </div>
    )
}
