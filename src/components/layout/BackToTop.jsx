import useScrollPosition from '../../hooks/useScrollPosition'
import useT from '../../i18n/useT'

export default function BackToTop() {
  const t = useT()
  const scrollY = useScrollPosition()
  // `typeof window` guard for the build-time render, which has no window. The
  // result is the same either way on the first render — scrollY starts at 0, so
  // the button is hidden — which is exactly what hydration needs to match.
  const isVisible = typeof window !== 'undefined' && scrollY > window.innerHeight * 1.2

  const handleClick = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={`backtotop${isVisible ? ' visible' : ''}`}>
      <a href="#" onClick={handleClick}>{t('a11y.backToTop')}</a>
    </div>
  )
}
