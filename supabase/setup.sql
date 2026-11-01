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
