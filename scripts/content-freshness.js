// Factual-freshness report: `npm run content:freshness`.
//
// Reads src/data/freshness.js and reports which tracked pages are due for a
// factual review. It does NOT verify external facts — that needs a research
// run (see docs/content-freshness.md). What it does check, statically:
//   - whether the 90-day full audit is due, and which pages are overdue or
//     never verified;
//   - year-in-title pages whose H1 does not carry the year of their last
//     verification, in any of the seven locales;
//   - blog publication dates against the recorded snapshot (must never move);
//   - tracked pages/facts that no longer resolve (missing content key, blog
//     slug, tour slug, or a fact id used by a page but not defined);
//   - dated statements ("until 1 October 2026") that are now in the past.
//
// Flags:
//   --ci               exit 2 when the full audit is due (used by the workflow)
//   --within=<days>    also list pages due within N days (default 14)
//   --today=YYYY-MM-DD override "today" (for testing)
//   --snapshot-new     add blogs missing from the snapshot (never edits
//                      existing dates)
//   --write            write docs/freshness/report.{md,json}
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const imp = (p) => import(pathToFileURL(join(root, p)).href)
const { AUDIT_INTERVAL_DAYS, lastFullAudit, nextFullAudit, facts, pages } = await imp('src/data/freshness.js')
const { blogArticles, blogGuides } = await imp('src/data/blogData.js')
const { tours } = await imp('src/data/tours.js')

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n, d) => (args.find((a) => a.startsWith(`--${n}=`)) || '').split('=')[1] || d
const LANGS = ['en', 'de', 'fr', 'es', 'nl', 'cs', 'pl']
const DAY = 86400000
const today = opt('today', new Date().toISOString().slice(0, 10))
const within = Number(opt('within', 14))
const toDate = (s) => new Date(`${s}T00:00:00Z`)
const addDays = (s, n) => new Date(toDate(s).getTime() + n * DAY).toISOString().slice(0, 10)
const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / DAY)

const pagesJson = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(readFileSync(join(root, `src/i18n/locales/${l}/pages.json`), 'utf-8'))]))
const problems = []
const warn = (kind, msg) => problems.push({ kind, msg })

// ---- schedule
const expectedNext = addDays(lastFullAudit, AUDIT_INTERVAL_DAYS)
if (expectedNext !== nextFullAudit) warn('schedule', `nextFullAudit is ${nextFullAudit} but lastFullAudit + ${AUDIT_INTERVAL_DAYS} days is ${expectedNext}`)
const daysToAudit = daysBetween(today, nextFullAudit)
const auditDue = daysToAudit <= 0

// ---- per-page state
const rows = pages.map((p) => {
  const next = p.lastVerified ? addDays(p.lastVerified, AUDIT_INTERVAL_DAYS) : null
  const state = !p.lastVerified ? 'NEVER VERIFIED' : daysBetween(today, next) <= 0 ? 'OVERDUE' : daysBetween(today, next) <= within ? 'DUE SOON' : 'OK'
  return { ...p, nextReview: next, state }
})

// ---- resolution checks
const blogSlugs = new Set(blogArticles.map((a) => a.slug))
const tourSlugs = new Set(tours.map((t) => t.slug))
for (const p of pages) {
  if (p.id.startsWith('blog:')) { if (!blogSlugs.has(p.id.slice(5))) warn('missing', `${p.id}: no such blog article`) }
  else if (p.id.startsWith('tour:')) { if (!tourSlugs.has(p.id.slice(5))) warn('missing', `${p.id}: no such tour`) }
  else if (p.id.startsWith('data:')) { /* data files, not pages.json keys */ }
  else if (!pagesJson.en[p.id]) warn('missing', `${p.id}: no such pages.json key`)
  for (const f of p.facts) if (!facts[f]) warn('missing', `${p.id}: unknown fact id "${f}"`)
}
for (const [id, f] of Object.entries(facts)) for (const u of f.usedOn) if (!pages.some((p) => p.id === u)) warn('missing', `fact ${id}: usedOn "${u}" is not a tracked page`)
for (const a of blogArticles) if (!pages.some((p) => p.id === `blog:${a.slug}`)) warn('untracked', `blog "${a.slug}" is published but not in the freshness registry`)

// ---- year in title: every locale's H1 must carry the year of lastVerified
for (const p of pages.filter((x) => x.yearInTitle && x.lastVerified)) {
  const year = p.lastVerified.slice(0, 4)
  for (const l of LANGS) {
    const title = pagesJson[l][p.id]?.heroTitle || ''
    const found = title.match(/\b20\d\d\b/)
    if (!found) warn('year-title', `${p.id} [${l}]: title has no year (expected ${year})`)
    else if (found[0] !== year) warn('year-title', `${p.id} [${l}]: title says ${found[0]} but the page was last verified in ${year}`)
  }
}

