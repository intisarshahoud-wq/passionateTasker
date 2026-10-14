# 06 — API design and verification

**Status:** Not started
**Depends on:** 03
**Why it matters:** every API route is a public door. Anyone on the internet can
call it directly with any input, without going through our pages. A route that
trusts the browser is an open route.

## The rules every route follows

1. **Validate every input on the server** against a schema (for example zod). Anything from the browser is untrusted, including hidden fields and IDs.
2. **Authentication:** unless the route is deliberately public, reject callers without a valid session.
3. **Authorisation:** check the caller owns or is allowed to see the specific record. Changing `/api/jobs/123` to `/api/jobs/124` must not show someone else's job. (This bug is called IDOR and is very common.)
4. **Rate limit**, and limit hardest on sign-in, waitlist and every AI route.
5. **Limit request size.**
6. **Same error format everywhere**, with no stack traces, SQL or internal details.
7. **Return only the fields the caller needs.** Never send back a whole database row.

## Route inventory

Fill this in as routes are built. A route is not finished until every column is filled in.

| Route | Method | Public or needs sign-in? | Who can call it | Rate limit | Tests written |
|---|---|---|---|---|---|
| `/api/waitlist` | POST | Public | Anyone | Tight, per IP | [ ] |
| `/api/jobs` | POST | Signed in | Verified customers | Per user | [ ] |
| `/api/jobs/[id]` | GET | Signed in | Job owner, matched tradespeople | Per user | [ ] |
| `/api/structure-job` | POST | **DECISION:** public for the hero demo, or signed in only | — | Tight: it costs money | [ ] |
| `/api/messages` | POST | Signed in | The two parties on the job | Per user | [ ] |

## Checklist

### Every route
- [ ] Schema validation
- [ ] Session check (unless deliberately public, and the reason written down)
- [ ] Ownership or role check
- [ ] Rate limit
- [ ] Tests for: valid request, invalid input, not signed in, signed in as the **wrong** user

### Internal routes must not be public
- [ ] Admin routes check the admin role on the server, and are not hidden only by leaving them off the menu
- [ ] No debug, test or seed routes in production
- [ ] Scheduled or background job routes protected by a secret header, not left open

### Third-party APIs we call
- [ ] Claude: timeout, retry once, fall back to the keyword match, spending cap
- [ ] postcodes.io (or chosen postcode lookup): timeout and a friendly message when it is down
- [ ] Email provider: failures logged and retried, never shown to the user as a crash
- [ ] Later, payments: verify the signature on every webhook before trusting it

## Done when

Every route in the inventory has all columns filled in and its four tests
passing, and a signed-in test user cannot read or change another user's data
through any route.
