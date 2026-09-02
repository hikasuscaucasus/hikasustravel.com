import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import useT from '../../i18n/useT'

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function OriginIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function BulletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  )
}

export default function DishModal({ dish, lang, onClose }) {
  const t = useT()
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  if (!dish) return null

  const name = dish.name[lang] || dish.name.en
  const origin = dish.origin[lang] || dish.origin.en
  const story = dish.story[lang] || dish.story.en
  const funFacts = dish.funFacts[lang] || dish.funFacts.en
  const ingredients = dish.ingredients[lang] || dish.ingredients.en

  return createPortal(
    <div className="hotel-modal-backdrop" onClick={onClose}>
      <div className="dish-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={name}>
        <button className="dish-modal__close" onClick={onClose} aria-label={t('hotel.close')}>
          <CloseIcon />
        </button>
        <div className="dish-modal__layout">
          <div className="dish-modal__hero">
            <img src={dish.image} alt={name} className="dish-modal__img" />
          </div>

          <div className="dish-modal__body">
            <h3 className="dish-modal__name">{name}</h3>
            <div className="dish-modal__origin">
              <OriginIcon />
              <span>{origin}</span>
            </div>

            <div className="dish-modal__story">
              {story.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="dish-modal__section">
              <h4 className="dish-modal__section-title">{
                { en: 'Fun Facts', es: 'Datos curiosos', fr: 'Anecdotes', de: 'Wissenswertes', pl: 'Ciekawostki', cs: 'Zajímavosti', nl: 'Weetjes' }[lang] || 'Fun Facts'
              }</h4>
              <ul className="dish-modal__facts">
                {funFacts.map((fact, i) => (
                  <li key={i}>
                    <BulletIcon />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="dish-modal__section">
              <h4 className="dish-modal__section-title">{
                { en: 'Key Ingredients', es: 'Ingredientes clave', fr: 'Ingrédients clés', de: 'Hauptzutaten', pl: 'Kluczowe składniki', cs: 'Klíčové ingredience', nl: 'Belangrijkste ingrediënten' }[lang] || 'Key Ingredients'
              }</h4>
              <div className="dish-modal__ingredients">
                {ingredients.map((item, i) => (
                  <span key={i} className="dish-modal__ingredient">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
