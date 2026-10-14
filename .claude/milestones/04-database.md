# 04 — Database design

**Status:** Blocked
**Depends on:** 03 (which database)
**Why it matters:** the schema decides what the product can and cannot do, and
it holds sensitive personal data: home addresses, identity documents, DBS
results.

## Tables (first draft)

| Table | Holds | Sensitive? |
|---|---|---|
| `waitlist` | email, postcode, role, created date | Yes: email |
| `users` / `profiles` | name, email, role (customer, tradesperson, admin) | Yes |
| `trade_categories` | slug, name, live or coming soon | No |
| `tradesperson_profiles` | trades, service area, availability, rating | Some |
| `verification_documents` | ID, DBS, insurance, trade registration, with status and expiry date | **Highly sensitive** |
| `jobs` | the customer's own words, structured fields, priority, postcode, status | Yes: location |
| `job_matches` | job, tradesperson, rank, status | No |
| `messages` | job, sender, body, timestamps | Yes |
| `reviews` | job, rating, text; allowed only after both sides mark the job complete | Some |
| `demand_requests` | requested "coming soon" trade and postcode | Low |

## Checklist

### Design
- [ ] Draw the schema diagram: tables, relationships, which table owns what
- [ ] Status fields as fixed value sets (enums), not free text
- [ ] Foreign keys and NOT NULL constraints on everything that must exist
- [ ] Indexes for the queries that actually run (jobs by postcode and category, messages by job)
- [ ] Location: postcode to latitude and longitude for distance matching (the free postcodes.io API does this for UK postcodes)
- [ ] List every column that holds personal data, and how long each is kept

### Access rules
- [ ] Customers can read only their own jobs and messages
- [ ] Tradespeople can read only jobs they have been matched to
- [ ] Nobody but admins can read verification documents
- [ ] If Supabase: Row Level Security switched on for **every** table, with a policy per table. A table without RLS is readable by anyone who has the public key.

### Workflow
- [ ] Migrations kept in the repo, never hand-edited in a dashboard
- [ ] Seed data built from `src/data/marketplace.ts`
- [ ] Separate database for local, preview and production (never test against real users' data)
- [ ] Automatic backups on, and one restore actually tested

### Privacy (UK GDPR)
- [ ] Delete account removes or anonymises that user's personal data
- [ ] Retention rules, for example rejected verification documents deleted after N days
- [ ] Export my data (right of access)

## Done when

The schema is migrated on preview, every table has access rules and at least one
test proving another user cannot read someone else's data, and a backup restore
has worked once.
