create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  email text not null check (
    char_length(btrim(email)) between 3 and 254
    and btrim(email) ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$'
  ),
  message text not null check (char_length(btrim(message)) between 1 and 5000),
  attachment_paths text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.contact_messages
  add column if not exists attachment_paths text[] not null default '{}';

alter table public.contact_messages enable row level security;
grant insert on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;

drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
create policy "Anyone can submit a contact message"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists "Only the admin can read contact messages" on public.contact_messages;
create policy "Only the admin can read contact messages"
on public.contact_messages
for select
to authenticated
using ((select auth.jwt() ->> 'email') = 'filmybrothersproduction@gmail.com');

create table if not exists public.newsletter_subscriptions (
  email text primary key check (
    char_length(btrim(email)) between 3 and 254
    and btrim(email) ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$'
  ),
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscriptions enable row level security;
grant insert on public.newsletter_subscriptions to anon, authenticated;
grant select on public.newsletter_subscriptions to authenticated;

drop policy if exists "Anyone can subscribe to the newsletter" on public.newsletter_subscriptions;
create policy "Anyone can subscribe to the newsletter"
on public.newsletter_subscriptions
for insert
to anon, authenticated
with check (true);

drop policy if exists "Only the admin can read newsletter subscriptions" on public.newsletter_subscriptions;
create policy "Only the admin can read newsletter subscriptions"
on public.newsletter_subscriptions
for select
to authenticated
using ((select auth.jwt() ->> 'email') = 'filmybrothersproduction@gmail.com');

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'contact-attachments',
  'contact-attachments',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can attach files to a contact message" on storage.objects;
create policy "Anyone can attach files to a contact message"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'contact-attachments'
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}-[^/]+$'
);

drop policy if exists "Only the admin can read contact attachments" on storage.objects;
create policy "Only the admin can read contact attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'contact-attachments'
  and (select auth.jwt() ->> 'email') = 'filmybrothersproduction@gmail.com'
);
