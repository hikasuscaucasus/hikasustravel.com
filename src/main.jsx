import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { loadLocale, loadTours } from './i18n/localeData'
import { langCodes, defaultLang } from './i18n/languages'
import { initFirstTouchAttribution } from './utils/attribution'
import './assets/css/reset_plus.css'
import './assets/css/styles.css'
import './assets/css/blur-up.css'
// mapbox-gl.css now travels with the lazily-loaded MapboxMap component instead
// of the entry bundle, so pages without a map ship neither its JS nor its CSS.
import 'swiper/css'
import 'swiper/css/navigation'

// Capture first-touch marketing attribution as early as possible, on the real
// landing page, before any form can be submitted. Never overwrites an existing
// 90-day first-touch value, so internal navigation / returns / later campaigns
// leave the original source intact.
initFirstTouchAttribution()

const container = document.getElementById('root')

const tree = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// scripts/prerender.js marks the pages whose body it rendered at build time.
// Those hydrate; anything else (the dev server, the 404 SPA fallback, the
// legacy redirect stubs) still gets a plain client render into an empty root.
const isPrerendered = container.hasAttribute('data-ssr')

// The locale JSON has to be in the cache before the first render, or
// I18nProvider returns null and hydration finds an empty tree where the build
// wrote a full page. This is not a new round-trip: the provider already blocked
// its first paint on exactly this fetch — it just used to happen one render
// later, inside an effect.
const seg = window.location.pathname.split('/')[1]
const lang = langCodes.includes(seg) ? seg : defaultLang

function mount() {
  if (isPrerendered) ReactDOM.hydrateRoot(container, tree)
  else ReactDOM.createRoot(container).render(tree)
}

// Tour copy is awaited too, unconditionally rather than only on tour routes: the
// build renders translated tour titles wherever they appear (the hubs, the tour
// pages, the "<Entity> Tours" listings, the home page cards), so hydration needs
// the same data or those pages would mismatch. A route-shaped guess about which
// pages need it is the kind of thing that silently drifts. It no longer delays
// what the visitor sees either — the page is painted from the static HTML; this
// only gates interactivity.
if (isPrerendered) Promise.all([loadLocale(lang), loadTours(lang)]).then(mount, mount)
else mount()
