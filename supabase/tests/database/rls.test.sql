-- Run with: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(18);

-- Two users. The signup trigger should create their profiles.
insert into auth.users (id, email, raw_user_meta_data) values
    ('11111111-1111-1111-1111-111111111111', 'alice@test.dev', '{"username":"Alice_1","name":"Alice"}'),
    ('22222222-2222-2222-2222-222222222222', 'bob@test.dev',   '{"username":"bob_2","name":"Bob"}');

select is((select count(*)::int from public.profiles), 2, 'signup trigger creates profiles');
select is((select username from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
          'alice_1', 'usernames are lower-cased');

-- A post owned by bob, created as superuser for the tests below.
insert into public.posts (id, author_id, body)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'bob post');

insert into storage.objects (bucket_id, name, owner)
values ('avatars', '22222222-2222-2222-2222-222222222222/bob.png', '22222222-2222-2222-2222-222222222222');

-- ---------------- anonymous ----------------
set local role anon;
select throws_ok($$select * from public.profiles$$, '42501', null, 'anon cannot read profiles');
select throws_ok($$select * from public.posts$$,    '42501', null, 'anon cannot read posts');

-- ---------------- alice ----------------
reset role;
select set_config('request.jwt.claims',
    '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
set local role authenticated;

select is((select count(*)::int from public.profiles), 2, 'signed-in user can read profiles');

select throws_ok($$update public.profiles set username = 'hacker' where id = auth.uid()$$,
    '42501', null, 'username is immutable');
select throws_ok($$insert into public.profiles (id, username, name) values (gen_random_uuid(), 'fake', 'Fake')$$,
    '42501', null, 'clients cannot insert profiles directly');

update public.profiles set bio = 'hacked' where id = '22222222-2222-2222-2222-222222222222';
delete from public.posts where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

select throws_ok($$insert into public.posts (author_id, body) values ('22222222-2222-2222-2222-222222222222', 'impersonate')$$,
    '42501', null, 'cannot post as someone else');
select lives_ok($$insert into public.posts (author_id, body) values (auth.uid(), 'hello')$$,
    'can post as yourself');

select lives_ok($$insert into public.follows (follower_id, followee_id) values (auth.uid(), '22222222-2222-2222-2222-222222222222')$$,
    'can follow as yourself');
select throws_ok($$insert into public.follows (follower_id, followee_id) values ('22222222-2222-2222-2222-222222222222', auth.uid())$$,
    '42501', null, 'cannot make someone else follow');
select throws_ok($$insert into public.follows (follower_id, followee_id) values (auth.uid(), auth.uid())$$,
    '23514', null, 'cannot follow yourself');

select lives_ok($$insert into storage.objects (bucket_id, name, owner) values ('avatars', '11111111-1111-1111-1111-111111111111/a.png', auth.uid())$$,
    'can upload into your own folder');
select is((select count(*)::int from storage.objects where bucket_id = 'avatars' and name like '2222%'), 0,
    'cannot see or list other users'' files');
select throws_ok($$insert into storage.objects (bucket_id, name, owner) values ('avatars', '22222222-2222-2222-2222-222222222222/x.png', auth.uid())$$,
    '42501', null, 'cannot upload into another user''s folder');

-- ---------------- verify as superuser what the attacker actually changed ----------------
reset role;
select is((select bio from public.profiles where id = '22222222-2222-2222-2222-222222222222'), '',
    'alice could not edit bob''s profile');
select is((select count(*)::int from public.posts where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 1,
    'alice could not delete bob''s post');

-- bob (the followee) can remove alice as a follower
select set_config('request.jwt.claims',
    '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
set local role authenticated;
delete from public.follows where follower_id = '11111111-1111-1111-1111-111111111111';
reset role;
select is((select count(*)::int from public.follows), 0, 'followee can remove a follower');

select * from finish();
rollback;
