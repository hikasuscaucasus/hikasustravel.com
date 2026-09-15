import { useContext, useMemo } from 'react'
import HeroSection from '../shared/HeroSection'
import FadeUp from '../shared/FadeUp'
import BlurUpBackground from '../shared/BlurUpBackground'
import DestinationCard from '../shared/DestinationCard'
import Breadcrumbs from '../shared/Breadcrumbs'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import { getSEO, hasSEO } from '../../data/seoData'
import {
  citiesOfCountry, cityPath, countryBase, countryHubSocialImage, countryHubMeta,
  regionsHubPathFor, citiesHubPathFor, placesHubPathFor,
  DEFAULT_COUNTRY,
} from '../../data/places'

const SITE_URL = 'https://www.hikasustravel.com'

/**
 * Per-country configuration for this one shared landing page.
 *
 * Everything that used to be a Georgia constant in this file lives here, keyed
 * by country, so a second country reuses the component, the card system, the
 * grid and the CSS rather than getting a page of its own. Georgia's entry is
 * verbatim what the constants held before, so /georgia renders byte-identically.
 *
 * WHICH SUB-HUB TILES APPEAR is not configured here — it is derived, from two
 * facts that are already true elsewhere: whether the country declares that hub
 * (COUNTRIES in places.js) and whether a cover image for it exists below. A hub
 * a country does not publish, or one with no approved photograph yet, is simply
 * omitted. That is what keeps an incomplete country honest instead of shipping
 * "coming soon" cards or empty tiles.
 */
