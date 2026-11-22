# Filmy Brothers

A React and Vite website for Filmy Brothers, adapted from the production
gallery, story, team, film, and contact sections on filmybrothers.com.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

## Google AdSense

The AdSense loader for publisher `ca-pub-4188516717083317` is included in
`index.html`. Ad delivery and approval are managed by Google. Never add private
API keys or account credentials to frontend code.

Film thumbnails and playback are served by YouTube. Production posters and
team portraits use the images hosted by the Filmy Brothers GoDaddy site.

## Supabase setup

1. Create a Supabase project.
2. In **Authentication → Users**, add the one admin user with the email and
   password you want to use. Disable public sign-ups in **Authentication →
   Settings** so nobody else can create an account.
3. In the Supabase SQL Editor, open [`supabase/setup.sql`](./supabase/setup.sql)
   and run the SQL. It is preconfigured for the admin user and this setup is
   safe to rerun on an existing project; it adds the required film columns,
   creates the independent `carousel_posters` table and public `film-posters`
   bucket, and configures admin-only poster upload, replacement, ordering,
   publication, and delete policies. It also creates the `news_events` table
   for public link cards with admin-only add, edit, reorder, and delete access.
   Public users can read published carousel poster records; row-level security
   allows only that admin to manage posters and see unpublished drafts.
   Then run [`supabase/seed-films.sql`](./supabase/seed-films.sql) in the SQL
   Editor to add or refresh the twelve films, teasers, and songs. This seed is
   safe to rerun and updates the existing rows by YouTube ID.
4. Open [`supabase/website-forms.sql`](./supabase/website-forms.sql) and run it
   in the SQL Editor. It is preconfigured for the admin email.
   This creates the contact-message and newsletter-subscription tables. Public
   visitors can submit contact details and messages, including an optional
   contact number, but cannot read submitted records. The configured admin can
   review messages in the Supabase table editor.
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
   it must not use the `VITE_` prefix. Ensure `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` are available to both the build and Netlify
   Functions. The News & Events preview uses a Netlify Function to retrieve
   public page metadata safely; the saved link must exist in `news_events`.
   For local email or link-preview testing, run the site with `npx netlify dev`
   so the Netlify Functions are available.
9. To enable **Forgot password?**, open **Authentication → URL Configuration**.
   Set the production site URL (your Netlify URL or custom domain) as the Site
   URL, and add `http://localhost:5173`, `http://127.0.0.1:5173`, and your
   production URL to the Redirect URLs list.
   Password reset emails return to the site, where the admin can choose a new
   password.

The Supabase `films` table is the single source of truth for the public film
grid; there is no local starter-film fallback. Titles, YouTube IDs, types, and
descriptions are loaded from that table. Run the seed script once to add the
twelve original films, teasers, and songs; videos entered with the admin form
are saved in the same table and shared across visitors and devices. Admins can
drag films or use the move buttons to change their display order, which is
stored in Supabase. The independent `carousel_posters` table powers the rotating
gallery. Admins can independently upload multiple carousel
posters with the top-right **Add posters** control; posters are not attached to
film records. Admins can replace, publish or unpublish, reorder, and delete
posters from the thumbnail controls. Uploads are resized to a 1000 × 1414
maximum and encoded as WebP when supported, with JPEG fallback; a separate
240 × 340 thumbnail is generated for the selector. Versioned file paths use
one-year cache headers so replacements receive fresh URLs without invalidating
unchanged images. Each full-size image is capped at 350 KiB and each thumbnail
at 40 KiB, so 20–30 posters use at most about 7.6–11.4 MiB of image storage.
The active and next full-size posters are loaded by the carousel; the remaining
full-size images are not requested until needed, and the selector uses
lazy-loaded thumbnails. The carousel shows only manually
uploaded posters; YouTube thumbnails remain in the film grid. The
**News & Events** section starts empty and displays admin-managed external
links. The admin can add, edit, reorder, and delete links; titles are derived
from each link’s URL as a fallback. When a linked page provides Open Graph or
Twitter Card metadata, the public card also displays its title, description,
and image. Metadata is fetched on demand for cards near the viewport; sites
that block requests or provide no metadata continue to use the fallback. Header
and footer navigation links jump to the matching page sections. The form
lets the admin classify each video as a short or feature film, original song,
music video, teaser, trailer, behind-the-scenes video, or other. The seed can be
safely rerun to fill missing entries and refresh the original entries. Contact
messages are stored in Supabase and emailed to `info@filmybrothers.com` through
the Netlify contact-notification function and Resend. The contact form does not
accept file attachments. Newsletter sign-ups are stored in Supabase and do not send email
notifications. Never put the Supabase `service_role` key or Resend API key in
frontend code or in a `VITE_` variable. The publishable/anon key is intended
for browser use; the database and private storage row-level security policies
enforce access.
# filmybrothers
