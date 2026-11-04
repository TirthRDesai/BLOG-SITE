-- BLOG-SITE v2 schema.
-- Design rules:
--   * Authentication is Supabase Auth (auth.users). No passwords/emails in public tables.
--   * Every table has RLS enabled; the anon role gets no access at all.
--   * Ownership is always checked against auth.uid(), never against client-supplied columns.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
    id          uuid primary key references auth.users (id) on delete cascade,
    username    text not null unique
                check (username ~ '^[a-z0-9_]{3,20}$'),
    name        text not null check (char_length(name) between 1 and 80),
    bio         text not null default '' check (char_length(bio) <= 500),
    avatar_path text check (avatar_path is null or char_length(avatar_path) <= 300),
    created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- posts + images (max 3 images per post)
-- ---------------------------------------------------------------------------
create table public.posts (
    id         uuid primary key default gen_random_uuid(),
    author_id  uuid not null references public.profiles (id) on delete cascade,
    body       text not null check (char_length(btrim(body)) between 1 and 5000),
    created_at timestamptz not null default now()
);
create index posts_author_created_idx on public.posts (author_id, created_at desc);
create index posts_created_idx on public.posts (created_at desc);

create table public.post_images (
    id       uuid primary key default gen_random_uuid(),
    post_id  uuid not null references public.posts (id) on delete cascade,
    path     text not null check (char_length(path) <= 300),
    position smallint not null check (position between 0 and 2),
    unique (post_id, position)
);
create index post_images_post_idx on public.post_images (post_id);

-- ---------------------------------------------------------------------------
-- follows (replaces the Followers/Following arrays)
-- ---------------------------------------------------------------------------
create table public.follows (
    follower_id uuid not null references public.profiles (id) on delete cascade,
    followee_id uuid not null references public.profiles (id) on delete cascade,
    created_at  timestamptz not null default now(),
    primary key (follower_id, followee_id),
    check (follower_id <> followee_id)
);
create index follows_followee_idx on public.follows (followee_id);

-- Follower / following counts without exposing the lists. security_invoker = RLS applies.
create view public.profile_stats with (security_invoker = true) as
select
    p.id,
    (select count(*) from public.follows f where f.followee_id = p.id) as followers_count,
    (select count(*) from public.follows f where f.follower_id = p.id) as following_count,
    (select count(*) from public.posts   x where x.author_id   = p.id) as posts_count
from public.profiles p;

-- ---------------------------------------------------------------------------
-- Create the profile automatically when someone signs up.
-- Signup passes { username, name } as user metadata.
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, username, name)
    values (
        new.id,
        lower(new.raw_user_meta_data ->> 'username'),
        coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), new.raw_user_meta_data ->> 'username')
    );
    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Privileges: start from nothing, grant only what the app needs.
-- (RLS below is the second layer.)
-- ---------------------------------------------------------------------------
revoke all on public.profiles, public.posts, public.post_images, public.follows, public.profile_stats
    from anon, authenticated;

grant select on public.profiles, public.posts, public.post_images, public.follows, public.profile_stats
    to authenticated;
grant insert, delete on public.posts, public.post_images to authenticated;
grant insert, delete on public.follows to authenticated;
-- Usernames and ids are immutable; users can only edit these columns:
grant update (name, bio, avatar_path) on public.profiles to authenticated;
-- No client INSERT/DELETE on profiles: created by trigger, removed by cascade from auth.users.

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.posts       enable row level security;
alter table public.post_images enable row level security;
alter table public.follows     enable row level security;

-- profiles: any signed-in user can read; you can only edit yourself.
create policy profiles_select on public.profiles
    for select to authenticated using (true);
create policy profiles_update_own on public.profiles
    for update to authenticated
    using (id = (select auth.uid()))
    with check (id = (select auth.uid()));

-- posts: readable by signed-in users; only the author can create/delete.
create policy posts_select on public.posts
    for select to authenticated using (true);
create policy posts_insert_own on public.posts
    for insert to authenticated with check (author_id = (select auth.uid()));
create policy posts_delete_own on public.posts
    for delete to authenticated using (author_id = (select auth.uid()));

-- post_images: tied to post ownership.
create policy post_images_select on public.post_images
    for select to authenticated using (true);
create policy post_images_insert_own on public.post_images
    for insert to authenticated with check (
        exists (select 1 from public.posts p
                where p.id = post_id and p.author_id = (select auth.uid()))
        and path like (select auth.uid())::text || '/%'
    );
create policy post_images_delete_own on public.post_images
    for delete to authenticated using (
        exists (select 1 from public.posts p
                where p.id = post_id and p.author_id = (select auth.uid()))
    );

-- follows: you can follow/unfollow as yourself, and remove people who follow you.
create policy follows_select on public.follows
    for select to authenticated using (true);
create policy follows_insert_own on public.follows
    for insert to authenticated with check (follower_id = (select auth.uid()));
create policy follows_delete_involved on public.follows
    for delete to authenticated using (
        follower_id = (select auth.uid()) or followee_id = (select auth.uid())
    );

-- ---------------------------------------------------------------------------
-- Storage: public-read buckets (images are served by URL), writes only into your own folder.
-- Object path convention: <user-id>/<random-file-name>
-- No SELECT policy on storage.objects => bucket listing is not possible from the client.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
    ('avatars',     'avatars',     true, 2 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp']),
    ('post-images', 'post-images', true, 5 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
    set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

create policy "own folder insert" on storage.objects
    for insert to authenticated
    with check (
        bucket_id in ('avatars', 'post-images')
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

create policy "own folder update" on storage.objects
    for update to authenticated
    using (
        bucket_id in ('avatars', 'post-images')
        and (storage.foldername(name))[1] = (select auth.uid())::text
    )
    with check (
        bucket_id in ('avatars', 'post-images')
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

create policy "own folder delete" on storage.objects
    for delete to authenticated
    using (
        bucket_id in ('avatars', 'post-images')
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );
