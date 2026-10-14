# 00 — Blueprint gap plan

Written: 2026-09-30

Source: `.claude/One_Updated_Passionate_Tasker_GPT.docx` (the blueprint, version
1.0, dated 29 September 2026), compared against what is in the
`passionate-taskers` repo at commit `cbc3702` and `PROJECT-CONTEXT.md`.

This file answers one question: **what does the blueprint ask for that the app
does not have yet, and in what order should it be added?** It sits above
milestones 01 to 10 and points at them; it does not replace them.

---

## 1. Where the app is today

The app is a front end only. It has a landing page, service pages, a four-step
booking prototype, booking by voice, a chat assistant and demo accounts. There
is no server code, no database, no real login, and nothing is saved or sent.

So the honest summary is: **most of the blueprint's public-site work (its
Phase 1) exists in some form; almost everything from its Phase 2 onward does
not exist.**

## 2. Decisions needed first

Nothing that depends on one of these gets built until it is answered. Each has
a recommendation so the plan can carry on if you agree.

| # | Decision | Blueprint says | App has today | Recommendation |
|---|---|---|---|---|
| D1 | Colours | Ivory `#F4EFE7`, charcoal `#211C19`, copper `#B85C2E`, stone `#D9D1C7` | Craft Premium: `#17140F`, `#C87F41`, cream `#FAF6F0`, dark-led | Adopt the blueprint values as the light theme and keep dark mode as the optional theme. It is a token change in `globals.css`, not a rebuild. By my calculation white text on the blueprint copper reaches about 4.6:1 (passes AA), where the current copper reaches about 3.2:1, so the new copper is the better button colour. Copper as small text on ivory is about 4.0:1 and would fail, so body-size copper text is not allowed. Confirm with the contrast script before shipping. |
| D2 | Fonts | Cormorant Garamond for large editorial headings only, Inter for everything functional | Jost headings, Geist body | Your call on the look. If adopted: serif on the hero and section headings only; every form, button and instruction in Inter. |
| D3 | Name | "Passionate Tasker" | "Passionate Taskers" (repo, site, skills) | Pick one. A change touches the logo, metadata, copy and the repo name. |
| D4 | Backend shape | A separate NestJS service | Agreed: Next.js Route Handlers, one deployable | Keep Route Handlers. The blueprint itself says vendors can change as long as the module boundaries stay. Keep its boundaries as folders under `src/server/`. Revisit only if realtime or queues outgrow it. |
| D5 | Database, auth, storage | PostgreSQL, S3-compatible storage | Not decided (Supabase, or Neon + Clerk + R2) | Both options are PostgreSQL, so either fits. Still the single biggest blocker (milestone 03). |
| D6 | Hero video under reduced motion | Remove auto-play | Autoplays for everyone, pause remembered (your decision, 14 Sept) | Keep your decision or follow the blueprint; they cannot both stand. |
| D7 | Launch scope | Everything in phases 0 to 7 | One loop: post, match, message, book | Keep the one-loop launch. Add the rest in the order in section 4. |
| D8 | Launch categories | 12 groups, about 90 trades | 9 categories, 47 jobs | Launch with the categories you can actually verify tradespeople for. Treat the blueprint list as the long-term catalogue. |
| D9 | Device priority | Mobile first | Equal mobile and desktop | Keep equal priority. The app already works from 320px, which is what the blueprint needs. |

## 3. Gap by blueprint section

Status key: **Done** (built and checked), **Partial** (exists but short of the
blueprint), **Missing** (nothing built).

