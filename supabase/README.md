# BLOG-SITE database (Supabase)

Schema, security policies and tests live here as migrations, so local and production are identical.

## Local development
```bash
npx supabase start -x studio,imgproxy,edge-runtime,logflare,vector,mailpit   # needs Docker running
npx supabase test db        # 16 RLS/security tests (pgTAP)
npx supabase db reset       # wipe local DB and re-apply all migrations
npx supabase stop
```
Ports are 563xx (API 56321, DB 56322) so it can run beside other local Supabase projects.
`npx supabase status` prints the local URL/keys for `.env`.

## What the schema enforces
- Auth is Supabase Auth. No passwords or emails in `public` tables.
- Tables: `profiles`, `posts`, `post_images`, `follows` (+ `profile_stats` view). RLS on for all; the `anon` role has zero access.
- You can only create/delete your own posts/follows, edit your own `name`/`bio`/`avatar_path`. Usernames are immutable.
- Storage buckets `avatars` / `post-images`: public read by URL, no listing, writes only into `<your-user-id>/...`, 2-5 MB, JPEG/PNG/WebP only.

## Pushing to production
Prefer a **fresh Supabase project** (cleanest "replace everything"; the old one stays as a backup):
```bash
npx supabase login
npx supabase link --project-ref <NEW_PROJECT_REF>
npx supabase db push --dry-run     # review
npx supabase db push
```
Then set the app env vars from the new project (URL, publishable key, secret key).

Pushing into the OLD project would leave the old insecure `UserData` / `Posts` tables in place. Only wipe them
after you have exported anything you need (`supabase db reset --linked` is destructive).

## Old data
Old passwords are plaintext, so users cannot be copied over as-is; they would need to re-register or reset
passwords via Supabase Auth.

## Running the app against it
```bash
npx supabase start -x studio,imgproxy,edge-runtime,logflare,vector,mailpit
npx supabase status -o env      # copy API_URL / PUBLISHABLE_KEY / SECRET_KEY into .env.local (see .env.example)
npm run dev
```
In production set the same three variables from your Supabase project in Vercel. If you turn on
"Confirm email" in the Supabase dashboard, signup shows "Check your email" instead of logging in directly.
