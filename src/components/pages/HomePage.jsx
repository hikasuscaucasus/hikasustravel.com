import { useContext } from 'react'
import HeroSection from '../shared/HeroSection'
import FadeUp from '../shared/FadeUp'
import CardImage from '../shared/CardImage'
import DestinationCard from '../shared/DestinationCard'
import CountryTabs from '../shared/CountryTabs'
import FeaturedTourTile from '../shared/FeaturedTourTile'
import ContactForm from '../shared/ContactForm'
import { tours, privateTourCountFor, countryHasAnyTours, featuredToursFor } from '../../data/tours'
import { blogArticles } from '../../data/blogData'
import { contactInfo } from '../../data/siteData'
import useT from '../../i18n/useT'
import usePluralT from '../../i18n/usePluralT'
import useLang from '../../i18n/useLang'
import LocaleLink from '../../i18n/LocaleLink'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'
import asset from '../../utils/basePath'

// Fixed Georgia → Armenia → Azerbaijan order for the homepage Travel Blogs
// teaser (intentionally not the blog registry's own newest-first ordering).
const HOMEPAGE_BLOG_SLUGS = [
  'ultimate-guide-to-traveling-to-georgia',
  'ultimate-guide-to-traveling-to-armenia',
  'ultimate-guide-to-traveling-to-azerbaijan',
]

// "Explore the Caucasus" destination cards — each a real, published
// destination page (verified against src/App.jsx and src/data/places.js).
// Names are proper nouns and stay identical in every locale; only the
// City/Region type label (typeKey) is translated.
const EXPLORE_CARDS = [
  { to: '/georgia/tbilisi', image: '/images/files/old-town-tbilisi-georgia-1200.webp', name: 'Tbilisi', typeKey: 'pricing.city' },
  { to: '/armenia/yerevan', image: '/images/files/republic-square-yerevan-armenia-1200.webp', name: 'Yerevan', typeKey: 'pricing.city' },
  { to: '/azerbaijan/baku', image: '/images/files/baku-flame-towers-azerbaijan-1200.webp', name: 'Baku', typeKey: 'pricing.city' },
  { to: '/georgia/regions/svaneti', image: '/images/files/svaneti-caucasus-mountains-georgia-1200.webp', name: 'Svaneti', typeKey: 'search.typeRegion' },
  { to: '/georgia/regions/kakheti', image: '/images/files/Sighnaghi.jpg', name: 'Kakheti', typeKey: 'search.typeRegion' },
  { to: '/georgia/kazbegi', image: '/images/files/gergeti-trinity-church-kazbegi-georgia-1200.webp', name: 'Kazbegi (Stepantsminda)', typeKey: 'pricing.city' },
]

// Same fallback helper BlogPage.jsx/BlogArticlePage.jsx use: a ui.json key
// that resolves to itself (untranslated) falls back to the article's own
// English copy instead of printing the raw key.
function tf(t, key, fallback) {
  const val = t(key)
  return val === key ? fallback : val
}

