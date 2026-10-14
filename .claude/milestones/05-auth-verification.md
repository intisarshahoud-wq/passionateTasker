# 05 — Auth and verification

**Status:** Blocked
**Depends on:** 03 (which auth provider), 04 (users and verification tables)
**Why it matters:** there are two kinds of verification here, and both are
promises the landing page already makes:

1. **Account verification:** the person is who they say they are, and only they can get into their account.
2. **Tradesperson verification:** the ID check, DBS check, trade-body registration and insurance shown on the landing page are actually done.

## Where it stands now

`src/features/auth/demo-auth.ts` is a **demo only**. It keeps a plain object in
localStorage: no server, no password check, no token. "Continue with Google"
opens our own clearly labelled chooser and contacts no Google service. None of
it protects anything.

The part to keep is the exported functions: `useSession()`, `register()`,
`signIn()`, `signInWithGoogle()`, `signOut()`. Every component reads the session
through `useSession()`, so swapping the implementation behind them should not
touch the UI.

## Checklist

### Replace the demo
- [ ] Real auth provider behind the same exported functions
- [ ] Delete the simulated Google chooser; use real Google sign-in through the provider
- [ ] Sessions in httpOnly, Secure, SameSite cookies. **No tokens in localStorage.**
- [ ] Every protected page and API route checks the session on the server, not only in the browser

### Account verification
- [ ] Email verification required before posting a job or replying to a lead
- [ ] **DECISION:** passwords, or passwordless (magic link or passkey). Passwordless is often easier for elderly users.
- [ ] If passwords: minimum length, check against known-breached passwords, allow paste, work with password managers
- [ ] Account recovery that cannot be used to take over someone else's account
- [ ] Rate limit and temporary lockout on sign-in attempts
- [ ] Two-factor authentication required for admin accounts

### Roles
- [ ] Roles: customer, tradesperson, admin
- [ ] Role checked on the server for every action. The browser's word is never trusted.
- [ ] A tradesperson cannot take leads until their verification status is "verified"

### Tradesperson verification (manual at MVP)
- [ ] Upload flow: photo ID, DBS certificate, public liability insurance, trade registration (NICEIC or NAPIT, Gas Safe where needed — see 02)
- [ ] Documents stored in a **private** bucket, opened only through short-lived signed links
- [ ] Admin review screen: approve, reject with a reason, or request more information
- [ ] Status: pending, verified, rejected, expired
- [ ] Expiry dates tracked, with a reminder before insurance or registration runs out, and access suspended when it does
- [ ] Record who approved each document, and when

### Accessible authentication (WCAG 2.2, 3.3.8)
- [ ] No puzzle CAPTCHAs and no "type the characters you see"
- [ ] Nothing that relies on memory or transcription alone
- [ ] Every error message says what went wrong and how to fix it, and is announced to screen readers

### Account rights
- [ ] Delete my account (UK GDPR right to erasure)
- [ ] Sign out everywhere

## Done when

The demo auth code is gone, a real account can register, verify its email, sign
in and sign out; no protected route answers without a valid session; and no
tradesperson can see a lead until an admin has verified their documents.
