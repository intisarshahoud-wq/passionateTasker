# 07 — Secrets and private API keys

**Status:** Can start now. Set the rules before the first real key exists.
**Depends on:** nothing
**Why it matters:** a leaked API key is spent money, or stolen data, within
hours. Bots scan public code and websites for keys all the time.

## Where it stands now

- The site has **no secrets yet**. The chat assistant and job structuring run in the browser with no API key.
- `passionate-taskers/.gitignore` already ignores `.env*`, so env files will not be committed by accident.

## The one rule

**A secret key must never reach the browser.** Anything in the browser can be read
by anyone who opens the site: in the page source, in the JavaScript files, in
the network tab.

How that goes wrong in Next.js:

- Any environment variable whose name starts with `NEXT_PUBLIC_` is **copied into the browser JavaScript** at build time. Never put a secret in a `NEXT_PUBLIC_` variable.
- A file that reads a secret and is imported by a `"use client"` component gets bundled for the browser.

## Checklist

### Setup
- [ ] Local secrets in `.env.local` (already ignored by git)
- [ ] Commit a `.env.example` with the variable **names** only and no values. This needs a `!.env.example` line in `.gitignore`, because `.env*` currently ignores it too.
- [ ] Every module that reads a secret starts with `import "server-only";` so the build fails if a client component imports it
- [ ] Production and preview secrets set in the hosting dashboard, different from local ones

### Calling paid or private APIs
- [ ] The browser never calls Claude, email or any paid API directly. It calls our route, which checks the session, applies the rate limit, and then calls the provider.
- [ ] Spending limit set in the Anthropic console
- [ ] If Supabase: the `anon` key is public by design and is safe **only** when Row Level Security is on for every table (see 04). The `service_role` key bypasses all security. It is server-only, always.

### Check after every build
- [ ] Search the built browser files for key patterns. Nothing should be found:

  ```bash
  cd passionate-taskers
  npm run build
  grep -rE "sk-ant-|sk_live_|service_role|-----BEGIN" .next/static || echo "clean"
  ```

- [ ] Turn on GitHub secret scanning and push protection on the repo (Intisar, in the repo settings)

### If a key leaks
1. **Revoke and replace it first.** Investigate afterwards.
2. Deleting it from the code or rewriting git history does not un-leak it. Once pushed, assume it has been copied.
3. Check the provider's usage and billing for anything unexpected.

## Secret inventory

Fill in as secrets are added.

| Name | Used by | Public? | Where it is set | Last rotated |
|---|---|---|---|---|
| `ANTHROPIC_API_KEY` | job structuring, assistant (planned) | **No** | hosting env | — |
| database URL or service key | server routes | **No** | hosting env | — |
| email provider key | server routes | **No** | hosting env | — |

## Done when

Every secret is in the inventory, none has a `NEXT_PUBLIC_` name, every module
that reads one imports `server-only`, and the build search above prints "clean".