// `extraTours` lets Armenia's panel surface the 10-Day Georgia and Armenia
// combined tour (country:"caucasus", so `featuredToursFor('armenia')` alone
// never returns it) without changing what Georgia/Caucasus show.
// `guideLink`/`destinationLink` add the blog-guide and destination-hub CTAs
// Armenia and Azerbaijan need so their tabs are never a dead end, while
// Georgia/Caucasus (which pass neither) render exactly as before.
function FeaturedCountryPanel({ country, comingSoonKey, t, tourTranslations, seeAllHref, seeAllLabel, extraTours = [], guideLink, destinationLink }) {
  const countryTours = [...featuredToursFor(country), ...extraTours]
  const hasLinks = Boolean(guideLink || destinationLink)

  if (!countryTours.length && !hasLinks) {
    return (
      <FadeUp>
        <p>{t(comingSoonKey)}</p>
        <p className="city-ttd-cta">
          <LocaleLink to="/contact" className="button">{t('home.requestItinerary')}</LocaleLink>
        </p>
      </FadeUp>
    )
  }
  return (
    <FadeUp>
      {countryTours.length > 0 ? (
        <div className="tours-grid">
          {countryTours.map((tour) => (
            <FeaturedTourTile key={tour.slug} tour={tour} t={t} tourTranslations={tourTranslations} />
          ))}
        </div>
      ) : (
        comingSoonKey && <p>{t(comingSoonKey)}</p>
      )}
      {(seeAllHref || hasLinks) && (
        <p className="city-ttd-cta">
          {seeAllHref && (
            <LocaleLink to={seeAllHref} className="button">{seeAllLabel}</LocaleLink>
          )}
          {guideLink && (
            <LocaleLink to={guideLink.to} className="button">{t('home.readTravelGuide')}</LocaleLink>
          )}
          {destinationLink && (
            <LocaleLink to={destinationLink.to} className="button">{t('home.exploreDestinations')}</LocaleLink>
          )}
        </p>
      )}
    </FadeUp>
  )
}

