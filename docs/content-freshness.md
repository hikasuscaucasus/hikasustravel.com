# Factual freshness — standing procedure

Hikasus content carries facts that expire: border rules, visa terms, insurance
requirements, fares, train services. This is how they are kept current.

## Standing rule

Full factual audit every 90 days. Verify volatile travel facts from current
authoritative sources; update all 7 locales; preserve blog `datePublished`;
year in titles only for verified current-information pages; direct answer
first; FAQ and schema synchronized; deploy after QA without owner diff
approval.

## Where the state lives

| What | Where |
|---|---|
| Registry: tracked pages, tiers, shared facts, sources, last verified, last/next full audit | `src/data/freshness.js` |
| Report and checks | `npm run content:freshness` (`scripts/content-freshness.js`) |
| Blog publication-date snapshot | `docs/freshness/blog-dates.json` |
| Audit logs, one per run | `docs/freshness/audit-YYYY-MM-DD.md` |
| Weekly due-date check (opens an issue when due) | `.github/workflows/freshness-due.yml` |

The workflow cannot research or edit. No research agent with credentials is
connected to this repository, so the audit itself is run by a person or by a
Claude Code session using the procedure below. The workflow only says when it
is due: it compares today with `lastFullAudit + 90 days`.

## Running an audit

Ask Claude Code: "Run the Hikasus factual freshness audit from
docs/content-freshness.md." The run does this, in order:

1. `git status`, then `npm run content:freshness` — confirm the audit is due
   and read the problems list.
2. Load `src/data/freshness.js`. Research each entry in `facts` ONCE from the
   listed sources (official first; secondary sources only flag a possible
   change). Research from scratch — existing copy is not evidence.
3. For each changed fact, update every page in its `usedOn` list. Then read
   every Tier A and Tier B page and every blog in full for facts not covered
   by a shared record (prices, hours, operators, statistics, UNESCO counts).
4. Edit English, then the six translations. Same dates, amounts and legal
   conditions in every locale. FAQ answers are the single source for both the
   visible FAQ and the FAQPage schema, so editing the FAQ entry updates both.
5. Dates:
   - never change a blog `date`;
   - set a page's `lastVerified` only if it was actually re-checked;
   - set `lastChanged` only if its copy materially changed;
   - change the year in a `yearInTitle` title (H1 in `pages.json` ×7 and the
     SEO title in `seoData.source.js` ×7) only after that page was re-verified
     in the new year.
6. If a source cannot be reached, do not guess: mark it in the audit log as
   SOURCE VERIFICATION FAILED, try another authoritative source, and leave
   `lastVerified` unchanged for pages that depend on it.
7. If a changed rule makes an advertised tour impossible, treat it as critical:
   correct the tour's operational wording or flag the route to the owner.
8. `npm run build` (real production build, with `VITE_MAPBOX_TOKEN`).
9. `npm run content:freshness -- --write` — must show 0 blog dates changed
   and no year-title problems.
10. Inspect `git status` / `git diff --stat`; stage exact paths only (never
    `git add .` / `-A`); commit; `git push origin HEAD:react`; wait for the
    Pages run to succeed; verify changed pages live in all 7 locales.
11. Record the run: write `docs/freshness/audit-YYYY-MM-DD.md`, set
    `lastFullAudit` to the run date and `nextFullAudit` to that date + 90 days.

**Scheduler caveat:** GitHub runs scheduled workflows only from the
repository's default branch, which is `main`, while the site lives on `react`.
Until `.github/workflows/freshness-due.yml` is also present on `main` (it
checks out `react` itself), the weekly reminder does not fire. Until then the
due date is carried by `nextFullAudit` in the registry and by
`npm run content:freshness`.

A known rule change between audits is fixed immediately; 90 days is the
maximum interval, not a reason to wait.

## What gets a year in the title

Pages whose whole purpose is current rules: the three border-crossing guides
and the three visa and entry guides. URLs stay stable; only the title carries
the year. Evergreen pages (About pages, attractions, culture articles) never
get a year; their practical sections are audited instead.

## Writing rule for practical sections

Open each practical section with a direct one- or two-sentence answer (yes /
no / depends, the current status, the exact crossing or date), then the
detail. State effective dates of rule changes. Separate the normal rule from
live operating status.