const COUNTRY_LANDING = {
  georgia: {
    pageKey: 'destinations',
    seoKey: 'destinations',
    hero: '/images/files/tbilisi-old-town-narikala-mtkvari-georgia-1200.webp',
    // Georgia's long-standing "All Destinations" crumb. A country added later
    // uses its own name via nav.destinations.<country> (see `crumb` below).
    crumbKey: 'nav.allDestinations',
    itemListName: 'Destinations in Georgia',
    // Curated localized card names for the featured-city strip. Resolving
    // through the SAME chain as the Cities hub is what keeps a city named
    // identically on /georgia and /georgia/cities in every language.
    cityItemsKey: 'destinationsCities',
    pinFirstCity: 'tbilisi',
    // ⚠️ Card covers must live under /images/files/ AND have a matching file in
    // /images/files-thumb/ — BlurUpBackground derives the blur placeholder by
    // string-replacing that folder. A path outside /images/files/ silently makes
    // the placeholder resolve to the full-size file instead.
    subhubImages: {
      // Regions: broad Georgian countryside, no people, no single landmark — it
      // stands for regional variety rather than one place. (Ushguli was the
      // obvious scenic pick and was rejected twice over: its provenance is
      // unresolved — flagged as an upscaled stock download — and Ushguli is a
      // featured city on this same page, so the card would have sat beside an
      // identical tile.)
      regions: '/images/files/kakheti-vineyard.jpg',
      cities: '/images/files/tbilisi-old-town-narikala-mtkvari-georgia-1200.webp',
      // Places to visit: a recognisable landmark — the Ananuri fortress and
      // church above the Zhinvali reservoir. Distinct from the Regions cover,
      // from the hero and from all featured-city tiles on this page.
      places: '/images/files/Ananuri Fortress and Zhinvali Reservoir.jpg',
    },
  },
  armenia: {
    pageKey: 'armenia',
    seoKey: 'armenia',
    // Khor Virap monastery with Mount Ararat behind it — owner-supplied, the
    // first genuine Armenian photograph in the repo. Portrait 1086x1448 (the
    // native size; no upscale), so the hero crops it centrally the way every
    // `.coverme` hero does. `heroAvif` feeds HeroSection's image-set() upgrade,
    // exactly as the packaged ladder intends.
    hero: '/images/files/khor-virap-monastery-ararat-armenia-1086.webp',
    heroAvif: '/images/files/khor-virap-monastery-ararat-armenia-1086.avif',
    // Dedicated 1.91:1 social crop. Without it og:image would inherit the
    // site-wide georgia-home.jpg — a Georgian photo on an Armenian page — or,
    // worse, the portrait hero, which social scrapers letterbox badly.
    ogImage: '/images/files/khor-virap-monastery-ararat-armenia-og.jpg',
    crumbKey: null, // -> nav.destinations.armenia
    itemListName: 'Destinations in Armenia',
    // Armenia now has a curated city-card block. It carries DESCRIPTIONS only:
    // every entry deliberately omits `name`, so the title still resolves the way
    // it always did — through the localized nav label (nav.yerevan is Jerewan /
    // Erevan / Ereván / Erywań in the shipped locales), then the registry name,
    // never raw English. The same block feeds the Armenia Cities hub, so the two
    // pages cannot drift.
    cityItemsKey: 'armeniaCities',
    cityNameNavFallback: true,
    // Render the featured cities as the site's standard destination CARD
    // (DestinationCard — the same one every hub uses) instead of the square photo
    // tiles. Georgia keeps the tiles: all 26 of its featured cities have a
    // photograph, so a tile row there is a wall of pictures. Armenia has two
    // photographed cities out of eleven, which as tiles meant nine brand-tone
    // blocks; as cards it is eleven real summaries, with a cover where one
    // honestly exists. Opt-in per country, so /georgia is byte-identical.
    featuredCityCards: true,
    // The capital leads, exactly as Tbilisi does on /georgia. Matched on the
    // stable slug, never the label, which is localized.
    pinFirstCity: 'yerevan',
    // Regions: the Khor Virap landscape at its 768 rung. Reusing the hero file
    // as a tile cover is this page's own established pattern — Georgia's Cities
    // tile is literally the same file as its Georgia hero. It is an honest fit
    // here too: a wide view of the Ararat plain standing for regional variety,
    // exactly as the Kakheti vineyard does for Georgia.
    //
    // All three tiles now carry a real Armenian photograph, each the smallest
    // rung of a family that already exists here — the listing never pulls a
    // full-size hero. `cities` and `places` were deliberately null while Khor
    // Virap was the only Armenian photo in the repo (a monastery on the Ararat
    // plain behind a "Cities" tile would have told a traveller something
    // untrue); the owner packages since delivered have made both honest:
    //   regions → the Khor Virap landscape, a wide view of the Ararat plain
    //   cities  → the Yerevan Cascade, the capital's best-known landmark
    //   places  → Lake Sevan, the country's best-known natural site
    // ⚠️ Both new covers needed a `/images/files-thumb/` twin: BlurUpBackground
    // derives the blur placeholder by string-replacing that folder, so a cover
    // without one requests a 404 as its placeholder. Generated at the project's
    // own 20px/quality-50 setting (`scripts/generate-thumbnails.js`).
    //
    // The tiles are `.tour-tile` — a 1:1 box painted by `.tour-tile-image`,
    // which already sets `background-size: cover` and `background-position:
    // center`. Both crops were rendered at 420x420 and looked at before being
    // chosen: the portrait Cascade keeps its obelisk, terraces and arcades, and
    // the 16:9 Lake Sevan keeps the water, the far shore and the ridge behind.
    // Neither needs a tile-specific position, so none is introduced.
    subhubImages: {
      regions: '/images/files/khor-virap-monastery-ararat-armenia-768.webp',
      cities: '/images/files/yerevan-cascade-armenia-768.webp',
      places: '/images/files/lake-sevan-armenia-768.webp',
    },
  },
  azerbaijan: {
    pageKey: 'azerbaijan',
    seoKey: 'azerbaijan',
    // Owner-supplied Baku Boulevard photograph (Flame Towers visible in the
    // background) — the broadest "this is Azerbaijan" image in the batch, so
    // it leads the country page. Distinct from the Cities sub-hub tile and
    // Baku's own city card/hero below, which both use the Flame Towers
    // skyline shot instead.
    hero: '/images/files/baku-boulevard-flame-towers-azerbaijan-1536.webp',
    heroAvif: '/images/files/baku-boulevard-flame-towers-azerbaijan-1536.avif',
    crumbKey: null, // -> nav.destinations.azerbaijan
    itemListName: 'Destinations in Azerbaijan',
    cityItemsKey: 'azerbaijanCities',
    // The standard destination card, as on Armenia.
    featuredCityCards: true,
    // The strip is driven by the registry's `featured` flag rather than by
    // "every published city": nothing is published yet, and the eight flagged
    // cities are the ones chosen to lead. They render capital first, then A–Z
    // by canonical name (the same order in every locale), as non-clickable
    // "coming soon" cards until each is flipped to `published: true`.
    featuredByFlag: true,
    pinFirstCity: 'baku',
    // Distinct owner-supplied photograph per sub-hub tile: a Mountainous
    // Shirvan mosque (the only region-correct image in the batch) for
    // Regions, the Baku Flame Towers skyline for Cities, and the Maiden Tower
    // for Places to Visit — matching the same three images RegionsHubPage /
    // CitiesHubPage / PlacesToVisitHubPage use as their own index heroes
    // (DestinationHubs.jsx), so a tile and the page it links to agree.
    subhubImages: {
      regions: '/images/files/shamakhi-juma-mosque-azerbaijan-1564.webp',
      cities: '/images/files/baku-flame-towers-azerbaijan-1448.webp',
      places: '/images/files/maiden-tower-icherisheher-baku-azerbaijan-1293.webp',
    },
    // No curated `azerbaijanCities.items[].description` block exists (unlike
    // Armenia's), so the card summary falls back to each city's own authored
    // SEO description — the exact chain DestinationHub's `seoFallback` already
    // uses for /azerbaijan/cities, so the two pages read the same text and can
    // never drift.
    seoFallbackDescription: true,
  },
}

