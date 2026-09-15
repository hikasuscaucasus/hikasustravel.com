/**
 * Generate the Cloudflare redirect configuration for every legacy URL.
 *
 * GitHub Pages cannot issue a 301. prerender.js therefore ships each old URL as
 * a stub page carrying `noindex, follow`, a canonical pointing at the new
 * location and a meta-refresh. That works, but it costs a render, passes less
 * signal than a real redirect, and every stub is a page Google must fetch.
 *
 * Cloudflare already fronts the origin, so the redirects belong there. This
 * script emits two interchangeable forms of the same rules, because which one
 * you can use depends on the Cloudflare plan:
 *
 *   1. cloudflare-bulk-redirects.csv — one row per URL. Bulk Redirects are
 *      available on every plan, including Free. Verbose but universal.
 *   2. cloudflare-single-redirect-rules.md — the same coverage expressed as a
 *      handful of regex Redirect Rules. Far smaller, but `matches` (regex) is
 *      not available on the Free plan.
 *
 * Both are generated from places.js/tours.js, so they cannot drift from the
 * routes the build actually emits. Re-run after adding or renaming a route:
 *   node scripts/generate-redirects.js
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = (p) => pathToFileURL(join(__dirname, '..', 'src', p)).href

/**
 * `--check` mode: verify the committed redirect config still matches what this
 * generator would produce, WITHOUT rewriting it. The build runs this so the
 * Cloudflare list cannot silently drift out of sync with the route table — the
 * failure mode it guards against is a page being renamed or re-parented and the
 * legacy URL quietly losing its redirect.
 *
 * ⚠️ Comparison is LINE-ENDING NORMALISED on purpose. `core.autocrlf=true` gives
 * a CRLF working tree on Windows while this script (and CI on Linux) writes LF,
 * so a byte comparison would fail on every developer machine and pass in CI —
 * the worst possible split. Content is what matters here.
 */
const CHECK = process.argv.includes('--check')
const drift = []
const norm = (s) => s.replace(/\r\n/g, '\n')

function emit(file, content) {
  const path = join(OUT, file)
  if (!CHECK) { writeFileSync(path, content, 'utf-8'); return }
  if (!existsSync(path)) { drift.push(`${file} — missing`); return }
  if (norm(readFileSync(path, 'utf-8')) !== norm(content)) drift.push(`${file} — out of date`)
}

const { legacyRedirects, publishedDestinationPages } = await import(src('data/places.js'))
const { publishedBorderPages } = await import(src('data/borders.js'))
const { entityTourPages } = await import(src('data/entityTours.js'))
const { tours } = await import(src('data/tours.js'))

const SITE = 'https://www.hikasustravel.com'
const LANGS = ['en', 'es', 'fr', 'de', 'pl', 'cs', 'nl']
const OUT = join(__dirname, '..', 'docs', 'redirects')

const clean = (p) => String(p).replace(/^\/+|\/+$/g, '')

// ---------------------------------------------------------------------------
// 1. The full per-locale pair list (the same set prerender.js writes stubs for)
// ---------------------------------------------------------------------------
const pairs = legacyRedirects().map(({ from, to }) => ({ from: clean(from), to: clean(to) }))
for (const t of tours) {
  const prefix = t.type === 'group' ? 'group-tours' : 'private-tours'
  const formers = [...(t.formerSlug ? [t.formerSlug] : []), ...(t.formerSlugs || [])]
  for (const f of formers) pairs.push({ from: `${prefix}/${f}`, to: `${prefix}/${t.slug}` })
}

