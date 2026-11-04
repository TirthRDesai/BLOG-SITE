import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { timingSafeEqual } from "crypto"

const COOKIE = "session"
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function secret() {
    const s = process.env.SESSION_SECRET
    if (!s || s.length < 32) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("SESSION_SECRET must be set (>= 32 chars)")
        }
        return new TextEncoder().encode("dev-only-insecure-secret-change-me-please!!")
    }
    return new TextEncoder().encode(s)
}

export const hashPassword = (plain) => bcrypt.hash(plain, 12)

// Supports bcrypt hashes and legacy plaintext rows (upgraded on next successful login).
export async function verifyPassword(stored, input) {
    if (typeof stored !== "string" || typeof input !== "string") return { ok: false }
    if (stored.startsWith("$2")) {
        return { ok: await bcrypt.compare(input, stored) }
    }
    const a = Buffer.from(stored)
    const b = Buffer.from(input)
    const ok = a.length === b.length && timingSafeEqual(a, b)
    return { ok, needsUpgrade: ok }
}

export async function createSession(res, username) {
    const token = await new SignJWT({ u: username })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${MAX_AGE}s`)
        .sign(secret())
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
    res.setHeader("Set-Cookie", `${COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`)
}

export function clearSession(res) {
    res.setHeader("Set-Cookie", `${COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`)
}

// Returns the verified username or null. Identity ONLY ever comes from here.
export async function getSessionUser(req) {
    try {
        const token = req.cookies?.[COOKIE]
        if (!token) return null
        const { payload } = await jwtVerify(token, secret())
        return typeof payload.u === "string" ? payload.u : null
    } catch {
        return null
    }
}

// For API routes: 401s and returns null if not logged in.
export async function requireUser(req, res) {
    const user = await getSessionUser(req)
    if (!user) {
        res.status(401).json({ message: "Not authenticated", ok: false })
        return null
    }
    return user
}

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/
