// Small fetch helpers for the browser. Every call goes through our API routes (which check the session).

export async function api(path, { method = "GET", json, form } = {}) {
    const res = await fetch(path, {
        method,
        headers: json ? { "Content-Type": "application/json" } : undefined,
        body: json ? JSON.stringify(json) : form,
    })
    let data = null
    try {
        data = await res.json()
    } catch {}
    if (!res.ok || !data?.ok) {
        const err = new Error(data?.message || "Something went wrong. Please try again.")
        err.status = res.status
        throw err
    }
    return data
}

// Some routes return their payload as a JSON string in `data`.
export const unwrap = (r) => (typeof r.data === "string" ? JSON.parse(r.data) : r.data)

export const follow = (u) => api("/api/FollowUser", { method: "POST", json: { FriendUsername: u } })
export const unfollow = (u) => api("/api/Unfollow", { method: "POST", json: { FriendUsername: u } })
export const removeFollower = (u) => api("/api/RemoveUser", { method: "POST", json: { FriendUsername: u } })

export function timeAgo(iso) {
    const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
    if (s < 60) return "just now"
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    const d = Math.floor(h / 24)
    if (d < 7) return `${d}d`
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: d > 300 ? "numeric" : undefined })
}
