create table if not exists public.films (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  youtube_id text not null unique check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  type text not null default 'Short film',
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.films
  add column if not exists type text not null default 'Short film',
  add column if not exists description text not null default '',
  add column if not exists sort_order integer;

with ranked_films as (
  select id, row_number() over (order by created_at, id) - 1 as position
  from public.films
  where sort_order is null
)
update public.films
set sort_order = ranked_films.position
from ranked_films
where public.films.id = ranked_films.id;

alter table public.films
  alter column sort_order set default 0,
  alter column sort_order set not null;

alter table public.films enable row level security;

grant select on public.films to anon, authenticated;
grant insert on public.films to authenticated;
grant update on public.films to authenticated;
grant delete on public.films to authenticated;

create or replace function public.assign_film_sort_order()
returns trigger
language plpgsql
as $$
begin
  if new.sort_order = 0 then
    select coalesce(max(sort_order), -1) + 1
    into new.sort_order
    from public.films;
  end if;
  return new;
end;
$$;

drop trigger if exists assign_film_sort_order on public.films;
create trigger assign_film_sort_order
before insert on public.films
for each row
execute function public.assign_film_sort_order();

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
with check ((select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid);

drop policy if exists "Only the admin can reorder films" on public.films;
create policy "Only the admin can reorder films"
on public.films
for update
to authenticated
using ((select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid)
with check ((select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid);

drop policy if exists "Only the admin can delete films" on public.films;
create policy "Only the admin can delete films"
on public.films
for delete
to authenticated
using ((select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid);

create table if not exists public.news_events (
  id uuid primary key default gen_random_uuid(),
  url text not null check (
    char_length(btrim(url)) between 8 and 2048
    and url ~* '^https?://'
  ),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.news_events enable row level security;

grant select on public.news_events to anon, authenticated;
grant insert, update, delete on public.news_events to authenticated;

drop policy if exists "News and events are publicly readable" on public.news_events;
create policy "News and events are publicly readable"
on public.news_events
for select
to anon, authenticated
using (true);

drop policy if exists "Only the admin can add news and events" on public.news_events;
create policy "Only the admin can add news and events"
on public.news_events
for insert
to authenticated
with check ((select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid);

drop policy if exists "Only the admin can update news and events" on public.news_events;
create policy "Only the admin can update news and events"
on public.news_events
for update
to authenticated
using ((select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid)
with check ((select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid);

drop policy if exists "Only the admin can delete news and events" on public.news_events;
create policy "Only the admin can delete news and events"
on public.news_events
for delete
to authenticated
using ((select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid);

create table if not exists public.carousel_posters (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  poster_path text not null unique,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.carousel_posters
  add column if not exists is_published boolean not null default true;

alter table public.carousel_posters enable row level security;

grant select on public.carousel_posters to anon, authenticated;
grant insert, delete on public.carousel_posters to authenticated;
grant update on public.carousel_posters to authenticated;

drop policy if exists "Carousel posters are publicly readable" on public.carousel_posters;
drop policy if exists "Published carousel posters are publicly readable" on public.carousel_posters;
create policy "Published carousel posters are publicly readable"
on public.carousel_posters
for select
to anon, authenticated
using (is_published);

drop policy if exists "Only the admin can read all carousel posters" on public.carousel_posters;
create policy "Only the admin can read all carousel posters"
on public.carousel_posters
for select
to authenticated
using ((select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid);

drop policy if exists "Only the admin can add carousel posters" on public.carousel_posters;
create policy "Only the admin can add carousel posters"
on public.carousel_posters
for insert
to authenticated
with check ((select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid);

drop policy if exists "Only the admin can update carousel posters" on public.carousel_posters;
create policy "Only the admin can update carousel posters"
on public.carousel_posters
for update
to authenticated
using ((select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid)
with check ((select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid);

drop policy if exists "Only the admin can delete carousel posters" on public.carousel_posters;
create policy "Only the admin can delete carousel posters"
on public.carousel_posters
for delete
to authenticated
using ((select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'film-posters',
  'film-posters',
  true,
  2097152,
  array['image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Only the admin can upload film posters" on storage.objects;
drop policy if exists "Only the admin can upload carousel posters" on storage.objects;
create policy "Only the admin can upload carousel posters"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'film-posters'
  and name ~ '^gallery/[0-9a-f-]{36}-(poster|thumb)[.](webp|jpg)$'
  and (select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid
);

drop policy if exists "Only the admin can delete film posters" on storage.objects;
drop policy if exists "Only the admin can delete carousel posters" on storage.objects;
create policy "Only the admin can delete carousel posters"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'film-posters'
  and name ~ '^gallery/[0-9a-f-]{36}-(poster|thumb)[.](webp|jpg)$'
  and (select auth.uid()) = '41f67820-c15e-495b-9a05-6acf4b31b257'::uuid
);
