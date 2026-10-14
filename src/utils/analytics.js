// Thin wrapper over the GA4 tag index.html already loads (gtag.js, G-WRWJ35WXX5).
// Every funnel event on the site goes through here so the call sites stay
// one line and never reach for `window.gtag` directly.
//
// Rules: event parameters are tour slugs, placements and departure windows —
// never a name, email, phone number or message. SSR-safe (no window at
// build time) and a no-op when the tag is blocked or has not loaded yet.
export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  try {
    window.gtag('event', name, params)
  } catch {
    /* analytics must never break the page */
  }
}