| Blueprint section | Status | What exists | What is missing |
|---|---|---|---|
| 3. Brand and creative direction | Partial | Token system, two themes, self-hosted fonts | Blueprint palette and fonts (D1, D2); own photography instead of Unsplash and Pexels |
| 4. Homepage | Partial | Hero with voice and text input, trust strip, services, popular jobs, how it works, trust, accessibility, sample reviews, tradesperson section, waitlist, footer | The supporting brand line; how it works as five steps (Tell, Match, Talk, Track, Approve) instead of three; milestones explainer; payments and disputes explainer; FAQ; link to a Mission and Accessibility page |
| 5. Accessibility framework | Partial | Larger text, light and dark, reduced motion handling, keyboard flow, focus management, error summary, axe scan clean, read aloud in the assistant | High-contrast theme; language selector; dedicated Mission and Accessibility page with a "known limitations and contact us" section; manual screen-reader test record; live-region audit |
| 6. Customer journey | Partial | Steps 1 to 3 as a prototype: describe, add postcode, size, details, date and time, pick from sample taskers | Photos and video upload, budget, access needs; real matching with a reason for the match; steps 4 to 8 entirely (communicate, agree scope, track, approve, complete) |
| 7. Tradesperson journey | Missing | One landing section and a waitlist role toggle | Profile, service area, languages, availability, verification upload, job inbox, quotes, milestone evidence, payment status, reputation |
| 8. Trust, verification, reviews | Missing | Trust copy and sample reviews labelled as samples | Real checks, badges that say exactly what was checked, expiry and re-check, reviewer audit log, reviews tied to completed jobs |
| 9. Messaging, voice, translation, video | Partial | Voice job posting with read-back and confirmation (keyword matching, browser speech) | Messaging, translation, video, voice quotes; real speech-to-text and model extraction behind the existing `understandRequest()` and `structureJob()` seams |
| 10. Milestones, payments, disputes, voice receipts | Missing | Nothing | Milestone state machine, audit log, payment provider, webhooks, disputes, invoices and receipts, off-platform reporting |
| 11. Taxonomy | Partial | 9 categories, 47 jobs in `src/data/services.ts` | The other groups (building, roofing, specialist services and so on), added only as supply exists |
| 12. Technology architecture | Partial | Next.js, React, TypeScript, accessible component layer | Everything server-side: database, ORM, cache and queue, realtime, storage, payments, AI calls, logging and error monitoring |
| 13. Data model and state machines | Missing | Mock data files only | All entities, permissions, backend-only state transitions |
| 14. Responsive and motion | Partial | Checked from 320 to 1920; reduced-motion handling | Audit against the blueprint's limits (hover lift 2 to 4px, no scale pulses, cursor effects on fine pointers only); GSAP pin, Magnetic and CursorGrid need measuring |
| 15. SEO and AI discoverability | Partial | Server-rendered `/services` and category pages | Per-page titles and descriptions, structured data, sitemap, robots, canonical URLs, FAQ content, About, Trust, Verification, Payments and Safety pages, guides |
| 16. Impact metrics | Missing | Nothing | Privacy-preserving analytics events for voice use, accessibility feature use, completion rate |
| 17. Security and privacy | Missing | Rules written in milestones 07 and 08 | The actual work: rate limits, MFA for tradespeople and admins, document isolation, signed URLs, webhook signature checks, legal review, privacy policy |
| 18. Definition of done | Partial | Lint, build, end-to-end browser test with axe | Automated unit and integration tests, backend authorisation tests, analytics event per feature |

## 4. Build order

Each stage lists what to build, which existing milestone file holds the detail,
and what "done" means. Stages A to D are the launch. Stages E to H are after
launch.

### Stage A — Finish the public site (blueprint phases 0 and 1)

No backend needed, so this can start now. Milestones 01, 02, 09.

**Status (2026-09-30): items 2 to 7 built and checked; item 1 waits on D1, D2,
D3.** `npm run pages` in `.claude/tools` passes (176 checks), as do `e2e`,
`voice` and `contrast`.

1. [ ] Settle D1, D2, D3, then apply the tokens and fonts and re-run the
   contrast and axe scripts in both themes. **Waiting on the decisions.** The
   brand name is now in one place (`src/lib/site.ts`), so D3 is a one-line
   change.
2. [x] Homepage: the supporting brand line (above the headline), the five-step
   how it works (tell us, match, talk, track, approve), a staged-jobs
   explainer labelled "Planned", a paying-and-problems explainer that says you
   pay the tradesperson directly at launch, and an eight-question FAQ.
3. [x] New pages: `/accessibility` (mission, display settings, what works,
   the standard, how we test, eight known limitations, contact route),
   `/how-it-works`, `/trust` (titled "Trust and safety" to match the nav),
   `/about`. The contact route says plainly there is no inbox yet:
   **DECISION** which address to publish (`SITE.contactEmail`).
4. [x] High contrast: a third setting, white on black or black on white with
   light mode, also switched on by the device's "more contrast" setting. The
   header was rebuilt around it: three labelled settings in the bar on wide
   screens, one "Display" button opening a panel on narrow ones, with layout
   steps in ems so larger text no longer overflows the bar.
5. [x] Motion audit: lifts capped at 4px, scroll entrances at 12px and 400ms,
   the pointer glow limited to mouse and trackpad, and nothing moves on hover
   with reduced motion. Kept as they were, for Intisar to decide: the 320ms
   hover fade he asked for (the doc says 160 to 220ms), the pinned how-it-works
   section (now only where all five steps fit in one row), the headline word
   stagger, and the hero video autoplay (D6).
6. [x] SEO: page titles, descriptions, canonical links and share cards on
   every page; `robots.txt`; `sitemap.xml` (15 pages, booking left out and set
   to noindex); Organization, WebSite, FAQPage, Service and BreadcrumbList
   structured data. No prices, ratings or reviews in it. Set
   `NEXT_PUBLIC_SITE_URL` when deploying.
7. [x] Trust wording: one source (`src/data/trust.ts`); badges say what was
   checked ("Identity verified", "Public liability insurance checked", "Trade
   registration checked", "Basic DBS check seen"). Removed: "payment is held
   until you confirm", "enhanced DBS", "Gas Safe verified" (gas work is not
   offered). **For legal review** before launch: the basic DBS wording and the
   statement that standard and enhanced checks are limited by law.

