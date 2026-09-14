import LocaleLink from '../../i18n/LocaleLink'
import BlurUpBackground from './BlurUpBackground'

/**
 * One card in a destination listing.
 *
 * Extracted verbatim from DestinationHub's own `<li className="dest-hub-card">`
 * markup so a second surface can render the SAME card instead of copying it.
 * The first such surface is the featured-city strip on the Armenia country
 * landing page, which used to be a row of square photo tiles: with only two of
 * its eleven cities photographed, tiles meant nine brand-tone blocks and no
 * room for the one-line summary each city already has. The hub card carries a
 * title, that summary and an optional cover, and degrades to text when there is
 * no photograph — which is exactly what the Armenia Cities hub already does.
 *
 * The markup is unchanged from the hub's, so every existing hub renders
 * byte-identically; the only additions are opt-in props:
 *
 *   `headingLevel` — 'h2' (hub default) or 'h3'. The landing strip sits under a
 *     "Featured city guides" <h2>, so its cards must be one level deeper or the
 *     build's heading-skip audit is right to complain.
 *   `locationLine` / `ctaLabel` / `soonLabel` — passed already resolved, so this
 *     component needs no translation context of its own.
 *
 * An entry with `to` renders as a link; one without renders the "coming soon"
 * card, same as the hub.
 */
export default function DestinationCard({
  name,
  description,
  image,
  imageAlt = '',
  imagePosition = 'center',
  to,
  locationLine = '',
  ctaLabel = '',
  soonLabel = '',
  headingLevel = 'h2',
}) {
  const Heading = headingLevel
  // The cover has to bleed to the card's edges, but the padding lives on the
  // link/pending element itself, so the image is pulled out with negative
  // margins and the modifier drops the now-redundant top padding.
  const cls = (base) => (image ? `${base} ${base}--media` : base)
  const cover = image
    ? <BlurUpBackground src={image} imageAlt={imageAlt} position={imagePosition} className="dest-hub-card__image" />
    : null
  const body = (
    <>
      {cover}
      <Heading>{name}</Heading>
      {locationLine && <span className="dest-hub-card__loc">{locationLine}</span>}
      {description && <p>{description}</p>}
    </>
  )

  return to ? (
    <LocaleLink to={to} className={cls('dest-hub-card__link')}>
      {body}
      {ctaLabel && <span className="dest-hub-card__cta">{ctaLabel}</span>}
    </LocaleLink>
  ) : (
    <div className={cls('dest-hub-card__pending')}>
      {body}
      {soonLabel && <span className="dest-hub-card__soon">{soonLabel}</span>}
    </div>
  )
}
