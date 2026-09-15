/**
 * Query normalisation + transparent scoring for the global site search.
 *
 * Deliberately dependency-free: the index is a few hundred short records, so a
 * scored scan beats pulling in a search library (Fuse/Lunr/FlexSearch) both in
 * bytes and in how predictable the ranking is. Every rule below is one number
 * in SCORE, so result order can be reasoned about (and tuned) by reading it.
 */

// Letters that carry no combining mark and therefore survive NFD stripping.
// Folding them by hand keeps "Lodz"->"Łódź" and "Muenchen"-style queries working.
const FOLD = {
  ł: 'l', ø: 'o', đ: 'd', ð: 'd', þ: 'th', ß: 'ss', æ: 'ae', œ: 'oe', ı: 'i',
}

/**
 * Lowercase, strip accents, and flatten punctuation to single spaces, so
 * "Sighnaghi", "sighnaghi" and "SIGHNAGHI" match, and so does "Trojcy" for
 * "Trójcy" or "Swanetien" for "Swanetien". Returns '' for empty input.
 */
export function normalize(str) {
  if (!str) return ''
  return String(str)
    .toLowerCase()
    .replace(/[łøđðþßæœı]/g, (c) => FOLD[c] || c)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Split a normalised query into search tokens (single-char noise dropped). */
export function tokenize(query) {
  const norm = normalize(query)
  if (!norm) return []
  const parts = norm.split(' ').filter(Boolean)
  // Keep a lone 1-character token (e.g. a CJK-free "5" in "5 day tour") only
  // when it is the whole query; otherwise it matches almost everything.
  return parts.length === 1 ? parts : parts.filter((p) => p.length > 1)
}

// Field weights, highest priority first. Read top-to-bottom as the ranking spec:
// exact title > exact alias > title word > alias word > title substring >
// alias substring > keywords > description > location > type label.
//
// "Title word" covers both the prefix case ("Narikala Fortress" for "narikala")
// and a word further in ("Stepantsminda (Kazbegi)" for "kazbegi"): a page whose
// NAME contains the search word should not lose to an unrelated page that merely
// happens to start with it.
//
// ALIAS is the page's English identity — its URL slug words plus its registry
// name. It is what makes the search work across languages: a visitor on the
// German site typing "Tbilisi" must reach the page titled "Tiflis", and typing
// "contact" must reach "Kontakt". Interleaving alias just below the matching
// title tier means an exact English name still beats a localized title that only
// mentions the word in passing.
const SCORE = {
  titleExact: 1000,
  aliasExact: 900,
  titleWord: 800,
  aliasWord: 700,
  titleContains: 500,
  aliasContains: 450,
  keywordsWord: 400,
  keywordsContains: 300,
  descriptionWord: 250,
  descriptionContains: 180,
  locationWord: 150,
  locationContains: 110,
  typeContains: 100,
}

// Corroborating fields only *break ties*; they never promote a page across an
// identity tier. Without this, "Tbilisi Zoo" (title-word 800 + keywords +
// summary + location) would outrank the Tbilisi city page itself (title-exact
// 1000). keywords+description+location+type max out at 900, so 0.1 keeps their
// combined pull (<=90) below the smallest identity-tier gap (100).
const SECONDARY_WEIGHT = 0.1

// Whole-query bonuses, applied once (not per token) so a phrase like
// "private tour" beats two pages that each match only one of the words.
const PHRASE_EXACT = 2000
const PHRASE_STARTS = 1200
// The phrase appears verbatim somewhere in the title, just not at position 0
// ("Embassy of the United States of America" for "united states"). Without
// this, two titles that each contain every query word — but in a different
// order or split apart, e.g. "Embassy of the United Mexican States" — score
// identically per-token and fall back to the title-length tie-break, which
// has no idea one of them is the actual phrase and one only coincidentally
// contains both words. The bonus only needs to clear that tie-break's small
// spread, but is kept well below PHRASE_STARTS so a prefix match still wins.
const PHRASE_CONTAINS = 150

// Tiny nudge so equally-matching pages order by usefulness rather than by
// registry order. Small enough that it never outranks a better field match.
const TYPE_WEIGHT = {
  tour: 40, city: 35, region: 30, place: 25, guide: 15, embassy: 14, blog: 12, info: 10,
}

/**
 * True when `token` starts a word in the normalised `haystack`. Both sides are
 * already space-flattened by normalize(), so a simple boundary check suffices.
 */
function startsWord(haystack, token) {
  if (!haystack) return false
  if (haystack.startsWith(token)) return true
  return haystack.includes(` ${token}`)
}

/**
 * Score one entry against one token.
 *
 * Returns the strongest field hit as `primary` and the sum of the remaining
 * hits as `secondary`, so the caller can keep the ranking tier-dominant.
 * Returns null when the token appears in no field at all.
 */
function scoreToken(entry, token) {
  const { nTitle, nAlias, nSlug, nKeywords, nDescription, nLocation, nType } = entry

  let title = 0
  if (nTitle === token) title = SCORE.titleExact
  else if (startsWord(nTitle, token)) title = SCORE.titleWord
  else if (nTitle.includes(token)) title = SCORE.titleContains

  let alias = 0
  if (nSlug && nSlug === token) alias = SCORE.aliasExact
  else if (nAlias) {
    if (nAlias === token) alias = SCORE.aliasExact
    else if (startsWord(nAlias, token)) alias = SCORE.aliasWord
    else if (nAlias.includes(token)) alias = SCORE.aliasContains
  }

  let keywords = 0
  if (nKeywords) {
    if (startsWord(nKeywords, token)) keywords = SCORE.keywordsWord
    else if (nKeywords.includes(token)) keywords = SCORE.keywordsContains
  }

  let description = 0
  if (nDescription) {
    if (startsWord(nDescription, token)) description = SCORE.descriptionWord
    else if (nDescription.includes(token)) description = SCORE.descriptionContains
  }

  let location = 0
  if (nLocation) {
    if (startsWord(nLocation, token)) location = SCORE.locationWord
    else if (nLocation.includes(token)) location = SCORE.locationContains
  }

  const type = nType && nType.includes(token) ? SCORE.typeContains : 0

  // Title and alias are two names for the same page, so they count as ONE
  // identity signal rather than reinforcing each other — otherwise the
  // corroborating-field cap below could no longer hold.
  const identity = Math.max(title, alias)
  const primary = Math.max(identity, keywords, description, location, type)
  if (primary === 0) return null
  const secondary = identity + keywords + description + location + type - primary
  return { primary, secondary }
}

/**
 * Rank `index` against `query`.
 *
 * Multi-word queries are AND-ed: every token must match at least one field of
 * an entry for it to survive, then the per-token scores are summed. Partial
 * words match by design ("gerge" finds Gergeti), which is what makes the
 * as-you-type list feel responsive.
 *
 * @returns {Array} up to `limit` entries, best first.
 */
export function searchEntries(index, query, limit = 10) {
  const tokens = tokenize(query)
  if (!tokens.length || !index?.length) return []

  const phrase = normalize(query)
  const results = []

  for (const entry of index) {
    let total = 0
    let matchedAll = true

    for (const token of tokens) {
      const s = scoreToken(entry, token)
      if (!s) { matchedAll = false; break }
      total += s.primary + s.secondary * SECONDARY_WEIGHT
    }
    if (!matchedAll) continue

    if (tokens.length > 1) {
      if (entry.nTitle === phrase) total += PHRASE_EXACT
      else if (entry.nTitle.startsWith(phrase)) total += PHRASE_STARTS
      else if (entry.nTitle.includes(phrase)) total += PHRASE_CONTAINS
    }

    total += TYPE_WEIGHT[entry.type] || 0
    // Prefer the more specific page when titles match equally well: "Tbilisi"
    // should outrank "Tbilisi International Airport" for the query "tbilisi".
    total += Math.max(0, 30 - entry.nTitle.length / 4)

    results.push({ entry, score: total })
  }

  results.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
  return results.slice(0, limit).map((r) => r.entry)
}
