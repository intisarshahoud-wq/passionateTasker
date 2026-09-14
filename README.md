# Passionate Taskers

A voice-first marketplace connecting homeowners with tradespeople — plumbers,
electricians and handymen — built so that blind, low-vision and elderly users
can complete every task, not as a later accessibility pass.

You describe the problem in plain words, by voice or by text. The product turns
that into a structured job post and matches you with verified, insured
tradespeople nearby.

**This repository is currently a frontend prototype.** There is no backend, no
database and no real authentication. See [Status](#status).

---

## Running it locally

Requires Node.js 24 and npm.

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

---

## Status

The landing page is complete and interactive. Everything behind it is not built
yet — deliberately, so the visual direction and the core flow could be validated
before committing to a backend stack.

**Working:**

- Task-first hero with search. Type or speak a sentence and it produces a
  structured job post — category, urgency, matches nearby.
- Voice input via the browser's Web Speech API, degrading to typing where the
  browser does not support it.
- Service discovery, price-anchored job cards, trust and verification content,
  reviews, and a tradesperson section.
- Registration and sign-in, including a Google option — all demo only, see below.
- Light/dark themes and a larger-text mode, both remembered between visits.
- Responsive from 320px up, with no horizontal overflow at any width tested.

**Not built:**

Backend, database, real authentication, job matching, messaging, booking,
payments, tradesperson profiles and dashboards.

### What "demo only" means here

The account system stores a plain object in `localStorage`. There is no server,
no password checking and no token — passwords are never stored at all, not even
hashed. The "Continue with Google" button opens our own account chooser, clearly
labelled as simulated; no Google API is contacted and it never asks for a Google
password.

It exists so the signed-in screens can be designed and reviewed. Replace
`src/features/auth/demo-auth.ts` with real authentication before this goes anywhere public —
the exported functions (`register`, `signIn`, `signOut`, `useSession`) are the
seam to keep.

Reviews on the page are samples, labelled as such, because the product has not
launched and there are no real reviews to show.

---

## Project layout

```
src/
  app/                 routes only
    layout.tsx         fonts, metadata, pre-paint theme script
    globals.css        design tokens (Craft Premium), base styles, stylesheet order
    (marketing)/       public pages: shared layout + the landing page
  features/            one folder per product area, with its own styles
    landing/           landing page sections
    job-post/          task search and sentence-to-job-post logic
    assistant/         chat assistant
    services/          service browser and category pages
    booking/           the four-step booking flow
    auth/              demo account store and sign-in dialog
  components/          shared pieces: ui/, motion/, effects/, layout/
  lib/                 browser helpers: display preferences, speech
  data/                mock data, shaped like a future API response
  styles/              site-wide utility classes
public/
  videos/              hero clips: plumber, electrician, handyman
```

The rules that keep this tidy (server components by default, which folder may
import which) are in section 12 of `PROJECT-CONTEXT.md`, along with the full
background, decisions and rationale.

---

## Design system

Charcoal `#17140F` with a copper accent `#C87F41`, plus a warm cream light mode
on the same accent. Colours are CSS custom properties in `globals.css`, exposed
to Tailwind through `@theme inline` so utilities re-resolve when the theme
toggles. New styles must use those tokens rather than raw hex values, or the
light/dark switch breaks.

## Credits

Placeholder photography from [Unsplash](https://unsplash.com) and hero footage
from [Pexels](https://pexels.com), both used under their respective free
licences. These are stand-ins and should be replaced with our own media before
launch.
