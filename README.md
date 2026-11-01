# Filmy Brothers

A React and Vite website for Filmy Brothers, adapted from the production
gallery, story, team, film, and contact sections on filmybrothers.com.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

Film thumbnails and playback are served by YouTube. Production posters and
team portraits use the images hosted by the Filmy Brothers GoDaddy site.

## Supabase setup

1. Create a Supabase project.
2. In **Authentication → Users**, add the one admin user with the email and
   password you want to use. Disable public sign-ups in **Authentication →
   Settings** so nobody else can create an account.
3. In the Supabase SQL Editor, open [`supabase/setup.sql`](./supabase/setup.sql)
   and run the SQL. It is preconfigured for the admin user and this setup is
   safe to rerun on an existing project; it adds the `type`, `description`, and
   `sort_order` columns required by the database-backed film grid and gallery.
   The table is publicly readable, but row-level security allows only that
   admin to add, reorder, and delete films.
   Then run [`supabase/seed-films.sql`](./supabase/seed-films.sql) in the SQL
   Editor to add or refresh the twelve films, teasers, and songs. This seed is
   safe to rerun and updates the existing rows by YouTube ID.
4. Open [`supabase/website-forms.sql`](./supabase/website-forms.sql) and run it
   in the SQL Editor. It is preconfigured for the admin email.
   This creates the contact-message and newsletter-subscription tables. Public
   visitors can submit records and upload up to five JPG, PNG, or PDF attachments
   (8 MB each), but cannot read them; the configured admin can review records in
   the Supabase table editor and private attachments in Storage.
5. In **Project Settings → API**, copy the project URL and the publishable
   key (or legacy `anon` key).
6. Copy `.env.example` to `.env.local` and fill in:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
   VITE_SUPABASE_ADMIN_USER_ID=the-admin-user-uuid
   RESEND_API_KEY=re_your_resend_api_key
   CONTACT_FROM_EMAIL=Filmy Brothers Website <website@filmybrothers.com>
   CONTACT_NOTIFICATION_TO=info@filmybrothers.com
   ```

7. Create a Resend account and verify `filmybrothers.com` under **Domains**.
   Add the DNS records Resend provides to GoDaddy. Create a Resend API key and
   use it for `RESEND_API_KEY`; set `CONTACT_FROM_EMAIL` to an address on the
   verified domain. `CONTACT_NOTIFICATION_TO` defaults to
   `info@filmybrothers.com`.
8. For Netlify, add all six variables in **Site configuration → Environment
   variables**, then redeploy. Keep `RESEND_API_KEY` as a server-only variable:
   it must not use the `VITE_` prefix. For local email testing, run the site
   with `npx netlify dev` so the Netlify Function is available.
9. To enable **Forgot password?**, open **Authentication → URL Configuration**.
   Set the production site URL (your Netlify URL or custom domain) as the Site
   URL, and add `http://localhost:5173`, `http://127.0.0.1:5173`, and your
   production URL to the Redirect URLs list.
   Password reset emails return to the site, where the admin can choose a new
   password.

The Supabase `films` table is the single source of truth for both the public
film grid and the rotating gallery; there is no local starter-film fallback.
Titles, YouTube IDs, types, and descriptions are loaded from that table. Run
the seed script once to add the twelve original films, teasers, and songs;
videos entered with the admin form are saved in the same table and shared across
visitors and devices. Admins can drag videos or use the move buttons to change
their display order; that order is stored in Supabase and shared by the film
grid and rotating gallery. The form lets the admin classify each video as a short or
feature film, original song, music video, teaser, trailer, behind-the-scenes
video, or other. The seed can be safely rerun to fill missing entries and
refresh the original entries. Contact messages are stored in Supabase and
emailed to `info@filmybrothers.com` through the Netlify contact-notification
function and Resend; uploaded attachment filenames are included in the email,
while files remain in private Supabase Storage. Newsletter sign-ups are stored
in Supabase and do not send email notifications. Never put the Supabase
`service_role` key or Resend API key in frontend code or in a `VITE_` variable.
The publishable/anon key is intended for browser use; the database and private
storage row-level security policies enforce access.
# filmybrothers