// ---------------------------------------------------------------------------
// 2. Pattern families — collapse what is genuinely mechanical, list the rest
//
// A family only earns a regex rule if EVERY pair it matches is reproduced
// exactly by the rewrite. `covers` proves that pair-by-pair below; anything
// that fails falls through to the residual list rather than being assumed.
// ---------------------------------------------------------------------------
// ORDER IS SIGNIFICANT. `destinations/cities/<slug>` flattens to
// `georgia/<slug>`, so it must be evaluated before the generic
// `destinations/*` -> `georgia/*` rule, which would otherwise rewrite it to
// `georgia/cities/<slug>` — a 404. simulate() below proves the ordering holds.
const FAMILIES = [
  {
    id: 'destinations-cities',
    note: 'The old /destinations/cities/<slug> pages flattened to /georgia/<slug> '
        + '(the /cities segment was dropped, unlike the rest of the tree).',
    test: (from) => /^destinations\/cities\/[^/]+$/.test(from),
    rewrite: (from) => `georgia/${from.split('/')[2]}`,
    pathRegex: '^/([a-z]{2})/destinations/cities/([^/]+)/?$',
    replacement: '/${1}/georgia/${2}/',
  },
  {
    id: 'destinations-tree',
    note: 'The rest of the old /destinations tree moved to /georgia with its suffix intact. '
        + 'Must be ordered AFTER destinations-cities, which it would otherwise swallow.',
    // /destinations, /destinations/x, /destinations/regions/x
    test: (from) => from === 'destinations' || from.startsWith('destinations/'),
    rewrite: (from) => from.replace(/^destinations/, 'georgia'),
    pathRegex: '^/([a-z]{2})/destinations(/.*)?/?$',
    replacement: '/${1}/georgia${2}/',
  },
  {
    id: 'flat-things-to-do',
    note: 'Flat /things-to-do-in-<slug> moved under its destination.',
    test: (from) => /^things-to-do-in-[a-z0-9-]+$/.test(from),
    rewrite: (from) => {
      const slug = from.replace('things-to-do-in-', '')
      return `georgia/${slug}/things-to-do-in-${slug}`
    },
    pathRegex: '^/([a-z]{2})/things-to-do-in-([a-z0-9-]+)/?$',
    replacement: '/${1}/georgia/${2}/things-to-do-in-${2}/',
  },
  {
    id: 'region-scoped-sites',
    note: 'Sites once nested under /georgia/regions/<region>/ now sit at /georgia/<parent>/. '
        + 'Only 3-segment paths match, so the /georgia/regions/<region> landing pages are untouched.',
    test: (from) => /^georgia\/regions\/[^/]+\/[^/]+$/.test(from),
    rewrite: (from) => from.replace(/^georgia\/regions\//, 'georgia/'),
    pathRegex: '^/([a-z]{2})/georgia/regions/([^/]+)/([^/]+)/?$',
    replacement: '/${1}/georgia/${2}/${3}/',
  },
]

// Every route the build actually publishes — the set no rule may ever match.
const livePaths = [
  '', 'about-us', 'about-georgia', 'about-armenia', 'about-azerbaijan', 'georgian-lari-currency-guide',
  'georgia-visa-entry-requirements', 'armenia-visa-entry-requirements',
  'azerbaijan-visa-entry-requirements',
  'languages-of-georgia', 'kutaisi-international-airport',
  'tbilisi-international-airport', 'tbilisi-metro', 'tbilisi-railway-station', 'abkhazia',
  'georgia', 'georgia/regions', 'georgia/cities', 'georgia/places-to-visit',
  'private-tours', 'group-tours', 'shuttle-service', 'embassies', 'embassies/georgia', 'embassies/armenia',
  'embassies/azerbaijan', 'blog', 'faq',
  'contact', 'privacy-policy', 'terms-and-conditions',
  ...publishedDestinationPages().map((d) => clean(d.path)),
  ...publishedBorderPages().map((b) => clean(b.path)),
  ...entityTourPages.map((e) => clean(e.path)),
  ...tours.map((t) => `${t.type === 'group' ? 'group-tours' : 'private-tours'}/${t.slug}`),
]

const residual = []
const covered = new Map(FAMILIES.map((f) => [f.id, []]))
for (const pair of pairs) {
  const fam = FAMILIES.find((f) => f.test(pair.from))
  // A family claims the pair only if its rewrite reproduces the real target.
  if (fam && fam.rewrite(pair.from) === pair.to) covered.get(fam.id).push(pair)
  else residual.push(pair)
}

// ---------------------------------------------------------------------------
// 2b. Simulate the regex rules before emitting them.
//
// A redirect rule that over-matches is worse than no rule at all: it would
// 301 a live page to a 404. So run the exact expressions, in order, against
// both the legacy paths (must rewrite to the right target) and every currently
// published route (must not match at all).
// ---------------------------------------------------------------------------
// Cloudflare evaluates Redirect Rules top-down and stops at the first match, so
// the 91 exact one-off rules must sit ABOVE the pattern rules. 21 region-scoped
// sites changed parent at the same time as they moved out of /regions/ (e.g.
// /georgia/regions/svaneti/shkhara-glacier -> /georgia/ushguli/shkhara-glacier);
// the pattern rule alone would only strip /regions/ and land on a URL that
// itself redirects. Exact-first resolves each in a single hop.
function simulate(path) {
  const exact = residualByPath.get(path)
  if (exact) return { id: 'exact', out: exact }
  for (const fam of FAMILIES) {
    const m = path.match(new RegExp(fam.pathRegex))
    if (!m) continue
    // Cloudflare's ${n} placeholders; an unmatched optional group is empty.
    return { id: fam.id, out: fam.replacement.replace(/\$\{(\d+)\}/g, (_, i) => m[Number(i)] ?? '') }
  }
  return null
}

const residualByPath = new Map()
for (const lang of LANGS) {
  for (const { from, to } of residual) residualByPath.set(`/${lang}/${from}`, `/${lang}/${to}/`)
}

const simFailures = []
for (const lang of LANGS) {
  // 1. every legacy path — pattern-covered or exact — must reach its real target
  for (const { from, to } of pairs) {
    const r = simulate(`/${lang}/${from}`)
    const want = `/${lang}/${to}/`
    if (!r) simFailures.push(`UNCOVERED ${lang}/${from}`)
    else if (r.out !== want) {
      simFailures.push(`MIS-REWRITE ${lang}/${from}: rule ${r.id} sends it to ${r.out}, correct target is ${want}`)
    }
  }
  // 2. no live, published route may match any rule
  for (const live of livePaths) {
    const r = simulate(`/${lang}/${live}`)
    if (r) simFailures.push(`LIVE PAGE CAUGHT ${lang}/${live}: rule ${r.id} would 301 it to ${r.out}`)
  }
}
if (simFailures.length) {
  simFailures.slice(0, 20).forEach((f) => console.error('  ' + f))
  // Throw rather than exit: nothing is written, and a non-zero exit with the
  // reason attached is what a build step should surface.
  throw new Error(`Refusing to write redirect config — ${simFailures.length} simulation failures (first 20 above)`)
}
console.log(`simulation: ${FAMILIES.length} regex rules verified against `
  + `${(pairs.length + livePaths.length) * LANGS.length} paths (legacy + live) — no mis-rewrites\n`)

// ---------------------------------------------------------------------------
// 3. Emit
// ---------------------------------------------------------------------------
if (!CHECK) mkdirSync(OUT, { recursive: true })

const csv = ['source,target,status,preserve_query_string']
for (const lang of LANGS) {
  for (const { from, to } of pairs) {
    csv.push(`${SITE}/${lang}/${from}/,${SITE}/${lang}/${to}/,301,true`)
  }
}
emit('cloudflare-bulk-redirects.csv', csv.join('\n') + '\n')

const md = []
md.push('# Cloudflare redirects for legacy URLs', '')
md.push('Generated by `scripts/generate-redirects.js` — do not hand-edit; re-run it instead.', '')
md.push(`Covers **${pairs.length} legacy paths x ${LANGS.length} locales = ${pairs.length * LANGS.length} URLs**, `
  + 'the same set `prerender.js` currently ships as `noindex, follow` meta-refresh stubs.', '')
md.push('Applying these lets you delete nothing — the stubs stay as a harmless fallback for', 'anything that bypasses the edge — but Google will follow a real 301 instead.', '')
md.push('## Option A — Bulk Redirects (recommended; every plan)', '')
md.push('Use `cloudflare-bulk-redirects.csv` in this folder: **Bulk Redirects -> Create a new list**',
  '-> upload the CSV, then create a Bulk Redirect Rule that references the list.',
  `It holds all ${pairs.length * LANGS.length} URLs explicitly, so it needs no regex support, has no`,
  'ordering hazards, and resolves every legacy URL in a single hop.', '')
md.push('## Option B — Single Redirect Rules (fewer rules, needs regex)', '')
md.push(`Collapses the same coverage into ${FAMILIES.length} pattern rules plus ${residual.length} exact rules.`,
  'Smaller, but the `matches` operator is not available on the Free plan, and rule-count limits',
  'vary by plan — check yours before choosing this. Create each under',
  '**Rules -> Redirect Rules -> Create rule**, response **301 (Permanent)**, *Preserve query string* on.', '')
md.push('> **Order is load-bearing. Put all exact rules ABOVE the pattern rules.**',
  '> Cloudflare stops at the first matching rule. 21 of the region-scoped sites changed parent',
  '> at the same time as they left `/regions/` (e.g. `/georgia/regions/svaneti/shkhara-glacier`',
  '> now lives at `/georgia/ushguli/shkhara-glacier`); the pattern rule alone would only strip',
  '> `/regions/` and land on a URL that itself redirects. Likewise `destinations-cities` must',
  '> precede `destinations-tree`, which would otherwise keep the `/cities` segment and 404.',
  '>',
  '> `scripts/generate-redirects.js` refuses to write this file unless a simulation of the rules,',
  `> in this order, rewrites all ${pairs.length * LANGS.length} legacy URLs correctly **and** matches none of the`,
  `> ${livePaths.length * LANGS.length} live published URLs.`, '')
for (const fam of FAMILIES) {
  const n = covered.get(fam.id).length
  md.push(`### ${fam.id} — ${n} paths x ${LANGS.length} locales = ${n * LANGS.length} URLs`, '')
  md.push(fam.note, '')
  md.push('```', 'When incoming requests match:',
    `  (http.host eq "www.hikasustravel.com" and http.request.uri.path matches "${fam.pathRegex}")`, '',
    'Then, URL redirect to (dynamic expression):',
    `  concat("https://www.hikasustravel.com", regex_replace(http.request.uri.path, "${fam.pathRegex}", "${fam.replacement}"))`,
    '```', '')
  md.push(`<details><summary>the ${n} paths this rule replaces</summary>`, '')
  md.push('```')
  for (const p of covered.get(fam.id)) md.push(`/<lang>/${p.from}/  ->  /<lang>/${p.to}/`)
  md.push('```', '</details>', '')
}
md.push(`### exact rules — ${residual.length} paths x ${LANGS.length} locales = ${residual.length * LANGS.length} URLs (place these FIRST)`, '')
md.push('Genuine one-off re-parentings (a place moved from its region to a city, or a tour was',
  'renamed); no pattern to exploit. Each is `/<lang>/<from>/ -> /<lang>/<to>/`, repeated for all',
  `${LANGS.length} locales — or load just these as a small Bulk Redirect list and keep the ${FAMILIES.length} pattern`,
  'rules for the rest.', '')
md.push('```')
for (const p of residual) md.push(`/<lang>/${p.from}/  ->  /<lang>/${p.to}/`)
md.push('```', '')
md.push('---', '', 'Both options express identical coverage — apply one, not both.', '')
md.push('The `noindex, follow` meta-refresh stubs the build ships stay in place either way; they',
  'become a harmless fallback for anything that reaches the origin without passing the edge.', '')
emit('cloudflare-redirect-rules.md', md.join('\n'))

// ---------------------------------------------------------------------------
// 4. Report
// ---------------------------------------------------------------------------
console.log(`legacy paths per locale : ${pairs.length}   x ${LANGS.length} locales = ${pairs.length * LANGS.length} URLs`)
for (const fam of FAMILIES) {
  const n = covered.get(fam.id).length
  console.log(`  ${fam.id.padEnd(22)} ${String(n).padStart(4)} paths -> 1 regex rule  (${n * LANGS.length} URLs)`)
}
console.log(`  ${'residual (1:1)'.padEnd(22)} ${String(residual.length).padStart(4)} paths           (${residual.length * LANGS.length} URLs)`)
console.log(`\nrule count: ${FAMILIES.length} regex rules + ${residual.length} explicit  (vs ${pairs.length * LANGS.length} bulk rows)`)

if (!CHECK) {
  console.log(`\nwrote docs/redirects/cloudflare-bulk-redirects.csv  (${csv.length - 1} rows)`)
  console.log('wrote docs/redirects/cloudflare-redirect-rules.md')
} else if (drift.length) {
  console.error('\n✗ redirect config is OUT OF SYNC with the route table:')
  for (const d of drift) console.error(`    ${d}`)
  console.error('\n  A route was probably renamed or re-parented without refreshing the')
  console.error('  Cloudflare redirect list, which would leave its old URL without a 301.')
  console.error('  Fix:  node scripts/generate-redirects.js   (then commit docs/redirects/)')
  process.exit(1)
} else {
  console.log(`\n✓ redirect config in sync (${csv.length - 1} bulk rows) — nothing to regenerate`)
}