/**
 * Country landing page — /georgia and (once its imagery exists) /armenia.
 *
 * One component, one card system, one grid, one set of CSS rules, populated per
 * country from the registry. Nothing about the layout is country-specific: the
 * differences are which hubs that country publishes, which cities it has, and
 * which covers exist.
 */
export default function DestinationsPage({ country = DEFAULT_COUNTRY }) {
  const t = useT()
  const { lang } = useLang()
  const { pages, enPages } = useContext(I18nContext)
  const conf = COUNTRY_LANDING[country] || COUNTRY_LANDING[DEFAULT_COUNTRY]
  const page = pages[conf.pageKey] || enPages[conf.pageKey]
  const seo = getSEO(conf.seoKey, lang)
  const path = countryBase(country).replace(/^\//, '')

  // Every sub-hub this country actually publishes. The `to` check is what stops
  // a tile linking to a page that does not exist (Armenia has no
  // places-to-visit hub yet). A hub whose cover has not been supplied still gets
  // its tile — it renders on the brand tone via --placeholder rather than being
  // hidden, so the page keeps its navigation while photography catches up.
  const subhubs = useMemo(() => {
    const candidates = [
      { key: 'regions', to: regionsHubPathFor(country), labelKey: 'nav.regions' },
      { key: 'cities', to: citiesHubPathFor(country), labelKey: 'nav.cities' },
      { key: 'places', to: placesHubPathFor(country), labelKey: 'nav.placesToVisit' },
    ]
    return candidates
      .map((c) => ({ ...c, image: conf.subhubImages[c.key] }))
      .filter((c) => c.to)
  }, [country, conf])

  // Published city guides for this country. Entries reclassified as a place to
  // visit (e.g. Gomismta) are not cities, so they are excluded from the strip.
  // A city without a cover still gets its card, on the same brand-tone
  // placeholder the sub-hub tiles use. Inert for Georgia: all 26 of its featured
  // cities have a photograph, so every Georgia tile takes the image branch.
  //
  // A country that opts into `featuredByFlag` lists its `featured: true` cities
  // instead — published or not — so a scaffolded country can show which guides
  // are coming without publishing anything. Georgia and Armenia do not opt in,
  // so their strips are exactly what they were.
  const featuredCities = useMemo(
    () => citiesOfCountry(country).filter((c) =>
      c.classifyAs !== 'place' && (conf.featuredByFlag ? !!c.featured : c.published)),
    [country, conf.featuredByFlag],
  )

  // The label a visitor actually reads. This resolves through exactly the same
  // chain as the Cities hub (DestinationHub): the curated localized card name,
  // then the English one, then — for a country with no curated block yet — the
  // localized nav label, then the registry's display name. Reading the ui.json
  // `nav.<slug>` keys as the PRIMARY source, as this used to, left the strip
  // showing English names ("Kutaisi", "Mtskheta") where the hub had proper
  // localizations ("Kutaissi", "Mzcheta"), which is why they sit below the
  // curated tiers and are opt-in per country.
  const cityItems = (conf.cityItemsKey && pages[conf.cityItemsKey]?.items) || {}
  const enCityItems = (conf.cityItemsKey && enPages[conf.cityItemsKey]?.items) || {}
  // One-line card summary, resolved through the same two tiers as the name:
  // this locale first, then English, so a city whose text has not been
  // translated yet still shows a summary rather than an empty card. Only the
  // card layout reads it; the tile layout has nowhere to put it.
  const cityDescription = (c) => {
    const curated = cityItems[c.slug]?.description || enCityItems[c.slug]?.description
    if (curated) return curated
    if (conf.seoFallbackDescription && c.seoKey && hasSEO(c.seoKey, lang)) {
      return getSEO(c.seoKey, lang).description || ''
    }
    return ''
  }
  const cityTitle = (c) => {
    const navLabel = conf.cityNameNavFallback ? t(`nav.${c.slug}`) : null
    return cityItems[c.slug]?.name || enCityItems[c.slug]?.name
      || (navLabel && navLabel !== `nav.${c.slug}` ? navLabel : null)
      || c.name
  }

  // Capital first (matched on its stable slug, not its label — it renders as
  // Tiflis/Tbilissi in some locales), then the rest A–Z by that visible label.
  // Sorted here rather than on a module-level constant because the label is
  // locale-dependent, so the order legitimately differs per language (Czech, for
  // instance, collates "Ch" after "H").
  //
  // A flag-driven strip (`featuredByFlag`) sorts A–Z by the registry's own
  // canonical name instead of the visible label, so the order is the same in
  // every locale: those cards are not localized yet, and the strip is meant to
  // read as one stable list rather than reshuffle per language.
  const titled = featuredCities.map((c) => ({ city: c, title: cityTitle(c) }))
  const sortKey = (x) => (conf.featuredByFlag ? x.city.name : x.title)
  const sortLang = conf.featuredByFlag ? 'en' : lang
  const orderedCities = [
    ...titled.filter((x) => x.city.slug === conf.pinFirstCity),
    ...titled
      .filter((x) => x.city.slug !== conf.pinFirstCity)
      .sort((a, b) => sortKey(a).localeCompare(sortKey(b), sortLang, { sensitivity: 'base' })),
  ]

  const crumbName = conf.crumbKey ? t(conf.crumbKey) : t(`nav.destinations.${country}`)
  const trail = [
    { name: t('breadcrumb.home'), to: '/' },
    { name: crumbName },
  ]

  const jsonLd = useMemo(() => {
    const url = `${SITE_URL}/${lang}/${path}`
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('breadcrumb.home'), item: `${SITE_URL}/${lang}` },
            { '@type': 'ListItem', position: 2, name: crumbName, item: url },
          ],
        },
        {
          '@type': 'ItemList',
          name: conf.itemListName,
          itemListElement: subhubs.map((d, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: t(d.labelKey),
            url: `${SITE_URL}/${lang}${d.to}`,
          })),
        },
      ],
    }
  }, [lang, t, path, crumbName, conf.itemListName, subhubs])

  // og:image/twitter:image prefer a dedicated 1.91:1 social crop where the
  // country ships one, else the hero. A country with neither emits none.
  // A country with a shared landing social record (places.js, Armenia) also
  // gets the crop's size and a concise localized alt; the previous branch is
  // kept verbatim for a country without one (Georgia), so it is unchanged.
  const landingSocial = countryHubSocialImage(country, 'landing')
  const socialImage = conf.ogImage || conf.hero
  useSEO({
    ...seo, lang, path, jsonLd, robots: countryHubMeta(country),
    ...(landingSocial
      ? { ogImage: landingSocial.src, ogImageWidth: landingSocial.width, ogImageHeight: landingSocial.height, imageAlt: landingSocial.alt?.[lang] || landingSocial.alt?.en }
      : (socialImage ? { image: socialImage } : {})),
  })

  return (
    <>
      {conf.hero ? (
        <HeroSection className="hero--compact" image={conf.hero} imageAvif={conf.heroAvif} title={page.heroTitle} />
      ) : (
        /* No photo hero until an approved image exists — the same solid
           `.dest-title-band` CityPage/SitePage/RegionPage use for `noHero`. It
           carries the page's single H1 and keeps the transparent header's cream
           logo/nav legible. No image, no placeholder, no reserved 100dvh. */
        <section className="dest-title-band">
          <h1>{page.heroTitle}</h1>
        </section>
      )}

      <section className="home-items">
        <div className="tours-grid-container">
          <FadeUp>
            <Breadcrumbs trail={trail} />
          </FadeUp>
          <FadeUp>
            {/* Left-aligned inside the centred section: centred body copy makes a
                mid-sentence line break read as a large gap between the last word
                of one line and the first of the next. The block itself stays
                centred (width/max-width/margin are unchanged), so nothing moves. */}
            <p className="dest-intro">{page.intro}</p>
          </FadeUp>
          {subhubs.length > 0 && (
            <FadeUp>
              {/* The sub-hubs sit in a grid that is four across at desktop
                  widths, so a shorter row would ship with permanently blank
                  columns. data-count lets the stylesheet close it. */}
              <div className="tours-grid" data-count={subhubs.length}>
                {subhubs.map((d) => {
                  const title = t(d.labelKey)
                  return (
                    <div className="tour-tile" key={d.to}>
                      <LocaleLink to={d.to} className="tour-tile-link" aria-label={title}>
                        {d.image
                          ? <BlurUpBackground src={d.image} className="tour-tile-image" />
                          : <div className="tour-tile-image tour-tile-image--placeholder" />}
                        <div className="tour-tile-overlay">
                          {/* These tiles are the page's first section and sit
                              directly under its <h1>, so an <h3> here skipped a
                              level. The featured-city tiles below keep <h3>: they
                              follow the "Featured city guides" <h2>, which is the
                              section they belong to. Same on the homepage, where
                              every tile row has its own <h2> above it. */}
                          <h2>{title}</h2>
                        </div>
                      </LocaleLink>
                    </div>
                  )
                })}
              </div>
            </FadeUp>
          )}

          {orderedCities.length > 0 && (
            <>
              <FadeUp>
                <h2 className="dest-featured-title">{t('destinations.featuredCities')}</h2>
              </FadeUp>
              <FadeUp>
                {/* Same short-row treatment as the sub-hub grid above, but only
                    where it applies: the stylesheet defines data-count 1-3 and
                    leaves four or more alone, so the attribute is emitted only
                    for a short row. Georgia's 26-tile strip is untouched. */}
                {conf.featuredCityCards ? (
                  /* The site's standard destination card, one per city, in the
                     hub's own grid. <h3> because these sit under the "Featured
                     city guides" <h2>; the hub's cards are <h2> because they sit
                     directly under their page's <h1>. */
                  <ul className="dest-hub-grid">
                    {orderedCities.map(({ city: c, title }) => (
                      <li className="dest-hub-card" key={c.slug}>
                        {/* An unpublished city (only possible on a flag-driven
                            strip) gets no `to`, so DestinationCard renders its
                            non-clickable "coming soon" form — the same one the
                            hubs use. Every Armenian city here is published, so
                            that page is unchanged. */}
                        <DestinationCard
                          name={title}
                          description={cityDescription(c)}
                          image={c.image}
                          imagePosition={c.imagePosition}
                          to={c.published ? cityPath(c.slug) : null}
                          ctaLabel={t('destinations.exploreCity')}
                          soonLabel={t('destinations.comingSoon')}
                          headingLevel="h3"
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div
                    className="tours-grid"
                    {...(orderedCities.length < 4 ? { 'data-count': orderedCities.length } : {})}
                  >
                    {orderedCities.map(({ city: c, title }) => {
                      return (
                        <div className="tour-tile" key={c.slug}>
                          <LocaleLink to={cityPath(c.slug)} className="tour-tile-link" aria-label={title}>
                            {c.image
                              ? <BlurUpBackground src={c.image} className="tour-tile-image" />
                              : <div className="tour-tile-image tour-tile-image--placeholder" />}
                            <div className="tour-tile-overlay">
                              <h3>{title}</h3>
                            </div>
                          </LocaleLink>
                        </div>
                      )
                    })}
                  </div>
                )}
              </FadeUp>
            </>
          )}
        </div>
      </section>
    </>
  )
}
