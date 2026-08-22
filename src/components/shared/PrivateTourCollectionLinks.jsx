import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import { privateTourCollectionPages } from '../../data/privateTourCollections'

/**
 * Crawlable links to the Private Tours collection pages.
 *
 * These are real <a> links to indexable landing pages — not client-side
 * filters — so each subset is a genuine entry point for search.
 *
 * variant "hub"  (/private-tours): both groups, with visible headings, in place
 *                of the old "Tours From" and "Tour Categories" dropdowns.
 * variant "home" (homepage Private Tours section): the six CATEGORIES only,
 *                compact and unheaded so it stays secondary to the section's
 *                own h2 and to the tour cards. The starting-point links are
 *                deliberately left off the homepage.
 */
export default function PrivateTourCollectionLinks({ variant = 'hub' }) {
  const t = useT()
  const origins = privateTourCollectionPages.filter((c) => c.kind === 'origin')
  const categories = privateTourCollectionPages.filter((c) => c.kind === 'category')

  const chips = (items) => (
    <div className="ptc-links__chips">
      {items.map((c) => (
        <LocaleLink key={c.slug} to={`/${c.path}`} className="ptc-chip">
          {t(c.labelKey)}
        </LocaleLink>
      ))}
    </div>
  )

  if (variant === 'home') {
    if (!categories.length) return null
    // No visible heading: the section's "Private Tours" h2 sits directly above,
    // so an aria-label carries the context without a second heading.
    return (
      <nav className="ptc-links ptc-links--home" aria-label={t('tour.tourCategories')}>
        {chips(categories)}
      </nav>
    )
  }

  const group = (headingKey, items) => items.length > 0 && (
    <div className="ptc-links__group">
      <h2 className="ptc-links__heading">{t(headingKey)}</h2>
      {chips(items)}
    </div>
  )

  return (
    <section className="ptc-links" aria-label={t('tour.tourCategories')}>
      {group('tour.toursFrom', origins)}
      {group('tour.tourCategories', categories)}
    </section>
  )
}
