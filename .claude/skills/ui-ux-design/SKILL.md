---
description: Guide UI/UX design decisions for Passionate Taskers (AI trades marketplace) — user psychology, high-end branding, and premium visual design, always filtered through the accessibility-first requirement for blind and elderly users.
triggers: ["ui", "ux", "design", "branding", "layout", "wireframe", "color palette", "typography", "component", "screen", "onboarding", "landing page", "homepage", "logo"]
---

# UI/UX Design Guide — Passionate Taskers

Every design decision on this project answers to two users and two non-negotiables. Start here before proposing colors, layouts, or copy.

**The two users:** a customer under some degree of stress hiring a stranger into their home, and a tradesperson trying to win the job fast without wasting time on a bad-fit lead.

**The two non-negotiables:** blind/screen-reader users and elderly users must be able to use every screen — not as an add-on pass at the end, but as a constraint on the first draft. (Full accessibility decisions already agreed for this project — WCAG 2.2 AA floor, React Aria Components, Next.js + Tailwind — live in project memory; don't relitigate the stack, just apply it.)

## User psychology for a trades marketplace

- **Trust beats aesthetics.** The core anxiety is "is this person safe to let into my home." Verification badges, review counts, response time, and insurance/qualification info need to be visible without digging — never buried behind a tap. A beautiful screen that hides trust signals loses to an ugly one that surfaces them.
- **Urgency should reduce cognitive load, not add to it.** For emergency call-outs (burst pipe, no heat), cut steps aggressively — the more stressed the user, the fewer decisions the UI should ask of them at once.
- **Cap visible choices at 3–5.** Decision paralysis is real when comparing tradespeople. Show a short, ranked shortlist prominently (ties to the AI Quote Comparison feature); put the full list behind progressive disclosure, not the first screen.
- **Elderly users reward familiarity over novelty.** Use established web patterns — obvious labeled buttons, visible navigation, no gesture-only or hover-only interactions. A clever new pattern that needs to be learned is a bug for this audience, not a feature.

## High-end branding without sacrificing accessibility

- "Premium" here means **trustworthy and calm**, not flashy. Generous white space, real photography of real trades work over stock or illustration, consistent iconography — restraint reads as competence.
- Pick an accent color that passes WCAG AAA on white *and* still looks considered — lean toward deeper, confident saturated tones rather than a primary-color palette. High contrast and premium are not in tension; a washed-out pastel palette actually fails both.
- Typography: one distinct-but-legible display face for brand moments, paired with a body face proven to hold up at 200% browser zoom and under screen-reader/large-text settings. No body text under 16px, no ultra-thin weights.

## Before shipping any screen — checklist

1. Wireframe with the trust signals and the primary action visibly dominant.
2. Contrast check (WCAG AAA target for body text where feasible, AA floor everywhere).
3. Keyboard-only pass — every action reachable and operable without a mouse.
4. Elderly "first-time use" sanity check — would a non-technical 70-year-old know what to tap without instruction?

Related built-in skills worth invoking alongside this one when relevant: `artifact-design` for any interactive prototype/mockup built as an Artifact, `dataviz` for any chart or dashboard (e.g. a tradesperson's earnings/job-tracker view).
