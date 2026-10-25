// One place that knows the Hikasus WhatsApp number, how a prefilled-message
// link is built, and the click event. Every visitor-facing WhatsApp control
// goes through here (the floating bubble and the tour pages' mobile bar), so
// the number, the encoding and the analytics can never drift apart.
import { trackEvent } from './analytics'

export const WHATSAPP_NUMBER = '995551098077'
export const SITE_ORIGIN = 'https://www.hikasustravel.com'

/** `message` is plain text; it is URL-encoded exactly once, here. */
export function buildWhatsAppHref(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/** "/en/private-tours/x" + query/hash -> "https://www.hikasustravel.com/en/private-tours/x/" (the canonical shape). */
export function pageUrl(pathname) {
  const clean = String(pathname || '/').split(/[?#]/)[0]
  return `${SITE_ORIGIN}${clean.endsWith('/') ? clean : `${clean}/`}`
}

/** GA4 click event. Parameters are a placement and a tour slug, never the message or any contact data. */
export function trackWhatsAppClick(placement, tour = '') {
  trackEvent('whatsapp_click', { placement, tour })
}
