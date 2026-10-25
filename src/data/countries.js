// The one country dataset behind every tour inquiry form: the 249 officially
// assigned ISO 3166-1 alpha-2 codes plus XK (Kosovo, user-assigned but issued
// its own passports and present in CLDR). Names are never stored here — the
// visible, localized name comes from the runtime's CLDR data
// (Intl.DisplayNames), so no locale needs its own country list.
export const COUNTRY_CODES = (
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ ' +
  'BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ ' +
  'DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
  'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY ' +
  'HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP ' +
  'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY ' +
  'MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ ' +
  'NA NC NE NF NG NI NL NO NP NR NU NZ OM ' +
  'PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW ' +
  'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ ' +
  'TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ ' +
  'UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW'
).split(' ')

const CODE_SET = new Set(COUNTRY_CODES)

export const isCountryCode = (code) => CODE_SET.has(code)

const namesCache = new Map()

// Resolves a code to its name in `lang` (falls back to the code itself if the
// runtime has no data for it).
export function countryName(code, lang) {
  let dn = namesCache.get(lang)
  if (dn === undefined) {
    try { dn = new Intl.DisplayNames([lang], { type: 'region' }) } catch { dn = null }
    namesCache.set(lang, dn)
  }
  if (!dn) return code
  try { return dn.of(code) || code } catch { return code }
}

// [{ code, name }] sorted by the visible name in `lang`.
export function countryOptions(lang) {
  const collator = new Intl.Collator(lang)
  return COUNTRY_CODES
    .map((code) => ({ code, name: countryName(code, lang) }))
    .sort((a, b) => collator.compare(a.name, b.name))
}
