# BlogSite

A social blogging network: publish short stories with photos, follow writers, build an audience.

- **Stack:** Next.js (Pages Router) + Supabase (Auth, Postgres with Row Level Security, Storage).
- **Design:** hand-written design system in `styles/globals.css` (true-black surfaces, one lime accent, Inter).
- **Database:** `supabase/` holds the schema, security policies and tests. See `supabase/README.md`.

## Run locally
```bash
npm install
npx supabase start -x studio,imgproxy,edge-runtime,logflare,vector,mailpit   # needs Docker
npx supabase status -o env      # copy URL / PUBLISHABLE_KEY / SECRET_KEY into .env.local (see .env.example)
npm run dev
```
