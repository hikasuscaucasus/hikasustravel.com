export const shuttleRoutes = [
  { start: 'Tbilisi', stop: 'Bakuriani', duration: '3h', sedan: '110,00', minivan: '135,00', minibus: '195,00' },
  { start: 'Tbilisi', stop: 'Kazbegi', duration: '3h', sedan: '120,00', minivan: '140,00', minibus: '195,00' },
  { start: 'Tbilisi', stop: 'Gudauri', duration: '2,5h', sedan: '100,00', minivan: '120,00', minibus: '180,00' },
  { start: 'Tbilisi', stop: 'Yerevan', duration: '5h', sedan: '160,00', minivan: '180,00', minibus: '390,00' },
  { start: 'Tbilisi', stop: 'Kutaisi', duration: '3h', sedan: '140,00', minivan: '175,00', minibus: '240,00' },
  { start: 'Batumi', stop: 'Kutaisi', duration: '2,5h', sedan: '95,00', minivan: '125,00', minibus: '180,00' },
  { start: 'Tbilisi', stop: 'Shekvetili', duration: '4,5h', sedan: '180,00', minivan: '240,00', minibus: '320,00' },
  { start: 'Kutaisi', stop: 'Mestia', duration: '5h', sedan: '220,00', minivan: '280,00', minibus: '370,00' },
  { start: 'Kutaisi', stop: 'Kazbegi', duration: '5h', sedan: '200,00', minivan: '260,00', minibus: '350,00' },
  { start: 'Batumi', stop: 'Rize (Turkey)', duration: '2,5h', sedan: '120,00', minivan: '150,00', minibus: 'N/A' },
  { start: 'Batumi', stop: 'Trabzon (Turkey)', duration: '3,5h', sedan: '150,00', minivan: '180,00', minibus: 'N/A' },
  { start: 'Batumi', stop: 'Zugdidi', duration: '2h', sedan: '100,00', minivan: '130,00', minibus: '185,00' },
  { start: 'Batumi', stop: 'Kazbegi', duration: '7h', sedan: '240,00', minivan: '295,00', minibus: '395,00' },
  { start: 'Batumi', stop: 'Mestia', duration: '5,5h', sedan: '180,00', minivan: '240,00', minibus: '320,00' },
  { start: 'Tbilisi', stop: 'Telavi', duration: '2h', sedan: '100,00', minivan: '125,00', minibus: '185,00' },
  { start: 'Tbilisi', stop: 'Batumi', duration: '5h', sedan: '180,00', minivan: '240,00', minibus: '320,00' },
  { start: 'Tbilisi', stop: 'Sighnaghi', duration: '2h', sedan: '110,00', minivan: '140,00', minibus: '195,00' },
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
