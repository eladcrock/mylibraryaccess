## Goal

1. Let visitors request that a new region (state/county/city) be added to the library data.
2. Ship a Privacy Policy and Security page that accurately reflect what the app actually collects and how it's protected — and link them from the footer.

## 1. Request-a-region

**New route** `src/routes/request-region.tsx`
- Form fields: region (free text, e.g. "Travis County, TX"), optional library system name, optional library website URL, optional email (so we can notify when added), optional notes. Zod-validated, trimmed, length-capped.
- Submits via a `createServerFn` that inserts into a new `region_requests` table.
- Success state thanks the user; honeypot + simple rate-limit by IP hash to deter spam.
- SEO `head()`: title "Request a library region — Library Card Finder", noindex'd is fine.

**New table** `region_requests`
- Columns (domain): region, system_name, system_url, email, notes, status (`new` | `reviewed` | `added`), source_ip_hash.
- RLS:
  - Anonymous + authenticated users: INSERT only.
  - Admins (`has_role(auth.uid(),'admin')`): SELECT / UPDATE.
  - No public SELECT (protects submitter emails).

**Entry points**
- Footer: "Request a region" link.
- Landing page: small CTA strip near the bottom — "Don't see your area? Request a region →".
- Future results page (when built) will reuse the same link in its empty state.

## 2. Privacy Policy (`/privacy`)

Written to match what the app actually does today, not boilerplate:
- What we collect: optional account email + Google profile basics on sign-in; favorites; suggested corrections; region requests (with optional email); standard server logs.
- What we don't: no ad tracking, no selling data, no third-party analytics beyond what Lovable Cloud provides for ops.
- Cookies: only auth/session cookies from Lovable Cloud.
- Third parties: Lovable Cloud (hosting + database + auth), Google (only if user signs in with Google).
- Your rights: account deletion, data export on request, contact email placeholder `privacy@librarycardfinder.app` (user can swap later).
- Children: not directed at children under 13.
- Effective date + "last updated" stamp.

## 3. Security page (`/security`)

Plain-English summary of real controls:
- Transport: HTTPS everywhere.
- Auth: email/password + Google OAuth via Lovable Cloud; sessions in httpOnly cookies; passwords never seen by us.
- Authorization: Postgres Row Level Security on every table; admin-only tables for corrections, region requests, scrape jobs.
- Data minimization: we only ask for email at signup; survey answers (county, status flags) stay client-side unless user chooses to save favorites.
- Storage: managed Postgres with encryption at rest and automatic backups via Lovable Cloud.
- Secrets: server-only API keys stored as Lovable Cloud secrets, never shipped to the browser.
- Reporting: `security@librarycardfinder.app` placeholder for responsible disclosure; we aim to acknowledge within 72h.
- What's out of scope today: no payments, no PII beyond email, no third-party trackers.

I'll also enable Lovable Cloud's leaked-password (HIBP) check during this pass since the Security page promises real password hygiene.

## 4. Footer

Update `src/components/site-footer.tsx` to a two-row layout:
- Left: copyright.
- Right: links — Request a region · Privacy · Security · Suggest a correction (when that page exists).

## Technical notes

- Migration creates `region_requests` + RLS + an `update_updated_at_column` trigger; reuses existing `app_role` enum and `has_role` function from prior auth migration.
- Server fn lives at `src/lib/region-requests.functions.ts` (client-safe path), with `.inputValidator(zodSchema.parse)` and `.handler()` doing the insert with the service-role-free anon client (RLS allows the insert).
- No business-logic changes elsewhere; eligibility engine and seed data untouched.
- All three new pages added to the future sitemap route when it lands.

## Out of scope

- Admin UI for triaging region requests (data is captured; UI ships with the broader admin dashboard).
- Email notifications to requesters (DB has the field; wiring requires a transactional email provider — flagged for a later pass).
