const BASE = import.meta.env.BASE_URL
// `path` is falsy for a record with no approved photo yet (e.g. a tour's
// `heroImage: null`) — every caller already guards what it does with the
// result, but `path.replace` itself must not throw on that missing value.
export default function asset(path) {
  if (!path) return path
  return BASE + path.replace(/^\//, '')
}
