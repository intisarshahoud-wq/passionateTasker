# Session handover — Passionate Taskers

Written 2026-09-14 at the end of a long session, so a new session can pick up
without the chat history. Private: lives in `.claude/`, never pushed.

**Update, 2026-10-14:** blueprint Stage A is built, checked and pushed (see
`.claude/milestones/00-blueprint-gap-plan.md`): high contrast, the new header,
four information pages, home page sections, honest trust wording, SEO. Still
waiting on Intisar: colours (D1), fonts (D2), name (D3), hero autoplay (D6),
the contact email, and the backend stack (D5). This `.claude/` folder is now
also committed in the repo; copy the workspace folder in before committing.

**Read in this order:** this file, then `passionate-taskers/PROJECT-CONTEXT.md`
(the full project handover, in the repo), then `.claude/milestones/README.md`
(the plan and what is blocked).

---

## Where things are

| What | Where |
|---|---|
| The app (Next.js 16) | `D:\web projects  with claude\passionate-taskers\` |
| Project handover (in the repo) | `passionate-taskers/PROJECT-CONTEXT.md`, section 12 is the architecture and its rules |
| Milestones (private) | `.claude/milestones/` (README plus 01 to 10) |
| Browser test scripts (private) | `.claude/tools/`, see its README |
| Design skills | `.claude/skills/ui-ux-design/`, `.claude/skills/logo-design/` |
| Original brief, roadmap | `taskers.pdf`, `AI-Trades-Marketplace-Roadmap.pdf`, `.claude/prompt.md` |

## Git

- Branch `main`, remote `origin` = https://github.com/intisarshahoud-wq/passionateTasker
- Everything is committed and pushed. Latest: `18034b8` ("Bring back the
  background hero video and smooth the hover fades"), after `9bb219a` (split
  hero, since replaced) and `d09adbf` (the big restructure, services, booking,
  assistant). Working tree was clean.
- `origin` used to point at `intisarshahoud-wq/Passionate-tasker`. That older
  repo was not touched; Intisar may want to archive or delete it himself.
- Rules: commits authored as `Intisar <intisarshahoud@gmail.com>`, never any
  Claude or AI attribution in commits. Only push when Intisar explicitly asks
  in that conversation; otherwise commit locally and hand him the command.

## What was built this session (all in the push)

1. **Chat assistant** (`src/features/assistant/`): for low-vision users.
   Non-modal docked panel (the page stays usable), clear short answers, a
   permanent Stop button, read aloud, voice input, can change text size and
   theme on request. Rule engine, no API key, free. Swap seam: `respond()` in
   `engine.ts`.
2. **Architecture restructure**: routes in `app/`, product areas in
   `features/`, shared pieces in `components/`, mock data in `data/`. Server
   components by default; shared `Reveal` wrappers replace copied animation
   code. Rules are in PROJECT-CONTEXT section 12.
3. **Hero video**: a playlist of three Pexels clips in `public/videos/`
   (plumber, electrician, handyman) that crossfade and loop
   (`src/features/landing/HeroMedia.tsx`). Later that day it went to a side panel and
   then, at Intisar's request, back to a full background: text on the left over
   a gradient that is dark on the left and clear on the right, and a banner
   above the text on narrow screens.
4. **Services and booking**: catalogue of 9 categories and 47 jobs in
   `src/data/services.ts`; tabbed service browser on the landing page;
   `/services`, `/services/[category]`, and a four-step booking flow at
   `/book/[category]/[service]` with sample taskers and a preview-only
   confirmation.
5. **Accessibility fix**: `--ink-faint` failed contrast in light mode across
   the site; fixed in `globals.css` (found by an axe scan).

Verified at the end: lint clean, production build clean, end-to-end browser
test all passing (axe zero serious issues on every page and booking step, in
both themes), hero contrast passing on every clip.

## Decisions Intisar made this session

- **Hero video autoplays for everyone, including reduced-motion setups.** It
  used to be held back for reduced motion. The pause button stays and a pause
  is remembered (`pt-hero-video` in localStorage). Recorded as a deliberate
  exception in PROJECT-CONTEXT section 11.
- **Catalogue expanded** from 3 trades to 9 categories (assembly, mounting,
  moving, cleaning, outdoor help, home repairs, painting, plumbing,
  electrical). All bookable in the prototype.
- Chat assistant must never block the page (non-modal), must have a real Stop.
- **The hero video is the background, and must be clearly visible.** After a
  side-panel attempt he asked for the background back: text on the left, the
  right of the video clear.
- **Hover fades:** reduced motion now removes movement only; colour and border
  fades stay (his PC reports reduced motion, which used to cut every fade).

## Decided by Claude, flagged to Intisar (can be changed)

- "Mechanic" was not added as a category: car repair is not a service the
  site offers, so a mechanic clip or category would advertise something that
  does not exist. The third hero clip is a handyman. One line to change.
- "Handyman" category is now called "Home repairs" (slug `home-repairs`).
- Sample taskers are labelled "Sample profile" and shown with initials, not
  photos, so no invented person looks real.

## Open decisions (nothing depending on these gets built until answered)

1. **Backend stack**: Supabase, or Neon + Clerk + Cloudflare R2. Blocks
   milestones 03, 04 and 05. This is the next real step.
2. **Which of the nine categories go live first at launch** (milestone 02).
3. PROJECT-CONTEXT mentions Claude in a few places (the planned AI provider,
   and notes about tooling files and skills). These were already in earlier
   commits and are now public. Ask whether he wants the tooling mentions
   removed (fully removing them would need a history rewrite).
4. His email address is in PROJECT-CONTEXT (and in every commit). Fine for a
   private repo; worth a mention if the repo is public.

## Useful facts about this machine

- **Windows "Animation effects" is off**, so every browser reports
  prefers-reduced-motion: reduce. This is why the hero video did not autoplay
  for him before the decision above. Remember it when something "does not
  animate".
- Intisar usually has the dev server running on port 3000. Checks use a
  production build on port 3100 so they do not disturb it.
- Chrome and Edge are installed. Python is available. ffmpeg is not installed
  (video frames were extracted through the browser instead).
- Tooling gotcha: inline shell heredocs sometimes mangle backslashes (a `\b`
  in a regex once became a literal backspace byte and silently broke the
  assistant's "stop" command). For any script with backslashes or complex
  quoting, write it to a file with the Write tool, then run it.

## Working with Intisar

- He is the solo builder and is learning web development: explain the why,
  step by step.
- Global preference: the `caveman` communication style (full) in chat, normal
  prose for code, comments, commits and docs.
- He cares most about accessibility (blind, low-vision, elderly users) and
  about the site never claiming something that is not true yet.
- He often sends follow-up requests mid-task; handle them as they arrive.

## Suggested next steps

1. Get his answer on the backend stack (milestone 03), then make the waitlist
   form actually save an email: the first real backend feature.
2. Decide the launch categories; add FAQs to category pages (milestone 02).
3. Real auth to replace `src/features/auth/demo-auth.ts` (milestone 05),
   keeping the `useSession()` seam.
4. Before any real API key exists, set up the secrets rules (milestone 07).
