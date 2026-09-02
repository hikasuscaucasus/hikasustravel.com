import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'

/**
 * Visible breadcrumb trail for destination pages.
 * `trail` = [{ name, to }] — the last item is the current page and should omit `to`.
 * Links are language-prefixed via LocaleLink, so they always point at the
 * matching language version. JSON-LD BreadcrumbList is emitted separately by
 * each page (it reuses the same localized names).
 */
export default function Breadcrumbs({ trail }) {
  const t = useT()
  if (!trail || trail.length === 0) return null
  return (
    <nav className="breadcrumbs" aria-label={t('a11y.breadcrumb')}>
      <ol>
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1
          return (
            <li key={i}>
              {crumb.to && !isLast ? (
                <LocaleLink to={crumb.to}>{crumb.name}</LocaleLink>
              ) : (
                <span aria-current={isLast ? 'page' : undefined}>{crumb.name}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
