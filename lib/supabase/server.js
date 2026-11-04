import { createServerClient, serializeCookieHeader } from "@supabase/ssr"

// Per-request Supabase client for API routes and getServerSideProps (Pages Router).
// It acts AS THE LOGGED-IN USER, so Postgres RLS is what authorizes every query.
export function createClient(req, res) {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return Object.keys(req.cookies ?? {}).map((name) => ({ name, value: req.cookies[name] ?? "" }))
                },
                setAll(cookiesToSet) {
                    res.setHeader(
                        "Set-Cookie",
                        cookiesToSet.map(({ name, value, options }) => serializeCookieHeader(name, value, options))
                    )
                },
            },
        }
    )
}
