# 02 — Services

**Status:** In progress (catalogue, pages and booking prototype built 2026-09-14)
**Depends on:** 01 for page designs, 04 for storing demand and service areas
**Why it matters:** services are what a visitor is actually shopping for. Clear
trades, clear prices and clear coverage are what turn a visit into a job post.

## Done so far

- [x] Eight categories as mock data in `src/data/marketplace.ts`
- [x] Three marked live (plumbing, electrical, handyman), five marked "coming soon"
- [x] Popular jobs with from-price and typical duration (mock prices)
- [x] Keyword category guess in `structureJob()` (`src/features/job-post/structure-job.ts`)
- [x] Catalogue expanded to nine categories and 47 jobs in `src/data/services.ts`, at Intisar's request
- [x] Landing service browser (tabs, job chips, feature card)
- [x] Four-step booking flow prototype with sample taskers, preview-only confirmation

## Checklist

### Pages
- [x] Category pages at `/services/[category]`, plus `/services` listing every category
- [x] Each category page: its jobs, price anchors and what is included
- [ ] FAQs on each category page
- [ ] **DECISION:** which of the nine categories go live first at launch
- [ ] Popular job detail pages
- [x] Per-page metadata and structured data for search engines (titles, descriptions, canonical links, Service and BreadcrumbList data; no prices until they are real)

### Content and pricing
- [ ] Replace mock prices with researched UK rates, and say they are indicative
- [ ] Decide what each "from" price means (per hour, per job, call-out fee)
- [ ] **DECISION:** which postcodes or areas are covered at launch

### Legal requirements per trade (UK)
- [ ] Electrical: registration with a competent person scheme (for example NICEIC or NAPIT) required for notifiable work
- [x] (Plumbing pages now say gas work is not offered yet.) **Gas work needs Gas Safe registration by law.** The assistant suggests "My boiler has no hot water" and files it under plumbing. Decide: either require Gas Safe for any tradesperson taking boiler jobs, or route boiler and gas jobs to "not covered yet" at launch
- [ ] Handyman: define what is out of scope (no electrical or gas work)
- [ ] Record per trade which documents a tradesperson must upload (feeds 05)

### Matching v1
- [ ] Rules: category, distance from postcode, availability, rating
- [ ] Always show a shortlist of 3, never a long list
- [ ] Urgency: "same day" jobs go to tradespeople who accept same-day work
- [ ] Replace the keyword category guess with a server-side Claude call (see 03), keeping the keyword match as the fallback

### Demand capture
- [ ] When someone asks for a "coming soon" trade, record it (search, chat and waitlist) so the next trade to open is chosen by real demand

## Done when

The three launch trades each have a real page with honest prices and coverage,
matching returns a shortlist of 3 for a real postcode, and every trade's legal
registration requirement is written down and enforced at onboarding.
