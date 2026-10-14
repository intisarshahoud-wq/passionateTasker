# 09 — Accessibility audit

**Status:** Runs alongside every milestone. A full pass is required before launch (10).
**Depends on:** screens existing to test
**Why it matters:** accessibility is the reason this product exists. It is the
thing competitors cannot easily copy. If it fails here, the product has no edge.

## Done so far

- [x] Keyboard-operable landing page, skip link, labelled controls
- [x] Reduced motion respected everywhere, pause control on the hero video
- [x] Larger text and light mode, applied before first paint
- [x] Voice input with a typed fallback
- [x] Chat assistant: announced replies, focusable transcript, opt-in read aloud, Stop button, non-modal so the page stays usable
- [x] axe scan: zero serious issues on the landing page, /services, category pages and every booking step, in both themes (2026-09-14)
- [x] High contrast setting, also on when the device asks for more contrast (2026-09-30)
- [x] Larger-text mode no longer scrolls sideways on phones; the header steps are in ems (2026-09-30)
- [x] The search button had no accessible name on phones; fixed (2026-09-30)
- [x] `--ink-faint` fixed: it failed 4.5:1 in light mode across the site (found by that scan)

## Checklist

### Automated
- [ ] axe (or Lighthouse accessibility) on every page, with zero serious issues
- [x] Automated contrast check in every theme: axe on every page in dark, light, high contrast and high contrast + light (`npm run pages`, 2026-09-30)

### Manual, on every screen
- [ ] Keyboard only: every action reachable, focus always visible, no traps
- [ ] NVDA with Chrome or Firefox on Windows
- [ ] VoiceOver with Safari on iPhone and on Mac
- [ ] 200% browser zoom: nothing cut off or overlapping
- [ ] 400% zoom at 1280 px wide: content reflows into one column with no sideways scrolling (WCAG 1.4.10)
- [ ] Larger-text mode plus 200% zoom together
- [ ] Contrast: AA everywhere, AAA for body text where feasible
- [ ] Reduced motion switched on: nothing moves that should not

### The chat assistant specifically
- [ ] Screen reader announces each reply once, not twice
- [ ] Read aloud and a screen reader do not talk over each other
- [ ] Stop always stops, whether typed, spoken or pressed
- [ ] Assistant links scroll to the right section and focus lands somewhere sensible

### Forms and auth
- [ ] Every error is announced and says how to fix it
- [ ] No CAPTCHA puzzles; password managers and paste work (see 05)

### Real people
- [ ] First-time use by at least one elderly person who has never seen the site
- [ ] At least one blind or low-vision tester through the whole core loop
- [ ] Fix what they hit, then test again

### Publish
- [x] Accessibility statement page: /accessibility, with known limitations. The contact route waits on a real inbox (`SITE.contactEmail`)

## Done when

Automated checks are clean, every manual check passes on every core-loop screen,
real testers have completed the core loop without help, and the accessibility
statement is published.
