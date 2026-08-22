import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import { privateTourCollectionPages } from '../../data/privateTourCollections'

/**
 * The two groups of collection links under the Search/Sort controls on
 * /private-tours, replacing the old "Tours From" and "Tour Categories"
 * dropdowns.
 *
 * These are real crawlable <a> links to indexable landing pages — not
 * client-side filters — so each one is a genuine entry point for search.
 */
export default function PrivateTourCollectionLinks() {
  const t = useT()
  const origins = privateTourCollectionPages.filter((c) => c.kind === 'origin')
  const categories = privateTourCollectionPages.filter((c) => c.kind === 'category')

  const group = (headingKey, items) => items.length > 0 && (
    <div className="ptc-links__group">
      <h2 className="ptc-links__heading">{t(headingKey)}</h2>
      <div className="ptc-links__chips">
        {items.map((c) => (
          <LocaleLink key={c.slug} to={`/${c.path}`} className="ptc-chip">
            {t(c.labelKey)}
          </LocaleLink>
        ))}
      </div>
    </div>
  )

  return (
    <section className="ptc-links" aria-label={t('tour.tourCategories')}>
      {group('tour.toursFrom', origins)}
      {group('tour.tourCategories', categories)}
    </section>
  )
}
