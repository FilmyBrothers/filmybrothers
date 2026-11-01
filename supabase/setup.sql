create table if not exists public.films (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  youtube_id text not null unique check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  type text not null default 'Short film',
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table public.films
  add column if not exists type text not null default 'Short film',
  add column if not exists description text not null default '';

alter table public.films enable row level security;

grant select on public.films to anon, authenticated;
grant insert on public.films to authenticated;

drop policy if exists "Films are publicly readable" on public.films;
create policy "Films are publicly readable"
on public.films
for select
to anon, authenticated
using (true);

drop policy if exists "Only the admin can add films" on public.films;
create policy "Only the admin can add films"
on public.films
for insert
to authenticated
with check ((select auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL');
