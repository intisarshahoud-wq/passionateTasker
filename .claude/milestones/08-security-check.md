# 08 — Security check

**Status:** Runs alongside every milestone. A full pass is required before launch (10).
**Depends on:** nothing to start; the final pass depends on 03 to 07
**Why it matters:** this site lets strangers into people's homes and stores
identity documents and DBS results. A breach here is a safety problem, not only
a data problem.

## Checklist

### Code
- [ ] Walk through the OWASP Top 10 against the real code, one item at a time
- [ ] Run the `/security-review` skill on every branch that touches auth, API routes or uploads
- [ ] No `dangerouslySetInnerHTML` with anything a user typed (the one in `layout.tsx` is a fixed script, which is fine)
- [ ] Messages and reviews shown as plain text, never as HTML
- [ ] `npm audit` clean of high and critical issues; Dependabot turned on

### Security headers (in `next.config.ts`)
- [ ] Content-Security-Policy: allow only our own origin plus the image and video hosts actually used (Unsplash is used now)
- [ ] Strict-Transport-Security (HTTPS only)
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy: `microphone=(self)`, because voice input needs it; camera and geolocation off unless used
- [ ] frame-ancestors 'none' (stops other sites putting ours in an iframe)

### File uploads (verification documents)
- [ ] Private bucket. Never a public URL.
- [ ] Check file type and size on the server, not only in the browser
- [ ] Short-lived signed links, only for admins
- [ ] Strip photo metadata such as location from uploaded images

### Abuse and safety
- [ ] Report and block in messaging
- [ ] Rate limits on everything that sends email or costs money
- [ ] Do not show a tradesperson the customer's full address until the job is booked

### Privacy (UK GDPR)
- [ ] Privacy policy that says what we collect, why, and for how long
- [ ] Check whether the ICO data protection fee applies (most UK organisations that handle personal data must pay it)
- [ ] Data processing agreements with every provider that holds user data (hosting, database, email, Anthropic)
- [ ] Send the AI only what it needs: the job description, not names, emails or addresses
- [ ] Cookie consent, only if non-essential cookies are used

### Operations
- [ ] Error monitoring with personal data scrubbed
- [ ] Alerts for unusual traffic or unusual AI spending
- [ ] Backups on, and one restore tested (see 04)
- [ ] Two-factor authentication on every admin account, and on the hosting, database, GitHub and domain accounts

## Before launch: final pass

- [ ] Every box above ticked
- [ ] 06 and 07 marked done
- [ ] Run an automated scan against preview (for example the OWASP ZAP baseline scan)
- [ ] No open high or critical findings

## Done when

The final pass is complete, with no open high or critical findings.