export default function HomePage() {
  const t = useT()
  const tCount = usePluralT()
  const { lang } = useLang()
  const { tourTranslations, loadTourTranslations } = useContext(I18nContext)
  const seo = getSEO('home', lang)
  useSEO({ ...seo, lang, image: '/images/files/georgia-home.jpg' })

  // Eagerly load tour translations for homepage tiles
  if (!tourTranslations) loadTourTranslations()

  const georgiaTourCount = privateTourCountFor('georgia')
  const destStatus = (country, combined = false) => {
    if (countryHasAnyTours(country)) {
      return tCount('home.destStatusTours', privateTourCountFor(country))
    }
    if (combined) return t('home.destStatusCombined')
    // Armenia/Azerbaijan have no standalone tours yet, but each has an
    // Ultimate Guide article — point visitors there instead of a dead end.
    return t('home.destStatusSoonWithGuide')
  }

  const groupTours = tours.filter((tour) => tour.type === 'group')
  // Available now (unlike a standalone Armenia tour), so it belongs on
  // Armenia's tab even though `featuredToursFor('armenia')` alone would never
  // surface a tour whose `country` is "caucasus".
  const georgiaArmeniaTour = tours.find((tour) => tour.slug === '10-day-georgia-armenia-tour')

  const featuredTabs = [
    {
      key: 'georgia',
      label: t('nav.destinations.georgia'),
      content: (
        <FeaturedCountryPanel
          country="georgia"
          t={t}
          tourTranslations={tourTranslations}
          seeAllHref="/private-tours"
          seeAllLabel={t('home.seeAllGeorgiaTours', { n: georgiaTourCount })}
        />
      ),
    },
    {
      key: 'armenia',
      label: t('nav.destinations.armenia'),
      content: (
        <FeaturedCountryPanel
          country="armenia"
          comingSoonKey="home.featuredComingSoonArmenia"
          t={t}
          tourTranslations={tourTranslations}
          extraTours={georgiaArmeniaTour ? [georgiaArmeniaTour] : []}
          guideLink={{ to: '/blog/ultimate-guide-to-traveling-to-armenia' }}
          destinationLink={{ to: '/armenia' }}
        />
      ),
    },
    {
      key: 'azerbaijan',
      label: t('nav.destinations.azerbaijan'),
      content: (
        <FeaturedCountryPanel
          country="azerbaijan"
          comingSoonKey="home.featuredComingSoonAzerbaijan"
          t={t}
          tourTranslations={tourTranslations}
          guideLink={{ to: '/blog/ultimate-guide-to-traveling-to-azerbaijan' }}
          destinationLink={{ to: '/azerbaijan' }}
        />
      ),
    },
    {
      key: 'caucasus',
      label: t('home.destCaucasus'),
      content: <FeaturedCountryPanel country="caucasus" comingSoonKey="home.featuredComingSoonCaucasus" t={t} tourTranslations={tourTranslations} />,
    },
  ]

  return (
    <>
      <HeroSection
        image="/images/files/Sighnaghi.jpg"
        title={t('home.heroTitle')}
        subtitle={t('home.heroSubtitle')}
        actions={(
          <>
            <div className="button">
              <LocaleLink to="/private-tours">{t('home.seeOurTours')}</LocaleLink>
            </div>
            <div className="button button--outline">
              <LocaleLink to="/contact">{t('home.ctaPlanTrip')}</LocaleLink>
            </div>
          </>
        )}
      />

      {/* Where do you want to go? — four destination cards, status line driven
          by the same tour-count check that gates the country hubs' noindex
          state and sitemap inclusion (privateTourCountFor/countryHasAnyTours
          in src/data/tours.js). */}
      <section className="home-items">
        <div className="tours-grid-container">
          <FadeUp>
            <h2>{t('home.whereToGoTitle')}</h2>
          </FadeUp>
          <FadeUp>
            <ul className="dest-hub-grid">
              <li>
                <DestinationCard
                  name={t('nav.destinations.georgia')}
                  image="/images/files/Sighnaghi.jpg"
                  to="/private-tours"
                  locationLine={destStatus('georgia')}
                  headingLevel="h3"
                />
              </li>
              <li>
                <DestinationCard
                  name={t('nav.destinations.armenia')}
                  image="/images/files/amberd-fortress-aragats-armenia-1086.webp"
                  to="/armenia"
                  locationLine={destStatus('armenia')}
                  headingLevel="h3"
                />
              </li>
              <li>
                <DestinationCard
                  name={t('nav.destinations.azerbaijan')}
                  image="/images/files/azerbaijan-home.jpg"
                  imageAlt={t('home.azerbaijanCardAlt')}
                  to="/azerbaijan"
                  locationLine={destStatus('azerbaijan')}
                  headingLevel="h3"
                />
              </li>
              <li>
                <DestinationCard
                  name={t('home.destCaucasus')}
                  image="/images/files/svaneti-caucasus-mountains-georgia-1200.webp"
                  to="/tours/caucasus"
                  locationLine={destStatus('caucasus', true)}
                  headingLevel="h3"
                />
              </li>
            </ul>
          </FadeUp>
        </div>
      </section>

      {/* Featured tours — country tabs. Georgia's panel is index 0, so it is
          the one baked into the static prerendered HTML (see CountryTabs.jsx
          — every panel always renders, only `hidden` toggles). */}
      <section className="home-items">
        <div className="tours-grid-container">
          <FadeUp>
            <h2>{t('home.featuredToursTitle')}</h2>
          </FadeUp>
          <CountryTabs tabs={featuredTabs} ariaLabel={t('home.featuredToursTitle')} />
        </div>
      </section>

      {/* Trust strip — three factual points plus a Tripadvisor link. No
          invented ratings, review counts or quotes here or anywhere else. */}
      <section className="home-items">
        <div className="home-items">
          <FadeUp>
            <h2>{t('home.trustTitle')}</h2>
          </FadeUp>
          <FadeUp>
            <ul className="home-trust-grid">
              <li className="home-trust-item">
                <strong>{t('home.trustItem1Title')}</strong>
                <p>{t('home.trustItem1Desc')}</p>
              </li>
              <li className="home-trust-item">
                <strong>{t('home.trustItem2Title')}</strong>
                <p>{t('home.trustItem2Desc')}</p>
              </li>
              <li className="home-trust-item">
                <strong>{t('home.trustItem3Title')}</strong>
                <p>{t('home.trustItem3Desc')}</p>
              </li>
            </ul>
          </FadeUp>
          <FadeUp>
            <p className="city-ttd-cta">
              <a
                href={contactInfo.tripadvisorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button"
              >
                {t('home.trustTripadvisorLink')}
              </a>
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Scheduled group departures — one card per group tour (currently one),
          so future Armenia/Azerbaijan/Caucasus departures appear automatically. */}
      <section className="home-items">
        <div className="tour-listing" style={{ background: 'none', maxWidth: '1600px' }}>
          <FadeUp>
            <h2>{t('home.groupDeparturesTitle')}</h2>
          </FadeUp>
          {groupTours.map((groupTour) => {
            const tt = tourTranslations?.[groupTour.slug]
            return (
              <FadeUp key={groupTour.slug}>
                <div className="tour-item tour-item-card">
                  <LocaleLink
                    to={`/group-tours/${groupTour.slug}`}
                    className="tour-image-link"
                    aria-label={tt?.title || groupTour.title}
                  >
                    <CardImage
                      src={groupTour.listingImage || groupTour.heroImage}
                      className="tour-image"
                    >
                      <div className="tour-image-scrim" aria-hidden="true" />
                    </CardImage>
                  </LocaleLink>
                  <div className="tour-info">
                    <h2>
                      <LocaleLink to={`/group-tours/${groupTour.slug}`}>{tt?.title || groupTour.title}</LocaleLink>
                    </h2>
                    <h3>{groupTour.days} {t('tour.days')}</h3>
                    <p>{tt?.listingDescription || tt?.description || groupTour.listingDescription || groupTour.description}</p>
                    <div className="more">
                      <LocaleLink to={`/group-tours/${groupTour.slug}`}>{t('tour.moreInfo')}</LocaleLink>
                    </div>
                  </div>
                  <div className="tour-data">
                    {groupTour.groupDates && (
                      <>
                        <div className="available">{t('tour.availableDates')}</div>
                        <div className="date-chips">
                          {/* Sold-out departures stay visible on the tour page
                              (flagged there) but are dropped from this card, so
                              it only ever advertises bookable dates. */}
                          {groupTour.groupDates
                            .filter((d) => !d.soldOut)
                            .map((d, i) => (
                            <div key={i} className="date-chip">
                              <span className="date-range">{d.start} – {d.end}</span>
                              <span className="date-year">{d.year}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {groupTour.pricePerPerson && (
                      <div className="tour-data-price">{t('tour.perPerson', { price: groupTour.pricePerPerson })}</div>
                    )}
                  </div>
                </div>
              </FadeUp>
            )
          })}
          <FadeUp>
            <p className="city-ttd-cta">
              <LocaleLink to="/group-tours" className="button">{t('home.allGroupTours')}</LocaleLink>
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Shuttle Service — compact standalone service block (Build Your Own
          Trip removed per owner request; content not moved elsewhere). The
          three-item benefits list was later swapped for a photo (the same
          hero image the Shuttle Service page itself uses) per owner request. */}
      <section className="home-items">
        <div className="home-shuttle-card">
          <CardImage
            src="/images/files/taxi-service.jpg"
            alt={t('home.shuttleImageAlt')}
            className="home-shuttle-card__image"
          />
          <div className="home-shuttle-card__body">
            <FadeUp>
              <h2>{t('home.shuttleTitle')}</h2>
            </FadeUp>
            <p>{t('home.shuttleText')}</p>
            <FadeUp>
              <div className="button">
                <LocaleLink to="/shuttle-service">{t('home.shuttleLink')}</LocaleLink>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Explore the Caucasus — destination guides, not tours. Reuses the
          exact same DestinationCard/.dest-hub-grid the "Where do you want to
          go?" section above uses, just with six place-level cards instead of
          four country-level ones. */}
      <section className="home-items">
        <div className="tours-grid-container">
          <FadeUp>
            <h2>{t('home.exploreCaucasusTitle')}</h2>
            <p className="blog-intro">{t('home.exploreCaucasusIntro')}</p>
          </FadeUp>
          <FadeUp>
            <ul className="dest-hub-grid">
              {EXPLORE_CARDS.map((c) => (
                <li key={c.to}>
                  <DestinationCard
                    name={c.name}
                    image={c.image}
                    imageAlt={`${c.name} — ${t(c.typeKey)}`}
                    to={c.to}
                    locationLine={t(c.typeKey)}
                    headingLevel="h3"
                  />
                </li>
              ))}
            </ul>
          </FadeUp>
          <FadeUp>
            <p className="city-ttd-cta">
              <LocaleLink to="/georgia" className="button">{t('home.exploreAllGeorgia')}</LocaleLink>
              <LocaleLink to="/armenia" className="button">{t('home.exploreAllArmenia')}</LocaleLink>
              <LocaleLink to="/azerbaijan" className="button">{t('home.exploreAllAzerbaijan')}</LocaleLink>
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Travel Blogs — replaces the "What our travelers say" testimonials
          section per owner request. Reuses the exact card markup and CSS
          BlogArticlePage's "Related Articles" row already ships
          (.blog-related__grid/__card), so this teaser matches the site's
          established blog-card design instead of inventing a new one. Fixed
          Georgia → Armenia → Azerbaijan order, not the registry's own
          newest-first sort. */}
      <section className="blog-article blog-related">
        <FadeUp>
          <h2 className="blog-related__heading">{tf(t, 'blog.heroTitle', 'Travel Blogs')}</h2>
          <p className="blog-intro">{tf(t, 'home.blogsIntro', 'Practical guides to planning your journey through Georgia, Armenia and Azerbaijan.')}</p>
          <div className="blog-related__grid">
            {HOMEPAGE_BLOG_SLUGS.map((slug) => {
              const a = blogArticles.find((x) => x.slug === slug)
              if (!a) return null
              const title = tf(t, a.titleKey, a.title)
              const excerpt = a.descKey ? tf(t, a.descKey, a.excerpt) : a.excerpt
              return (
                <LocaleLink key={a.slug} to={`/blog/${a.slug}`} className="blog-related__card">
                  <div className="blog-related__card-img-wrap">
                    <img src={asset(a.thumbnail)} alt={title} className="blog-related__card-img" loading="lazy" />
                  </div>
                  <div className="blog-related__card-body">
                    <h3 className="blog-related__card-title">{title}</h3>
                    <p className="blog-related__card-excerpt">{excerpt}</p>
                  </div>
                </LocaleLink>
              )
            })}
          </div>
          <p className="city-ttd-cta">
            <LocaleLink to="/blog" className="button">{t('home.viewAllTravelBlogs')}</LocaleLink>
          </p>
        </FadeUp>
      </section>

      {/* How a private tour works — three steps, directly above Get in Touch. */}
      <section className="home-items">
        <div className="tours-grid-container">
          <FadeUp>
            <h2>{t('home.howItWorksTitle')}</h2>
          </FadeUp>
          <FadeUp>
            <ol className="home-howit-grid">
              <li className="home-howit-step">
                <span className="home-howit-step__num" aria-hidden="true">1</span>
                <strong>{t('home.howStep1Title')}</strong>
                <p>{t('home.howStep1Desc')}</p>
              </li>
              <li className="home-howit-step">
                <span className="home-howit-step__num" aria-hidden="true">2</span>
                <strong>{t('home.howStep2Title')}</strong>
                <p>{t('home.howStep2Desc')}</p>
              </li>
              <li className="home-howit-step">
                <span className="home-howit-step__num" aria-hidden="true">3</span>
                <strong>{t('home.howStep3Title')}</strong>
                <p>{t('home.howStep3Desc')}</p>
              </li>
            </ol>
          </FadeUp>
        </div>
      </section>

      <section className="home-items">
        <div className="home-items">
          <FadeUp>
            <h2>{t('home.contactTitle')}</h2>
          </FadeUp>
          <ContactForm />
        </div>
      </section>
    </>
  )
}
