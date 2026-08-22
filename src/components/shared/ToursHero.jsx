import { useRef } from 'react'
import asset from '../../utils/basePath'
import useT from '../../i18n/useT'

export default function ToursHero({
  image,
  title,
  subtitle,
  tourCount,
  searchValue = '',
  onSearchChange,
  sortValue = '',
  onSortChange,
}) {
  const sectionRef = useRef(null)
  const t = useT()

  const scrollToNext = () => {
    const next = sectionRef.current?.nextElementSibling
    if (next) next.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={sectionRef}
      className="th"
      style={{ backgroundImage: `url(${asset(image)})` }}
    >
      <div className="th__overlay" aria-hidden="true" />

      <div className="th__center">
        <h1 className="th__title">{title}</h1>

        {subtitle && (
          <p className="th__subtitle">{subtitle}</p>
        )}

        {(onSearchChange || onSortChange) && (
          <div className="th__actions">
            {onSearchChange && (
              <div className="th__search-wrap">
                <svg className="th__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="search"
                  className="th__search"
                  placeholder={t('tour.searchPlaceholder')}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  aria-label={t('tour.searchPlaceholder')}
                />
              </div>
            )}
            {onSortChange && (
              <div className="th__sort-wrap">
                <select
                  className="th__sort"
                  value={sortValue}
                  onChange={(e) => onSortChange(e.target.value)}
                  aria-label={t('tour.sortBy')}
                >
                  <option value="">{t('tour.sortBy')}</option>
                  <option value="days-asc">{t('tour.sortDuration')} ↑</option>
                  <option value="days-desc">{t('tour.sortDuration')} ↓</option>
                  <option value="name">{t('tour.sortName')}</option>
                </select>
              </div>
            )}
          </div>
        )}

        {typeof tourCount === 'number' && (
          <p className="th__count">
            {tourCount} {tourCount === 1 ? 'tour' : 'tours'}
          </p>
        )}
      </div>

      <button
        className="th__scroll"
        onClick={scrollToNext}
        type="button"
        aria-label="Scroll down"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </section>
  )
}
