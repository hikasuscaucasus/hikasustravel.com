// Shuttle transfer prices are whole US dollars (plain digit strings, e.g. '140'),
// per vehicle, each way; 'N/A' marks a vehicle class that is not offered on the
// route. Converted from the former EUR tariff on 2026-10-16 (EUR x 1.12 x 1.10,
// rounded UP to the next multiple of 5 USD — NOT the tour x95 rule). The page
// formats them through formatPrice() from components/shared/pricingUtils.js.
export const shuttleRoutes = [
  { start: 'Tbilisi', stop: 'Bakuriani', duration: '3h', sedan: '140', minivan: '170', minibus: '245' },
  { start: 'Tbilisi', stop: 'Kazbegi', duration: '3h', sedan: '150', minivan: '175', minibus: '245' },
  { start: 'Tbilisi', stop: 'Gudauri', duration: '2,5h', sedan: '125', minivan: '150', minibus: '225' },
  { start: 'Tbilisi', stop: 'Yerevan', duration: '5h', sedan: '200', minivan: '225', minibus: '485' },
  { start: 'Tbilisi', stop: 'Kutaisi', duration: '3h', sedan: '175', minivan: '220', minibus: '300' },
  { start: 'Batumi', stop: 'Kutaisi', duration: '2,5h', sedan: '120', minivan: '155', minibus: '225' },
  { start: 'Tbilisi', stop: 'Shekvetili', duration: '4,5h', sedan: '225', minivan: '300', minibus: '395' },
  { start: 'Kutaisi', stop: 'Mestia', duration: '5h', sedan: '275', minivan: '345', minibus: '460' },
  { start: 'Kutaisi', stop: 'Kazbegi', duration: '5h', sedan: '250', minivan: '325', minibus: '435' },
  { start: 'Batumi', stop: 'Rize (Turkey)', duration: '2,5h', sedan: '150', minivan: '185', minibus: 'N/A' },
  { start: 'Batumi', stop: 'Trabzon (Turkey)', duration: '3,5h', sedan: '185', minivan: '225', minibus: 'N/A' },
  { start: 'Batumi', stop: 'Zugdidi', duration: '2h', sedan: '125', minivan: '165', minibus: '230' },
  { start: 'Batumi', stop: 'Kazbegi', duration: '7h', sedan: '300', minivan: '365', minibus: '490' },
  { start: 'Batumi', stop: 'Mestia', duration: '5,5h', sedan: '225', minivan: '300', minibus: '395' },
  { start: 'Tbilisi', stop: 'Telavi', duration: '2h', sedan: '125', minivan: '155', minibus: '230' },
  { start: 'Tbilisi', stop: 'Batumi', duration: '5h', sedan: '225', minivan: '300', minibus: '395' },
  { start: 'Tbilisi', stop: 'Sighnaghi', duration: '2h', sedan: '140', minivan: '175', minibus: '245' },
]

export const startLocations = ['Tbilisi', 'Batumi', 'Kutaisi']

export function getStopsForStart(start) {
  if (!start) return [...new Set(shuttleRoutes.map(r => r.stop))].sort()
  return [...new Set(shuttleRoutes.filter(r => r.start === start).map(r => r.stop))].sort()
}

export function getStartsForStop(stop) {
  if (!stop) return startLocations
  return [...new Set(shuttleRoutes.filter(r => r.stop === stop).map(r => r.start))].sort()
}

export function filterRoutes(start, stop) {
  return shuttleRoutes.filter(r => {
    if (start && stop) return r.start === start && r.stop === stop
    if (start) return r.start === start
    if (stop) return r.stop === stop
    return true
  })
}
