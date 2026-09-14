import { useContext } from 'react'
import HeroSection from '../shared/HeroSection'
import FadeUp from '../shared/FadeUp'
import CardImage from '../shared/CardImage'
import DestinationCard from '../shared/DestinationCard'
import CountryTabs from '../shared/CountryTabs'
import ContactForm from '../shared/ContactForm'
import { tours, privateTourCountFor, countryHasAnyTours, featuredToursFor } from '../../data/tours'
import { blogArticles } from '../../data/blogData'
import useT from '../../i18n/useT'
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

// Same fallback helper BlogPage.jsx/BlogArticlePage.jsx use: a ui.json key
// that resolves to itself (untranslated) falls back to the article's own
// English copy instead of printing the raw key.
function tf(t, key, fallback) {
  const val = t(key)
  return val === key ? fallback : val
}

function FeaturedTourTile({ tour, t, tourTranslations }) {
  const tt = tourTranslations?.[tour.slug]
  const classicRow = tour.pricing?.find((r) => r.travelers === '4')
  const classicNum = classicRow ? parseFloat((classicRow.economy || '').replace(/[^0-9.]/g, '')) : NaN
  const priceFrom = !isNaN(classicNum) && classicNum > 0 ? `€${classicNum.toLocaleString('en-US')}` : null
  const basePath = tour.type === 'group' ? 'group-tours' : 'private-tours'
  return (
    <div className="tour-tile">
      <LocaleLink to={`/${basePath}/${tour.slug}`} className="tour-tile-link">
        <CardImage
          src={tour.tileImage || tour.heroImage}
          position={tour.cardPosition}
          className="tour-tile-image"
        />
        <div className="tour-tile-overlay">
          <h3>{tt?.title || tour.title}</h3>
          <p>{tour.days} {t('tour.days')}</p>
          {priceFrom && (
            <p className="tour-tile-overlay__price">{t('tour.pricesFrom', { price: priceFrom })}</p>
          )}
        </div>
      </LocaleLink>
    </div>
  )
}

function FeaturedCountryPanel({ country, comingSoonKey, t, tourTranslations, seeAllHref, seeAllLabel }) {
  const countryTours = featuredToursFor(country)
  if (!countryTours.length) {
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
      <div className="tours-grid">
        {countryTours.map((tour) => (
          <FeaturedTourTile key={tour.slug} tour={tour} t={t} tourTranslations={tourTranslations} />
        ))}
      </div>
      {seeAllHref && (
        <p className="city-ttd-cta">
          <LocaleLink to={seeAllHref} className="button">{seeAllLabel}</LocaleLink>
        </p>
      )}
    </FadeUp>
  )
}

export default function HomePage() {
  const t = useT()
  const { lang } = useLang()
  const { tourTranslations, loadTourTranslations } = useContext(I18nContext)
  const seo = getSEO('home', lang)
  useSEO({ ...seo, lang, image: '/images/files/georgia-home.jpg' })

  // Eagerly load tour translations for homepage tiles
  if (!tourTranslations) loadTourTranslations()

  const georgiaTourCount = privateTourCountFor('georgia')
  const destStatus = (country, combined = false) => {
    if (countryHasAnyTours(country)) {
      return t('home.destStatusTours', { n: privateTourCountFor(country) })
    }
    return combined ? t('home.destStatusCombined') : t('home.destStatusComingSoon')
  }

  const groupTours = tours.filter((tour) => tour.type === 'group')

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
      content: <FeaturedCountryPanel country="armenia" comingSoonKey="home.featuredComingSoonArmenia" t={t} tourTranslations={tourTranslations} />,
    },
    {
      key: 'azerbaijan',
      label: t('nav.destinations.azerbaijan'),
      content: <FeaturedCountryPanel country="azerbaijan" comingSoonKey="home.featuredComingSoonAzerbaijan" t={t} tourTranslations={tourTranslations} />,
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
          <div className="button">
            <LocaleLink to="/contact">{t('home.ctaPlanTrip')}</LocaleLink>
          </div>
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
                  to="/tours/armenia"
                  locationLine={destStatus('armenia')}
                  headingLevel="h3"
                />
              </li>
              <li>
                <DestinationCard
                  name={t('nav.destinations.azerbaijan')}
                  image="/images/files/azerbaijan-home.jpg"
                  imageAlt={t('home.azerbaijanCardAlt')}
                  to="/tours/azerbaijan"
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
        </FadeUp>
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
