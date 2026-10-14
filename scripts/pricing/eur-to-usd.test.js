// Deterministic tests for the owner's EUR -> USD pricing rule.
// Run: node scripts/pricing/eur-to-usd.test.js   (exit code 1 on any failure)
import { eurToUsd, ownerRound, checkInvariants, RATE_CENTS_PER_EUR } from './eur-to-usd.js'

let passed = 0
let failed = 0
const fail = (msg) => { failed++; console.error(`FAIL  ${msg}`) }
const ok = () => { passed++ }
const eq = (label, actual, expected) => (actual === expected ? ok() : fail(`${label}: got ${actual}, expected ${expected}`))

// --- 1. Whole-USD pricing rule: the brief's required boundary table (section 6)
const table = [
  [95, 95], [96, 95],
  [195, 195], [196, 195], [200, 195], [211, 195], [212, 215],
  [295, 295], [296, 295], [300, 295], [301, 295], [311, 295], [312, 315],
  [385, 385], [386, 390], [389, 390], [390, 390], [395, 395], [396, 395], [400, 395], [401, 395], [411, 395], [412, 415], [415, 415], [418, 420],
  [495, 495], [496, 495], [500, 495], [511, 495], [512, 515],
  [595, 595], [596, 595], [600, 595], [611, 595], [612, 615],
  [995, 995], [996, 995], [1000, 995], [1011, 995], [1012, 1015],
  [1095, 1095], [1096, 1095], [1100, 1095], [1111, 1095], [1112, 1115],
  // extra brief examples (section 4)
  [382, 385], [391, 395], [392, 395], [414, 415], [416, 420], [421, 425],
]
for (const [whole, expected] of table) eq(`ownerRound(${whole})`, ownerRound(whole).finalUsd, expected)

// --- 2. Every x95 band at every hundred up to 10,000 (section 51)
for (let n = 1; n <= 100; n++) {
  for (let w = n * 100 - 4; w <= n * 100 + 11; w++) eq(`band ${w}`, ownerRound(w).finalUsd, n * 100 - 5)
}

// --- 3. Outside the band: ends in 0/5, never below, less than 5 above (section 52)
for (let w = 1; w <= 10000; w++) {
  const r = w % 100
  const inBand = r >= 96 || (r <= 11 && w >= 100)
  if (inBand) continue
  const f = ownerRound(w).finalUsd
  if (f % 5 !== 0) fail(`${w}: final ${f} not a multiple of 5`)
  else if (f < w) fail(`${w}: final ${f} below whole`)
  else if (f - w >= 5) fail(`${w}: final ${f} too far above whole`)
  else ok()
}

// --- 4. Full conversion: exact rate, half-up whole-dollar rounding, then rule (sections 5, 7, 8)
eq('rate', RATE_CENTS_PER_EUR, 112)
const full = [
  // eur, rawUsd, wholeUsd, finalUsd  (brief section 18 examples)
  [347, '388.64', 389, 390],
  [269, '301.28', 301, 295],
  // small and round amounts
  [1, '1.12', 1, 5],
  [25, '28.00', 28, 30],
  [590, '660.80', 661, 665],
  [415, '464.80', 465, 465],
  [2695, '3018.40', 3018, 3020],
  [480, '537.60', 538, 540],
  [1695, '1898.40', 1898, 1895],
  [535, '599.20', 599, 595],
  [745, '834.40', 834, 835],
  [550, '616.00', 616, 620],
  [645, '722.40', 722, 725],
  [1185, '1327.20', 1327, 1330],
  [3595, '4026.40', 4026, 4030],
  [360, '403.20', 403, 395],
  [265, '296.80', 297, 295],
  [1000, '1120.00', 1120, 1120],
]
for (const [eur, raw, whole, final] of full) {
  const r = eurToUsd(eur)
  eq(`eurToUsd(${eur}).rawUsd`, r.rawUsd, raw)
  eq(`eurToUsd(${eur}).wholeUsd`, r.wholeUsd, whole)
  eq(`eurToUsd(${eur}).finalUsd`, r.finalUsd, final)
  eq(`eurToUsd(${eur}) invariants`, checkInvariants(r).length, 0)
}

// --- 5. Half-up rounding is applied to the raw USD, not to EUR first; and the function is monotonic
for (let eur = 1; eur <= 10000; eur++) {
  const r = eurToUsd(eur)
  const expectWhole = Math.floor((eur * 112 + 50) / 100)
  if (r.wholeUsd !== expectWhole) fail(`${eur}: whole ${r.wholeUsd} != ${expectWhole}`)
  else if (eur > 1 && r.finalUsd < eurToUsd(eur - 1).finalUsd) fail(`${eur}: final decreased vs ${eur - 1}`)
  else if (checkInvariants(r).length) fail(`${eur}: ${checkInvariants(r).join('; ')}`)
  else ok()
}

// --- 6. Guards
for (const bad of [0, -5, 1.5, '590', NaN]) {
  try { eurToUsd(bad); fail(`eurToUsd(${bad}) should throw`) } catch { ok() }
}

console.log(`eur-to-usd tests: PASSED ${passed}, FAILED ${failed}`)
if (failed) process.exit(1)
