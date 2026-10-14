# 10 — Launch

**Status:** Last
**Depends on:** 01 to 09, with 08 and 09 fully passed
**Why it matters:** launch is the moment every promise on the page becomes a
promise to a real person.

## Checklist

### Honesty check on the site's claims
- [ ] Every trust claim on the landing page is now true: ID check, DBS, trade-body verification, insurance, payment protection
- [ ] Sample reviews removed or replaced with real ones
- [ ] "3 verified tradespeople nearby" style numbers come from real data, or are removed
- [ ] Prices labelled as indicative

### Infrastructure
- [ ] Domain bought, with two-factor authentication on the registrar account
- [ ] Production environment on the chosen host (see 03), with production-only secrets (see 07)
- [ ] Error monitoring and uptime checks live
- [ ] Privacy-friendly analytics, or none
- [ ] Rollback plan: how to go back to the previous version in one step

### Legal
- [ ] Privacy policy, terms and accessibility statement published
- [ ] ICO fee checked and paid if it applies (see 08)

### Soft launch
- [ ] Open to the waitlist in one area first, not the whole country
- [ ] Enough verified tradespeople in that area to actually give a shortlist of 3
- [ ] A way for early users to report problems, and someone checking it

### Release
- [ ] Final commit made locally, authored as Intisar
- [ ] **Intisar pushes and deploys** — Claude never pushes

## Done when

Real customers in the first area can post a job and get it booked, and every
claim the site makes is true.