Also fixed on the way: in larger-text mode the header and some pages scrolled
sideways on phones; the hamburger menu did nothing between 860px and 1280px;
the search button had no name on phones; the sample taskers' badges were not
read out by screen readers.

Done when: every public page passes axe in all themes, keyboard and
screen-reader walkthrough recorded, no claim on the site is ahead of reality.
(Automated part done. The screen-reader walkthrough is manual and still to do,
milestone 09.)

### Stage B — Foundation, accounts and verification (blueprint phase 2)

Blocked by D5. Milestones 03, 04, 05, 06, 07.

1. Choose the stack (D5). Set the secrets rules before the first key exists.
2. Create `src/server/` with the blueprint's module boundaries as folders.
3. First real feature: the waitlist form saves an email.
4. Data model, first slice: User, CustomerProfile, TradespersonProfile,
   BusinessProfile, TradeCategory, Credential, InsurancePolicy, AuditEvent.
5. Real authentication behind the existing `useSession()` seam; MFA or passkeys
   for tradespeople and admins.
6. Tradesperson onboarding: profile, services, service area, languages,
   availability.
7. Credential upload to private storage with signed URLs; admin review screen;
   status and expiry; audit log of who reviewed what and when.

Done when: a tradesperson can sign up, upload documents and be verified by an
admin, and each badge on their profile states what was checked.

### Stage C — Jobs, matching and messaging (blueprint phase 3)

Milestones 02, 03, 06.

1. Data: Job, JobAttachment, Match, Conversation, Message, Notification.
2. The booking prototype saves a real job, with photos, budget range, urgency
   and access needs added.
3. Real speech-to-text and model extraction behind `understandRequest()` and
   `structureJob()`, always with the editable review step.
4. Matching by trade, location and availability, showing the reason for each
   match.
5. Tradesperson job inbox and response.
6. Project-scoped messaging. Start with plain saved messages; add realtime
   delivery events after it works.
7. Notifications (email first).
8. Signed-in screens under `src/app/(app)/` for both roles.

Done when: a real customer can post a job, a verified tradesperson can see it,
they can message, and the job is marked booked. This is the MVP loop.

### Stage D — Launch gate

Milestones 08, 09, 10.

1. Security check passes.
2. Accessibility audit passes, including manual screen-reader testing with real
   users where possible.
3. Legal pages and review: terms, privacy, cookies, accessibility statement.
4. Own photography or licensed images in our own storage.
5. Deploy and open to the waitlist.

### Stage E — Quotes, projects and milestones (blueprint phase 5)

1. Data: Quote, QuoteLine, Project, Milestone, MilestoneEvidence.
2. Quote builder showing scope, dates, fees and expected payout before
   acceptance.
3. Milestone state machine (DRAFT to PAID plus the exception states), with
   backend-only transitions and an audit event for each.
4. Accessible timeline: current state, next action, history.
5. Evidence upload; customer approves or requests changes.
6. Reviews unlocked only by a completed job.

### Stage F — Payments, disputes and records (blueprint phase 6)

1. Choose a marketplace-capable payment provider; take legal and accounting
   advice on how money is held. Do not use the word "escrow" unless it legally
   is one.
2. PaymentService on the server, signed and idempotent webhooks,
   PaymentRecord and PayoutRecord.
3. Dispute workflow: freeze, collect evidence, deadlines, admin view, logged
   resolution.
4. Invoices and receipts, then the voice invoice assistant with a preview and
   explicit confirmation.
5. Off-platform payment reporting with human review.

### Stage G — Translation and video (blueprint phases 3 and 4, deferred parts)

1. Message translation: keep the original, store the translation as a derived
   copy, label it as machine translated, let both sides see the original.
2. Language selector for the interface.
3. Video consultation with LiveKit: server-issued short-lived tokens, text
   state labels, audio-only fallback, captions where available, no recording by
   default.

### Stage H — Growth and measurement (blueprint phase 7)

1. Trade and location pages, only where there is real coverage.
2. Guides (hiring a tradesperson, preparing for a quote, accessibility
   adaptations).
3. Impact metrics from blueprint section 16, collected in aggregate.
4. Retention tests, such as a lower fee for repeat work.
5. Catalogue expansion toward the full blueprint taxonomy.

## 5. Every feature, before it counts as done

From blueprint section 18, to be applied from Stage A onward:

- Works on mobile, tablet and desktop.
- Keyboard operable with visible focus.
- Screen-reader labels and states checked.
- Loading, error, empty and success states designed.
- Backend authorisation tested (from Stage B).
- Analytics event defined without collecting unnecessary sensitive data.
- Automated tests plus a manual happy-path and failure-path test.
- Reduced-motion behaviour checked.
- Plain English copy that does not overclaim trust, verification or payment
  protection.

## 6. What to do next

1. Answer D1, D2, D3 and D6, which unblock Stage A.
2. Answer D5, which unblocks Stage B.
3. Start Stage A while D5 is being decided; none of it needs a backend.
