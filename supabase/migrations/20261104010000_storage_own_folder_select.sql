-- The Storage API must be able to SELECT an object before it can delete or overwrite it.
-- Without this policy, removing a post's photos or replacing an avatar silently leaves the old file behind.
-- Users get SELECT on their OWN folder only; public URLs still work for everyone, and nobody can
-- list other users' files through the API.
drop policy if exists "own folder select" on storage.objects;

create policy "own folder select" on storage.objects
    for select to authenticated
    using (
        bucket_id in ('avatars', 'post-images')
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );
