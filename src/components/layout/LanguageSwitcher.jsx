import { useState, useRef, useEffect } from 'react'
import useLang from '../../i18n/useLang'
import useT from '../../i18n/useT'

export default function LanguageSwitcher() {
  const t = useT()
  const { lang, setLang, languages } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = languages.find((l) => l.code === lang)

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        className="lang-switcher-btn"
        onClick={() => setOpen(!open)}
        aria-label={t('a11y.changeLanguage')}
      >
        {current?.code.toUpperCase()}
      </button>
      {open && (
        <div className="lang-switcher-dropdown">
          {languages.map((l) => (
            <button
              key={l.code}
              className={`lang-option${l.code === lang ? ' active' : ''}`}
              onClick={() => { setLang(l.code); setOpen(false) }}
            >
              <span className="lang-code">{l.code.toUpperCase()}</span>
              <span className="lang-native">{l.nativeLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