// ---- blog publication dates must never move
const snapDir = join(root, 'docs/freshness')
const snapFile = join(snapDir, 'blog-dates.json')
const current = Object.fromEntries([...blogArticles.map((a) => [`blog/${a.slug}`, a.date]), ...blogGuides.map((g) => [g.path.replace(/^\//, ''), g.date])])
let snapshot = existsSync(snapFile) ? JSON.parse(readFileSync(snapFile, 'utf-8')) : {}
let datesChanged = 0
for (const [k, d] of Object.entries(snapshot)) {
  if (!(k in current)) warn('blog-date', `${k}: in the snapshot but no longer published`)
  else if (current[k] !== d) { datesChanged++; warn('blog-date', `${k}: publication date changed ${d} -> ${current[k]} (must be restored)`) }
}
const newBlogs = Object.keys(current).filter((k) => !(k in snapshot))
if (flag('snapshot-new') && newBlogs.length) {
  for (const k of newBlogs) snapshot[k] = current[k]
  if (!existsSync(snapDir)) mkdirSync(snapDir, { recursive: true })
  writeFileSync(snapFile, JSON.stringify(Object.fromEntries(Object.entries(snapshot).sort()), null, 2) + '\n')
} else for (const k of newBlogs) warn('blog-date', `${k}: not in docs/freshness/blog-dates.json (run with --snapshot-new)`)

// ---- dated statements now in the past (EN copy of tracked pages + blogs)
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const dated = new RegExp(`(until|through|to|by)( at least)? (\\d{1,2}) (${MONTHS.join('|')}) (20\\d\\d)`, 'g')
const scan = (id, text) => {
  for (const m of String(text || '').replace(/<[^>]+>/g, ' ').matchAll(dated)) {
    const iso = `${m[5]}-${String(MONTHS.indexOf(m[4]) + 1).padStart(2, '0')}-${m[3].padStart(2, '0')}`
    if (iso < today) warn('stale-date', `${id}: "${m[0]}" is in the past`)
  }
}
for (const p of pages) if (pagesJson.en[p.id]) scan(p.id, JSON.stringify(pagesJson.en[p.id]))
for (const a of blogArticles) scan(`blog:${a.slug}`, a.content + JSON.stringify(a.faq || []))
for (const t of tours) scan(`tour:${t.slug}`, JSON.stringify([t.description, t.itinerary]))

// ---- report
const count = (f) => rows.filter(f).length
const summary = {
  today, lastFullAudit, nextFullAudit, daysToAudit, auditDue,
  totalTracked: rows.length,
  byTier: Object.fromEntries(['A', 'B', 'C', 'D'].map((t) => [t, count((r) => r.tier === t)])),
  overdue: count((r) => r.state === 'OVERDUE'), dueSoon: count((r) => r.state === 'DUE SOON'), neverVerified: count((r) => r.state === 'NEVER VERIFIED'),
  facts: Object.keys(facts).length, sources: new Set(Object.values(facts).flatMap((f) => f.sources)).size,
  blogPublicationDatesChanged: datesChanged, problems: problems.length,
}
const lines = []
lines.push(`# Factual freshness report — ${today}`, '')
lines.push(`- Last full audit: **${lastFullAudit}**`, `- Next full audit: **${nextFullAudit}** (${auditDue ? 'DUE NOW' : `in ${daysToAudit} days`})`,
  `- Tracked pages: ${summary.totalTracked} (A ${summary.byTier.A}, B ${summary.byTier.B}, C ${summary.byTier.C}, D ${summary.byTier.D})`,
  `- Shared facts: ${summary.facts}; source URLs: ${summary.sources}`,
  `- Overdue: ${summary.overdue}; due within ${within} days: ${summary.dueSoon}; never verified: ${summary.neverVerified}`,
  `- Blog publication dates changed: ${datesChanged}`, '')
for (const tier of ['A', 'B', 'C', 'D']) {
  lines.push(`## Tier ${tier}`, '', '| Page | Country | Type | Last verified | Next review | State |', '|---|---|---|---|---|---|')
  for (const r of rows.filter((x) => x.tier === tier).sort((a, b) => a.country.localeCompare(b.country) || a.id.localeCompare(b.id)))
    lines.push(`| ${r.id} | ${r.country} | ${r.type} | ${r.lastVerified || '—'} | ${r.nextReview || '—'} | ${r.state} |`)
  lines.push('')
}
lines.push('## Problems', '')
if (!problems.length) lines.push('None.')
for (const p of problems) lines.push(`- **${p.kind}** — ${p.msg}`)
lines.push('')
const md = lines.join('\n')
console.log(md)
if (flag('write')) {
  if (!existsSync(snapDir)) mkdirSync(snapDir, { recursive: true })
  writeFileSync(join(snapDir, 'report.md'), md)
  writeFileSync(join(snapDir, 'report.json'), JSON.stringify({ summary, pages: rows.map(({ id, path, country, type, tier, lastVerified, nextReview, state }) => ({ id, path, country, type, tier, lastVerified, nextReview, state })), problems }, null, 2) + '\n')
}
if (datesChanged) process.exit(1)
if (flag('ci') && auditDue) process.exit(2)
