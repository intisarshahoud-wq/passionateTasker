# Passionate Taskers — Milestones

Last updated: 2026-10-14

Planning folder for the website. The working copy lives in the workspace
`.claude/` (where Claude Code reads it); since 2026-10-14 a copy is also
committed in the repo at `passionate-taskers/.claude/`, at Intisar's request.
Change the workspace copy, then copy it into the repo before committing.

## How to use this folder

- One file per area. Each file has the same shape: **Status**, **Why it
  matters**, **Depends on**, **Done so far**, **Checklist**, **Done when**.
- Tick a box (`- [x]`) when the work has actually landed and been checked, not
  when it has been started.
- Change the Status line and the table below when a milestone moves.
- Anything that needs a decision from Intisar is marked **DECISION**. Nothing
  that depends on a decision gets built until the decision is made.

## Blueprint gap plan

[00-blueprint-gap-plan.md](00-blueprint-gap-plan.md) (written 2026-09-30)
compares the app with the 29 September 2026 blueprint
(`.claude/One_Updated_Passionate_Tasker_GPT.docx`): what is done, what is
missing, the decisions needed, and the build order in stages A to H. Read it
before picking the next piece of work.

## Status at a glance

| # | Milestone | Status | Blocked by |
|---|---|---|---|
| 00 | [Blueprint gap plan](00-blueprint-gap-plan.md) | Stage A done except the brand decisions | D1, D2, D3, D6 |
| 01 | [Design](01-design.md) | In progress | — |
| 02 | [Services](02-services.md) | In progress | Launch categories: DECISION |
| 03 | [Backend](03-backend.md) | **Blocked** | DECISION: database / auth / storage stack |
| 04 | [Database design](04-database.md) | Blocked | 03 |
| 05 | [Auth and verification](05-auth-verification.md) | Blocked | 03, 04 |
| 06 | [API design and verification](06-api-verification.md) | Not started | 03 |
| 07 | [Secrets and private APIs](07-secrets-private-apis.md) | Can start now | — |
| 08 | [Security check](08-security-check.md) | Runs alongside everything; must pass before 10 | — |
| 09 | [Accessibility audit](09-accessibility-audit.md) | Runs alongside everything; must pass before 10 | — |
| 10 | [Launch](10-launch.md) | Last | Everything above |

## Critical path

1. Get the landing page visually approved (01).
2. **Decide the backend stack** (03). This is the single thing blocking the most work.
3. Set the secret-handling rules before the first real key exists (07).
4. First real feature: the waitlist form saves an email (03 + 04 + 06).
5. Data model, then real auth and tradesperson verification (04, 05).
6. The core loop: post a job, match, message, book (02, 03, 06).
7. Security check and accessibility audit both pass (08, 09).
8. Launch to the waitlist (10).

## Rules that apply to every milestone

- **Accessibility is the product, not polish.** Blind, low-vision and elderly
  users must be able to use every screen. WCAG 2.2 AA is the floor. See
  `PROJECT-CONTEXT.md` section 11 and the `ui-ux-design` skill.
- **MVP scope rule:** one loop only — post a job, match, message, book. Three
  trades at launch: plumbing, electrical, handyman. If a feature does not
  directly help get a job booked, it waits (Phase 6 backlog).
- **No secret ever reaches the browser.** Every paid or private API is called
  from our server only. See 07.
- **Every API route checks who is calling and what they are allowed to see.**
  See 06.
- **The site must never claim something that is not true yet.** The landing page
  promises ID checks, DBS checks, trade-body verification and insurance. Those
  promises have to be real before launch (05).
- **Intisar does all pushes.** Commits are local only, authored as Intisar.
