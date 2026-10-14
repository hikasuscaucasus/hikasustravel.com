import { useEffect } from 'react'
import { withTrailingSlash, normalizeJsonLdUrls } from '../utils/url'
import { withImageLicensing } from '../utils/imageLicense'

const SITE_URL = 'https://www.hikasustravel.com'

const localeMap = {
  en: 'en_US', es: 'es_ES', fr: 'fr_FR',
  de: 'de_DE', pl: 'pl_PL', cs: 'cs_CZ', nl: 'nl_NL',
}

function setMeta(name, content, attr = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!content) { el?.remove(); return }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href, attrs = {}) {
  const selector = Object.entries(attrs)
    .map(([k, v]) => `[${k}="${v}"]`)
    .join('')
  let el = document.querySelector(`link[rel="${rel}"]${selector}`)
  if (!href) { el?.remove(); return }
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function useSEO({ title, description, keywords, lang = 'en', path = '', image, imageAlt, ogImage, ogImageWidth, ogImageHeight, preload, jsonLd, robots } = {}) {
  useEffect(() => {
    // Title
    if (title) document.title = title

    // Meta description
    setMeta('description', description)

    // Meta keywords
    setMeta('keywords', keywords)

    // Robots directive. Only a page that passes one (a scaffolded country's
    // landing and hubs, via countryHubMeta) emits the tag; every other page
    // passes nothing, and setMeta then removes any tag a previous page left,
    // so a client-side navigation away from a noindex page clears it.
    setMeta('robots', robots)

    // Canonical — trailing-slash form matches the URL the host actually serves
    // (200), instead of the slashless form that 301-redirects to it.
    const canonical = withTrailingSlash(`${SITE_URL}/${lang}${path ? `/${path}` : ''}`)
    setLink('canonical', canonical)

    // Open Graph
    setMeta('og:title', title, 'property')
    setMeta('og:description', description, 'property')
    setMeta('og:url', canonical, 'property')
    setMeta('og:type', 'website', 'property')
    setMeta('og:locale', localeMap[lang] || 'en_US', 'property')
    setMeta('og:site_name', 'Hikasus Travel', 'property')
    // Prefer a dedicated social image (1.91:1) when supplied; fall back to the
    // page hero. og:image:alt / width / height are set when known and cleared
    // otherwise (setMeta removes the tag for empty content).
    const ogImg = ogImage || image
    if (ogImg) {
      const imgUrl = ogImg.startsWith('http') ? ogImg : `${SITE_URL}${ogImg}`
      setMeta('og:image', imgUrl, 'property')
      setMeta('og:image:alt', imageAlt, 'property')
      setMeta('og:image:width', ogImageWidth ? String(ogImageWidth) : '', 'property')
      setMeta('og:image:height', ogImageHeight ? String(ogImageHeight) : '', 'property')
    }

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    if (ogImg) {
      const imgUrl = ogImg.startsWith('http') ? ogImg : `${SITE_URL}${ogImg}`
      setMeta('twitter:image', imgUrl)
      setMeta('twitter:image:alt', imageAlt)
    }

    // Hero preload (optional) — a page may preload its LCP hero rung so the
    // browser starts fetching it from the initial HTML (the hero is a CSS
    // background, which browsers discover late). Page-scoped: only pages that pass
    // `preload` emit the tag; it's tagged data-seo-preload so it's found/removed
    // reliably regardless of its attrs, and cleared when a page passes no preload.
    let preloadEl = document.querySelector('link[data-seo-preload]')
    if (preload && preload.href) {
      if (!preloadEl) {
        preloadEl = document.createElement('link')
        preloadEl.setAttribute('rel', 'preload')
        preloadEl.setAttribute('as', 'image')
        preloadEl.setAttribute('data-seo-preload', '')
        document.head.appendChild(preloadEl)
      }
      preloadEl.setAttribute('href', preload.href)
      if (preload.type) preloadEl.setAttribute('type', preload.type)
      if (preload.fetchpriority) preloadEl.setAttribute('fetchpriority', preload.fetchpriority)
    } else {
      preloadEl?.remove()
    }

    // JSON-LD
    let scriptEl = document.querySelector('script[data-seo-jsonld]')
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script')
        scriptEl.setAttribute('type', 'application/ld+json')
        scriptEl.setAttribute('data-seo-jsonld', '')
        document.head.appendChild(scriptEl)
      }
      // Every ImageObject in the graph gets the locale's Image Usage &
      // Licensing page as `license` / `acquireLicensePage` unless the node
      // already carries its own (see utils/imageLicense.js). Applied here, at
      // the single runtime sink, so no page builder has to remember it.
      scriptEl.textContent = JSON.stringify(normalizeJsonLdUrls(withImageLicensing(jsonLd, lang)))
    } else {
      scriptEl?.remove()
    }

    return () => {
      // Clean up JSON-LD + hero preload on unmount
      document.querySelector('script[data-seo-jsonld]')?.remove()
      document.querySelector('link[data-seo-preload]')?.remove()
    }
  }, [title, description, keywords, lang, path, image, imageAlt, ogImage, ogImageWidth, ogImageHeight, preload, jsonLd, robots])
}
