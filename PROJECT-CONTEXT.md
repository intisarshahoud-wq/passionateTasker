# Passionate Taskers — Project Context

> **Read this first.** It is the single handover document for the project: what it is,
> why it exists, what has actually been built so far, how to run it, and what comes next.
> No prior knowledge of the project is assumed.

Owner / sole developer: **Intisar** (intisarshahoud@gmail.com)
Last updated: **2026-09-07**
Repo: `passionate-taskers/` inside `D:\web projects  with claude\`

---

## 1. What this is, in one paragraph

Passionate Taskers is a marketplace that connects homeowners with tradespeople —
plumbers, electricians, handymen. Think Checkatrade or TaskRabbit, with two
deliberate differences: **you describe your problem in plain words (by voice or
text) instead of filling in forms**, and the whole product is **designed for
blind, low-vision and elderly users from day one** rather than having
accessibility bolted on later. An AI turns "my kitchen tap has been leaking
since this morning" into a structured job post — category, priority, details —
and matches it to verified, insured tradespeople nearby.

**Right now the project is a marketing landing page with a waitlist.** There is
no backend, no database, no login, and no actual job-matching yet. That is
intentional — see section 5.

---

## 2. Why it exists (the bet)

| Problem today | What Passionate Taskers does instead |
|---|---|
| Job posting means long forms with fields most people don't understand | Speak or type one sentence; AI structures it |
| Customers scroll dozens of near-identical profiles | AI matches and ranks; you see a shortlist |
| Existing sites assume you can type, see well, and use a mouse | Voice navigation, screen-reader support, one-tap large text and light mode |
| Tradespeople chase unqualified leads | Leads pre-qualified by AI, answerable by voice while on site |

The accessibility angle is not a feature — it is the moat. The two incumbents
were built for typing, sighted users, and retrofitting that is expensive for them.

---

## 3. Current status — what actually exists

A single-page, production-quality **landing page** at `/`, built with Next.js.
It is not deployed yet; it runs locally.

The page was rebuilt on 2026-09-07 around the marketplace structure TaskRabbit
UK uses — task-first hero search, service discovery, transparent price anchors,
trust, social proof, conversion — while keeping the project's own Craft Premium
palette and type. The teardown it was built against is
`.claude/taskrabbitteardownbuildbrief.md.pdf`.

Sections on the page, in order:

1. **Header** — brand, five-item nav, the two accessibility toggles (larger
   text, light/dark), waitlist CTA, and a hamburger menu below 860px
2. **Hero** — looping background video over a still photograph, behind a
   graded scrim; animated headline, the task search, quick category chips and a
   four-item trust strip. The video never autoplays under reduced motion and
   always has a labelled pause control (WCAG 2.2.2)
3. **Services** — eight category cards; the three launch trades are marked
   "Available now" and the other five "Coming soon"
4. **Popular jobs** — filterable price-anchor cards with photos ("from £54",
   typical duration)
5. **How it works** — three steps, pinned scroll-scrub on wide screens only
6. **Trust and safety** — ID/DBS, trade-body verification, insurance and payment
7. **Accessibility** — "Not a setting we added later", pointing at the live toggles
8. **Reviews** — six five-star sample reviews with photo avatars and a rating
   summary. The section states in its own copy that these are samples, because
   we have not launched and there are no real reviews to show
9. **For tradespeople** — supply-side benefits and a stat card
10. **Waitlist** — role toggle (customer / tradesperson) + email + postcode
11. **Footer** — four columns plus a pre-launch disclaimer

The header carries the account state: Sign in / Create account when signed out,
and a name chip with sign-out when signed in.

**The hero search is the centrepiece.** Typing or speaking a sentence produces a
structured job post in front of you — category, priority, matches nearby — which
is the product's actual differentiator, demonstrated rather than described. The
category guess is a keyword match in `structureJob()`; it stands in for the
Claude call that will do it properly later. Voice uses the browser's Web Speech
API where available and degrades to a typed message where it is not.

**Accounts are a demo, not authentication.** `src/lib/auth.ts` keeps a plain
object in localStorage. There is no server, no password verification and no
token; passwords are never stored, not even hashed. "Continue with Google" opens
our own clearly-labelled chooser — no Google API is contacted, and it never asks
for a Google password, because a convincing replica of a Google sign-in form is
a phishing pattern whatever the intent.

The seam to keep when real auth arrives is the exported API: `useSession()`,
`register()`, `signIn()`, `signInWithGoogle()`, `signOut()`. Every component
reads the session through `useSession()`, so swapping the implementation should
not touch the UI.

The hero search likewise submits nowhere — it renders the structured job post
locally.

### Where the code lives

- `src/lib/marketplace.ts` — all mock data (categories, projects, suggestions,
  testimonials, trust points), shaped like a future API response
- `src/lib/display-prefs.ts` — the light-mode / larger-text store, mirrored onto
  `<html>` and applied pre-paint by a script in `layout.tsx`
- `src/components/site/*` — one component per section, plus `Icon`, `ServiceCard`
  and `TaskSearch`, all reusable for category and search pages later
- `src/app/marketplace.css` — the landing-page styles, imported by `globals.css`;
  tokens only, no raw hex, so the light/dark toggle keeps working

### Responsive

Checked at 320, 360, 390, 414, 768, 834, 1024, 1280, 1440 and 1920 with a script
that fails on any horizontal overflow or any hit target under 24x24 CSS px. Two
header breakpoints matter: the full nav gives way to the hamburger at 1280 (the
bar carries brand, nav, two accessibility toggles and two account buttons), and
below 380 the wordmark drops to the mark alone.

### Imagery

Hero footage is `public/hero.mp4` (Pexels, 1280x720, 4.7 MB), committed so the
demo works offline. Placeholder photography comes from Unsplash, referenced by photo id in the
`UNSPLASH` and `PORTRAITS` maps in `src/lib/marketplace.ts` and turned into URLs
by `unsplashUrl()`. `next.config.ts` allows `images.unsplash.com` under
`images.remotePatterns` so `next/image` can optimise them.

This is a pre-launch convenience, not an architecture decision. Before launch
the photos should move to our own storage and that remote pattern should be
removed rather than added to — a production marketplace should not depend on a
third-party image host for its core page, and the portrait photos in particular
are real people who have not agreed to front our reviews.

`HeroVideo.tsx` and `PreviewCard.tsx` are from the previous hero and are no
longer used by the page. They are kept for the moment in case a hero video
returns.

Git: one commit (`Initial commit: Passionate Taskers landing page`). Everything
described above is currently uncommitted.

---

## 4. How to run it

**Prerequisites:** Node.js v24 (the machine it was built on runs v24.19.0) and npm.

```bash
cd passionate-taskers
npm install
npm run dev          # http://localhost:3000
```

Other scripts: `npm run build` (production build), `npm start` (serve the build),
`npm run lint` (ESLint).

---

## 5. Scope — what is in the MVP and what is deliberately not

The full vision doc lists 16 trade categories and a dozen ambitious features.
That was **cut down on purpose** so the thing can actually ship.

**In the MVP — one loop only:**
customer posts a job → matched tradespeople see it → they message → job gets booked.

- Text-first job posting. Voice input sits **on top of** the same text field and
  is never required.
- **Three** trade categories at launch: plumbing, electrical, handyman.
- Free for both sides. Monetisation comes later.
- Tradesperson verification is done manually at this scale.
- Payment happens offline between the two parties — no money moves through the platform.
- Disputes go to a support email.

**Explicitly deferred (Phase 6 backlog, in priority order):**
price estimator, quote comparison, scheduling, in-platform payments (Stripe),
live video calls, project tracker, AI dispute resolution, translation,
premium memberships, international expansion.

If someone proposes a feature, check it against this list first. The rule of
thumb: does it directly help get a job booked? If not, it waits.

---

## 6. Roadmap

| Phase | What | Status |
|---|---|---|
| 0 | Environment, scaffolding, branding, landing page | Done |
| 1 | Minimal data model: users, trade_categories, jobs, job_matches, messages, reviews | Not started — **blocked on the backend decision, section 8** |
| 2 | Core text-based loop: post a job → match → message → book | Not started |
| 3 | AI layer: job-description generator, voice input, AI search | Not started |
| 4 | Accessibility retrofit and audit pass | Not started |
| 5 | Deploy the MVP | Not started |
| 6 | Backlog features, in the priority order above | Not started |

Rough original estimate: 4–6 weeks part-time from scaffold to a live MVP.

---

## 7. Tech stack, and why each piece was chosen

| Layer | Choice | Reasoning |
|---|---|---|
| Framework | **Next.js 16.3** (App Router, `src/` dir) | React + routing + server code in one deployable |
| Language | **TypeScript** | Catches mistakes at edit time, which matters when learning |
| UI library | **React 19.2** | — |
| Styling | **Tailwind CSS v4** + hand-written CSS | See section 9 — both are used, on purpose |
| Components | **React Aria Components** | Chosen over shadcn/ui because accessibility is the differentiator, and React Aria is the more rigorously screen-reader-tested option. *Installed but barely used yet — the landing page is hand-built markup.* |
| Backend API | **Next.js Route Handlers** (not a separate NestJS service) | One deployable, one language, less to learn |
| Animation | **Motion** (Framer Motion) + **GSAP ScrollTrigger** | See section 10 |
| Fonts | **Jost / Geist / Geist Mono** via `next/font` | Self-hosted, so every OS renders the same |
| Database / auth / storage | **NOT DECIDED** | See section 8 |
| Voice | Web Speech API for the MVP; OpenAI Realtime API later | Browser-native is free and good enough for single-shot dictation |
| AI extraction | Claude (Anthropic API) | Turning free text into structured job fields |

---

## 8. The one big open decision

**Database + auth + file storage has deliberately not been chosen.** The two
candidates on the table:

- **Supabase** — Postgres + auth + storage in one product, fewer moving parts
- **Neon + Clerk + Cloudflare R2** — best-of-breed each, more wiring

Intisar chose to build the frontend first and defer this. **Do not start writing
backend or data code assuming one of these — ask him first.** Everything from
Phase 1 onward depends on this answer.

---

## 9. Design system — "Craft Premium"

Locked on 2026-08-08 after exploring three directions. The feel to aim for is
Apple's website: huge confident type, lots of restraint, one accent colour used
sparingly. Warm, luxurious, trustworthy — not the usual blue-and-white
trades-site look.

**Two surfaces, one brand.** This split exists for a medical reason, not a
stylistic one: light text on a dark background causes halation (glow/smearing)
for people with astigmatism, which is common in older eyes. So:

- **Dark charcoal + copper** — marketing surfaces only (hero, about, footer): short, high-impact viewing
- **Light warm cream + copper** — functional surfaces (job posting, dashboard, messaging): extended reading and typing

**Core tokens** (defined in `src/app/globals.css`):

| Token | Dark | Light |
|---|---|---|
| `--bg` | `#17140F` | `#FAF6F0` |
| `--surface` | `#201C17` | `#FFFFFF` |
| `--ink` | `#F3ECE3` | `#221C15` |
| `--accent` | `#C87F41` (copper) | `#C87F41` |
| `--line` | `#332C24` | `#E7DCCB` |

Type: geometric sans (**Jost**, in the Futura lineage) for headlines; Geist for
body. The original design called for Futura/Avenir Next, but those only exist on
macOS — Windows silently fell back to Century Gothic and the brand looked
different depending on the visitor's OS. Jost is the open-source fix.

Device priority: **equal mobile and desktop**, not mobile-first — elderly users
skew toward desktop and laptop.

### How theming works (important, easy to break)

1. Tokens are plain CSS custom properties on `:root`.
2. Light mode overrides them under `html[data-mode="light"]`.
3. They are exposed to Tailwind through an **`@theme inline`** block, which is
   why classes like `bg-surface`, `text-ink-faint`, `border-line` and
   `font-brand-display` work.

**`inline` is not optional.** A plain `@theme` bakes the dark hex values into the
generated utilities and light mode silently stops working. Fonts are namespaced
`--font-brand-*` to avoid a circular reference with the source `--font-*` variables.

**Do not bulk-convert the existing hand-written CSS to Tailwind utilities.** That
was considered and rejected: pure churn, regression risk, no visual gain. Use
Tailwind for new work; keep the complex effects (pseudo-element shine, spotlight,
layered shadows, keyframes, canvas) in CSS.

---

## 10. Animation stack

- **Motion** (`motion/react`) — entrance and scroll-reveal animations, the
  word-by-word headline stagger, and the `AnimatePresence` swap when the
  waitlist form submits. Wrapped in `<MotionConfig reducedMotion="user">`.
- **GSAP + ScrollTrigger + @gsap/react** — the pinned, scroll-scrubbed
  "How it works" section. This is the only place GSAP is used.
- **`Magnetic`** — a small wrapper that makes a button drift slightly toward the cursor.
- **`CursorGrid`** — adapted from React Bits, with local fixes: accepts children
  so pointer events bubble, copper by default, a reduced-motion guard, and a fix
  for an upstream ref-write-during-render bug.

React Bits components come from `https://reactbits.dev/r/{Name}-TS-CSS.json`.
**Pull the files directly — do not run `shadcn init`, it overwrites `globals.css`.**

---

## 11. Accessibility rules (non-negotiable)

These are the product, not polish:

- Every animation respects `prefers-reduced-motion` — the global CSS kills
  durations, Motion is configured with `reducedMotion="user"`, and each
  hand-rolled effect (card tilt, stat counter, video autoplay, magnetic buttons)
  checks the media query itself.
- The hero video **always** exposes a play/pause control; motion is never unavoidable.
- Toggle buttons carry real `aria-pressed` state.
- Decorative SVG is `aria-hidden`; every interactive control has a label.
- The header's larger-text toggle scales the root font size (100% → 118%), so
  everything scales with it — never hard-code `px` font sizes.
- Effects that need a mouse are gated behind `(pointer: fine)`.

---

## 12. Repo map

```
passionate-taskers/
├── src/
│   ├── app/
│   │   ├── layout.tsx        Root layout; loads Jost/Geist via next/font, sets page metadata
│   │   ├── page.tsx          The entire landing page (~685 lines) — all sections + animations
│   │   ├── globals.css       Design tokens, @theme inline bridge, all component CSS (~490 lines)
│   │   └── favicon.ico
│   └── components/
│       ├── LogoMark.tsx      The mark as inline SVG, stroke-drawable
│       ├── HeroVideo.tsx     Hero video with play/pause control + graceful fallback
│       ├── PreviewCard.tsx   Product mock; the hero's default media when no video exists
│       ├── Magnetic.tsx      Cursor-attraction wrapper (Motion springs)
│       └── reactbits/
│           └── CursorGrid.tsx / CursorGrid.css   Adapted background grid effect
├── public/                   Default Next.js SVGs; drop hero.mp4 + hero-poster.jpg here
├── package.json
├── next.config.ts, tsconfig.json, eslint.config.mjs, postcss.config.mjs
└── PROJECT-CONTEXT.md        ← this file
```

`page.tsx` is large because the whole landing page lives in it. When Phase 2
starts, sections should be split into components.

Note: `page.tsx` currently mixes React state with a large `useEffect` that grabs
DOM nodes by `getElementById` — a carry-over from the original static HTML
prototype. It works and cleans up its listeners properly, but converting those
toggles to React state is a known, worthwhile refactor.

---

## 13. Conventions and gotchas

- **Next.js 16 is newer than most tutorials and most AI training data.** When in
  doubt, read the guides in `node_modules/next/dist/docs/` rather than relying on
  remembered Next.js patterns.
- **Never push to a remote.** Intisar performs every push himself so the GitHub
  contribution history is entirely his own. Commit locally, then hand him the command.
- **No AI attribution in commits** — no `Co-Authored-By` trailer, no
  "Generated with..." footer.
- AI-tooling files (`CLAUDE.md`, `AGENTS.md`, `.mcp.json`, `.claude/`) are
  intentionally listed in `.gitignore` and kept out of the repo's history.
- Commits are authored as `Intisar <intisarshahoud@gmail.com>`.
- Tailwind v4 has been installed since the initial scaffold. If someone says
  "add Tailwind" — it is already there, check before acting.

---

## 14. Reference documents

Everything below lives in the parent folder, `D:\web projects  with claude\`:

- **`taskers.pdf`** — the original vision doc: "AI-Powered Trades Marketplace:
  Project Vision & Development Plan". Competitive analysis of Checkatrade and
  TaskRabbit, 12 feature ideas, recommended stack. This is the *raw, unscoped*
  vision — read section 5 of this file for what was actually kept.
- **`AI-Trades-Marketplace-Roadmap.pdf`** — the scoped, phased build plan.
- **`.claude/skills/ui-ux-design/`** and **`.claude/skills/logo-design/`** —
  project-specific design guidance (user psychology, premium branding,
  accessibility checks, logo constraints), used when working with Claude Code.

---

## 15. Glossary

| Term | Meaning |
|---|---|
| **MVP** | Minimum viable product — the smallest version that proves the idea |
| **App Router** | Next.js's current routing system; folders under `src/app` become URLs |
| **Design token** | A named value (colour, font) defined once and reused everywhere |
| **ScrollTrigger** | GSAP plugin that ties an animation's progress to scroll position |
| **Pin / scrub** | "Pin" freezes a section on screen; "scrub" plays its animation as you scroll |
| **`prefers-reduced-motion`** | An OS setting meaning "motion makes me unwell — don't animate" |
| **ARIA** | HTML attributes that tell screen readers what a control is and what state it's in |
| **Halation** | The glow/smear effect light-on-dark text creates for astigmatic eyes |
| **Route Handler** | A Next.js file that answers HTTP requests — the backend, inside the same app |

---

## 16. If you're picking this up, start here

1. Run it (section 4) and click the two header toggles — larger text, and light
   mode. That is the product thesis in miniature.
2. Skim `src/app/page.tsx` top to bottom. It is one file, and it is the whole
   product as it stands today.
3. Read section 5 (scope) and section 8 (the open backend decision) before
   proposing anything.
4. The next real piece of work is Phase 1: decide the backend, then build the
   data model and make the waitlist form actually save an email.
