
# Library Card Finder — Build Plan

A modern civic-tech web app that helps people discover which public library cards they're eligible for, what each card unlocks (Kanopy, Hoopla, Libby, etc.), and where to apply. CA-first, architected to scale to all 50 states.

## Scope of this build

Full vision in one pass, with a clear honest line on what's real vs. scaffolded:

- **Real & functional:** survey flow, eligibility engine, results dashboard, library detail pages, favorites & compare, SEO landing pages, admin dashboard (CRUD), auth, 12 seeded CA library systems with verified eligibility + benefits.
- **Scaffolded for later:** scraping pipeline (architecture + admin trigger UI + a stub server function — real Playwright scraping needs a separate Node worker, which the edge runtime can't host). AI summarization hook is wired but off by default.

## Design direction — "Civic Trust"

- Palette: navy `#0f1b3d`, deep blue `#1e3a5f`, mid blue `#3b6fa0`, paper `#e8edf3`, white background. Accent emerald for "eligible" states.
- Typography: Inter (body) + Instrument Serif (display) for a Gov.uk-meets-fintech feel.
- Generous whitespace, soft shadows, 12px radius, subtle motion (Framer Motion fades + slide-ups).
- Dark mode supported via tokens.
- Mobile-first, fully accessible (WCAG AA, keyboard nav, focus states, reduced-motion).

## User flows

### 1. Landing `/`
- Hero: "Find every library card you're eligible for." Search/CTA → starts survey.
- Trust strip: "12 California systems · 40+ digital benefits tracked · Updated monthly".
- Featured benefits row (Kanopy, Hoopla, Libby, LinkedIn Learning, NYT, museum passes).
- "How it works" (3 steps), popular SEO links, FAQ.

### 2. Survey `/get-started`
Card-based, one question per step, progress bar, back/forward, mobile-first.
Steps: state → county → city (optional) → status flags (student / educator / veteran / senior) → property in another county? → email (optional, to save results).
State stored in URL search params so results are shareable.

### 3. Results `/results`
Grouped sections, collapsible:
- ✅ Eligible now (online signup)
- 🏛 Eligible with in-person visit
- 📱 Limited digital access (e-card only)
- 💳 Non-resident paid card
- 🤝 Reciprocal / potentially eligible

Each result card: library name, jurisdiction, eligibility summary, benefit icon row, "Apply online" CTA, "Details", favorite ⭐, "Add to compare".
Filters: benefit (Kanopy / Hoopla / Libby / LinkedIn Learning / museum passes / etc.), online-signup-only, free-only, sort by benefit count.
Sticky compare bar appears when 2-4 selected → `/compare`.

### 4. Library detail `/library/$slug`
Hero with library name, jurisdiction, eligibility badge, apply CTA.
Sections: Eligibility rules, Benefits grid (with per-service limits like "Kanopy: 10 plays/month"), Reciprocity, Fees, Hours/branches link out, Last verified date + confidence score, "Suggest a correction" form.
SSR with route-specific `head()` for SEO + JSON-LD `LocalBusiness` / `Library`.

### 5. Compare `/compare?ids=...`
Side-by-side table of up to 4 libraries across eligibility, fees, and each benefit.

### 6. Favorites `/favorites` (auth required)
Saved libraries list.

### 7. SEO landing pages
Static routes generated for high-intent queries:
- `/best/california-library-cards`
- `/best/libraries-with-kanopy`
- `/best/libraries-with-linkedin-learning`
- `/best/non-resident-library-cards`
- `/best/free-museum-passes`
Each uses real DB data filtered server-side, with unique title/description/og tags and FAQ schema.

### 8. Admin `/admin` (role-gated)
- Library list with confidence score, last-verified, status.
- Edit library (eligibility rules, benefits, fees, links).
- Suggested corrections inbox (from public form).
- "Run verification" button → triggers stub scraping job, logs result.

## Data model (Lovable Cloud / Postgres)

```text
states(id, code, name)
counties(id, state_id, name, fips)
cities(id, county_id, name)

library_systems(
  id, slug, name, jurisdiction_type, -- 'city'|'county'|'consortium'|'state'
  primary_state_id, primary_county_id,
  website, apply_url, online_signup, fee_cents, fee_notes,
  description, last_verified_at, confidence_score, created_at, updated_at
)

eligibility_rules(
  id, library_system_id,
  rule_type, -- 'resident_of_county'|'resident_of_city'|'resident_of_state'|'us_resident'|'property_owner'|'student'|'educator'|'employee'|'reciprocal'
  scope_state_id, scope_county_id, scope_city_id,
  requires_in_person, paid, fee_cents, notes
)

benefits(id, slug, name, category, icon, description)
-- categories: streaming, ebooks, audiobooks, learning, news, museum, languages, career, makerspace

library_benefits(
  library_system_id, benefit_id,
  limit_text, -- e.g. "10 plays/month"
  notes,
  PRIMARY KEY(library_system_id, benefit_id)
)

reciprocity(library_system_id, reciprocal_with_id, notes)

profiles(id, email, display_name, role) -- role via separate user_roles table
user_roles(user_id, role) -- 'admin'|'user', SECURITY DEFINER has_role()
favorites(user_id, library_system_id, created_at)
suggested_corrections(id, library_system_id, submitter_email, field, suggested_value, status, created_at)
scrape_jobs(id, library_system_id, status, started_at, finished_at, diff_json, error)
```

RLS: public read on libraries/eligibility/benefits/reciprocity. `favorites` and `suggested_corrections` user-scoped. Admin tables gated by `has_role(auth.uid(),'admin')`.

## Eligibility engine

A pure TS module `src/lib/eligibility.ts` (called by a `createServerFn`) takes the survey answers and returns each library bucketed into one of the 5 categories above. Rules are evaluated in priority order; reciprocity expanded transitively one hop. Pure function = trivially testable and reusable when we add states.

## Seeded California data (12 systems)

LAPL, LA County, SFPL, Oakland, Berkeley, Pasadena, San Diego, San Jose, Santa Clara County, Sacramento, Contra Costa County, Alameda County — each with real eligibility rules, fees (where applicable for non-residents), and benefit mapping (Kanopy, Hoopla, Libby/OverDrive, LinkedIn Learning, Mango, NYT, Consumer Reports, museum passes where offered).

## Scraping architecture (scaffold + honest note)

- DB schema for `scrape_jobs` and admin trigger UI shipped now.
- Server function stub that records a job and returns "manual verification required."
- Real Playwright/Cheerio worker requires a separate Node host (Render/Fly/Railway cron) — out of scope for the edge runtime; documented in `/docs/scraping.md`.

## Tech notes

- TanStack Start (already in project) + TS + Tailwind v4 + shadcn/ui + Framer Motion + Lucide icons.
- Lovable Cloud for Postgres, auth (email + Google), RLS, server functions.
- Server functions for all DB reads (typed RPC); browser Supabase client only for auth/session.
- Per-route `head()` for SEO; JSON-LD on detail and SEO pages; sitemap server route.
- Monetization, premium tools, API access, newsletter — schema-friendly but no UI in MVP.

## Deliverables checklist

- [ ] Design tokens + Civic Trust theme in `src/styles.css`
- [ ] Shared layout (header/footer) in `__root.tsx`
- [ ] Routes: `/`, `/get-started`, `/results`, `/library/$slug`, `/compare`, `/favorites`, `/login`, `/admin`, 5 SEO pages, `/api/sitemap.xml`
- [ ] DB migrations + RLS + `has_role` function
- [ ] Seed 12 CA systems with eligibility + benefits
- [ ] Eligibility engine + server functions
- [ ] Survey, results, detail, compare, favorites UIs
- [ ] Admin CRUD + corrections inbox + scrape-job stub
- [ ] Auth (email + Google) with `_authenticated` layout
- [ ] SEO meta + JSON-LD on detail and SEO pages
- [ ] Dark mode toggle
- [ ] README + `/docs/scraping.md`

## Out of scope for this pass

- Real headless-browser scraping (needs external worker)
- Other 49 states (schema ready, data not seeded)
- Payments, newsletter, public API
- AI summarization (hook only)

Approve and I'll build it.
