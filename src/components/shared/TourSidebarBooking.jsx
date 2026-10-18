import useT from '../../i18n/useT'
import { formatPrice } from './pricingUtils'

export default function TourSidebarBooking({ tour, startingPrice, isGroup }) {
  const t = useT()

  const scrollToBook = (e) => {
    e.preventDefault()
    const el = document.getElementById('book')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="td-sidebar">
        <div className="td-sidebar__card">
          {startingPrice && (
            <div className="td-sidebar__price-block">
              <span className="td-sidebar__price-label">{t('sidebar.startingFrom')}</span>
              <span className="td-sidebar__price">{formatPrice(startingPrice)}</span>
              <span className="td-sidebar__price-pp">{t('pricing.perPerson')}</span>
            </div>
          )}

          <div className="td-sidebar__badges">
            {tour.days && (
              <span className="td-sidebar__badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                {tour.days} {t('tour.days')}
              </span>
            )}
            <span className="td-sidebar__badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              {isGroup ? t('tour.groupTours') : t('tour.privateTours')}
            </span>
          </div>

          <a href="#book" onClick={scrollToBook} className="td-sidebar__submit">
            {t('tour.requestThisTour')}
          </a>

          <p className="td-sidebar__trust">{t('tour.trustReply')}</p>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <div className="td-mobile-bar">
        {startingPrice && (
          <div className="td-mobile-bar__price">
            <span className="td-mobile-bar__price-label">{t('sidebar.startingFrom')}</span>
            <span className="td-mobile-bar__price-value">{formatPrice(startingPrice)} <small>{t('pricing.perPerson')}</small></span>
          </div>
        )}
        <a href="#book" onClick={scrollToBook} className="td-mobile-bar__cta">
          {t('tour.requestThisTour')}
        </a>
      </div>
    </>
  )
}
