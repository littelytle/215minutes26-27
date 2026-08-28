# IEP Minute Pro (Next.js / Vercel rewrite)

A rewrite of the Streamlit app as a real Next.js web app, styled after the
Google Stitch mockup (dark theme, serif headings, sidebar nav). Same
features, same Google Sheet, much smoother UI — no full-page reruns.

## What's here

- `src/app/` — pages: Dashboard (`/`), Log Session, Session History, Add
  Student, Team Setup. Each mirrors the equivalent Streamlit tab.
- `src/app/api/` — API routes the frontend calls (students, staff, logs).
- `src/lib/db.ts` — in-memory mock data layer (used automatically when no
  Google credentials are configured — safe for local development).
- `src/lib/sheetsDb.ts` — the real Google Sheets–backed data layer. Same
  `staff` / `students` / `logs` sheet layout as the original Streamlit app,
  so it works against your existing spreadsheet with no migration.
- `src/lib/data.ts` — picks between the two above based on whether
  `GOOGLE_SERVICE_ACCOUNT_JSON` and `SPREADSHEET_ID` are set.

## Local development

```bash
npm install
npm run dev
```

Opens at http://localhost:3000 using mock data (four sample students) — no
Google credentials needed to poke around the UI.

To test against a real (ideally a **copy** of your) Google Sheet, copy
`.env.example` to `.env.local` and fill in the two variables, then restart
`npm run dev`.

## Deploying to Vercel

1. Push this project to a GitHub repo (root of the repo, or set Vercel's
   "Root Directory" to wherever you put it if it's a subfolder).
2. In Vercel, "Add New Project" → import that repo.
3. Under **Settings → Environment Variables**, add:
   - `GOOGLE_SERVICE_ACCOUNT_JSON` — the full service account JSON key, as
     one line.
   - `SPREADSHEET_ID` — from your sheet's URL.
4. Deploy. That's it — no build configuration needed, Vercel auto-detects
   Next.js.

**Before pointing it at your real sheet**, duplicate the Google Sheet (File
→ Make a copy) and use the copy's ID first to confirm everything works —
adding/editing/removing students, logging sessions, marking someone absent,
editing team members. Once you're satisfied, switch `SPREADSHEET_ID` to the
real one in Vercel's environment variables and redeploy.

The service account needs **Editor** access on the sheet — share the sheet
with the service account's `client_email` the same way you would with a
person.
