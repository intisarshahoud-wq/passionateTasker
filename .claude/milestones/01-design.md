# 01 — Design

**Status:** In progress
**Depends on:** nothing
**Why it matters:** the design is the accessibility promise. A screen that
cannot be used by a blind or elderly visitor is a broken screen, not an
unpolished one.

## Done so far

- [x] Brand direction locked: Craft Premium (charcoal `#17140F` + copper `#C87F41`), light companion on cream `#FAF6F0`
- [x] Typography: Jost (display), Geist (body), Geist Mono, self-hosted with `next/font`
- [x] Landing page: 11 sections, TaskRabbit-style structure, own brand
- [x] Larger-text and light/dark toggles, applied before first paint
- [x] Hero task search: sentence or voice to a structured job post
- [x] Chat assistant: non-modal panel, read aloud, Stop button, can change text size and theme on request
- [x] Responsive check at 320 to 1920 px (no horizontal overflow, no hit target under 24x24)
- [x] Demo accounts UI (sign in, create account) — demo only, see 05
- [x] Hero video is a three-clip playlist (plumber, electrician, handyman) that crossfades and loops; first swapped to a plumber at work (Pexels 9890450) and the overlay lightened, with text contrast measured over the footage in both themes (2026-09-14)
- [x] Blueprint Stage A (2026-09-30): high contrast as a third display setting; header rebuilt (labelled settings in the bar, a Display panel on narrow screens, layout steps in ems); new pages /how-it-works, /trust, /accessibility, /about; home page gains five steps, staged jobs (planned), paying and problems, and questions. See 00-blueprint-gap-plan.md
- [x] App architecture restructured (2026-09-14): feature folders, server components by default, CSS split by owner. Layout and rules: `PROJECT-CONTEXT.md` section 12

## Checklist

### Approve what exists
- [ ] Landing page visually approved by Intisar (the phase gate from `.claude/prompt.md`)
- [x] All work committed and pushed to github.com/intisarshahoud-wq/passionateTasker (commit d09adbf, 2026-09-14)
- [ ] Logo final (`logo-design` skill)

### Design system
- [ ] One design-system reference: tokens, type scale, spacing, radius, shadows, focus styles
- [ ] Component states documented: default, hover, focus, pressed, disabled, loading, error
- [ ] Light companion theme becomes the default for app surfaces (job posting, dashboard, messages) — long reading and typing on dark causes halation for astigmatism

### Screens for the core loop (customer)
- [ ] Post a job: review the structured post, edit any field, confirm
- [ ] Matches shortlist: 3 to 5 tradespeople, trust signals visible without a tap
- [ ] Tradesperson profile: verification badges, reviews, insurance, response time
- [ ] Messaging
- [ ] Booking confirmation
- [ ] My jobs dashboard with job status

### Screens for the core loop (tradesperson)
- [ ] Lead inbox
- [ ] Lead detail with a quick voice reply
- [ ] Profile and verification status (pending, verified, rejected, expired)
- [ ] Onboarding: trades, service area, documents upload

### Every screen also needs
- [ ] Empty state, loading state, error state, offline state
- [ ] "No tradespeople in your area yet" state
- [ ] Works in both themes and at larger text size
- [ ] Passes the `ui-ux-design` checklist (trust signals visible, contrast, keyboard-only pass, first-time-use check)

### Legal and trust pages
- [ ] Privacy policy
- [ ] Terms of use
- [ ] Cookie notice (only if non-essential cookies are used)
- [x] Accessibility statement (/accessibility: what works, the standard, how we test, known limitations, contact route)

## Done when

Every screen in the core loop is designed for both customer and tradesperson,
in both themes and at larger text, with every state covered, and each one
passes the `ui-ux-design` checklist.
