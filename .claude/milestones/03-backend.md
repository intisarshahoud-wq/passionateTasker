# 03 — Backend

**Status:** Blocked on a decision
**Depends on:** the stack decision below
**Why it matters:** right now nothing is saved anywhere. The waitlist, accounts
and job posts are all frontend-only demos.

## Already decided

- Next.js Route Handlers as the backend (no separate server) — one thing to deploy while learning
- React Aria Components for the UI layer
- Web Speech API for voice input at MVP

## Decisions needed first

- [ ] **DECISION: database + auth + file storage**
  - **Supabase:** Postgres, auth and storage in one product. Fewer moving parts and one dashboard. Security depends on writing Row Level Security policies correctly.
  - **Neon + Clerk + Cloudflare R2:** a specialist product for each job. More wiring, three dashboards, more to learn.
- [ ] **DECISION: hosting** (Vercel is the natural fit for Next.js — confirm)
- [ ] **DECISION: transactional email provider** (verification emails, match notifications)
- [ ] **DECISION: reconfirm Claude** for turning a job description into a structured post
- [ ] **DECISION: how tradespeople get notified** of a new lead (email only, or SMS too)

## Checklist

### Foundation
- [ ] Create `src/server/` for database and secret-key code (every file starts with `import "server-only"`) and `src/app/api/` for thin Route Handlers, as laid out in `PROJECT-CONTEXT.md` section 12
- [ ] Three environments: local, preview, production, each with its own database
- [ ] Environment variables set up the way 07 describes
- [ ] One shared error format for all routes, with no stack traces sent to the browser
- [ ] Logging that never records personal data (emails, phone numbers, addresses, messages)

### First real feature: the waitlist
- [ ] Waitlist form saves email, postcode and role (customer or tradesperson)
- [ ] Server-side validation, duplicate emails handled politely
- [ ] Rate limit on the route
- [ ] Optional confirmation email

### AI
- [ ] Move `structureJob()` (`src/features/job-post/structure-job.ts`) to a server-side Claude call behind the same function signature
- [ ] Keep the keyword match as the fallback when the AI call fails or times out
- [ ] Spending cap and per-user rate limit on every AI route
- [ ] Optional: upgrade the chat assistant's `respond()` (`src/features/assistant/engine.ts`) to Claude through a server route

### Core loop
- [ ] Create a job post
- [ ] Matching (see 02)
- [ ] Messaging between customer and tradesperson
- [ ] Booking status: posted, matched, booked, completed, cancelled
- [ ] Reviews unlock only when both sides mark the job complete

## Done when

A real customer can post a job on the preview environment, a real tradesperson
sees it, they exchange messages, and the job is marked booked. All of it is
stored in the database, and it passes the API checks in 06.
