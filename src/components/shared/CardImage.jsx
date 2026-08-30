import { useState } from 'react'
import asset from '../../utils/basePath'

/**
 * A tour card's cover photo as a real <img>.
 *
 * The cards used to paint their covers with <BlurUpBackground>, a CSS
 * background on a <div>. That renders nothing a crawler can see: view-source on
 * the homepage and both tour listings showed cards with no image markup at all.
 * This component keeps the same blur-up behaviour — the small
 * /images/files-thumb/ twin sits behind as a background until the full file
 * paints — but puts the photograph in the served HTML. Native `loading="lazy"`
 * replaces the IntersectionObserver the background version needed, which is
 * exactly what lets the markup be static.
 *
 * `alt` defaults to empty on purpose. The card data carries no alt copy for
 * these covers, and writing some would be inventing content, which this phase
 * forbids. Every call site wraps the image in a link that already has its own
 * accessible name (an aria-label, or the card title inside the same anchor), so
 * an empty alt is the correct decorative-image pattern rather than a gap: the
 * link is announced once, by its name, instead of twice. Supplying real alt
 * copy is a content task and is listed for the owner.
 *
 * No srcset: these covers are single files with no width ladder in the image
 * pipeline, and generating renditions is not a design-phase change. The box
 * geometry comes from the existing card CSS, so there is no layout shift.
 */
const cssUrl = (u) => (u ? `url("${String(u).replace(/["\\]/g, '\\$&')}")` : undefined)

export default function CardImage({
  src,
  alt = '',
  position = 'center',
  className = '',
  style = {},
  eager = false,
  children,
}) {
  const [loaded, setLoaded] = useState(false)

  const fullSrc = asset(src)
  const thumb = src ? asset(src.replace('/images/files/', '/images/files-thumb/')) : ''

  return (
    <div
      className={className}
      style={{
        ...style,
        // The thumb stays behind the photo until it has painted, so the card
        // never flashes an empty box. Dropped once loaded so the browser is not
        // holding two decoded images per card.
        backgroundImage: loaded ? undefined : cssUrl(thumb),
        backgroundSize: 'cover',
        backgroundPosition: position,
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      <img
        className="card-img"
        src={fullSrc}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        style={{ objectPosition: position }}
      />
      {children}
    </div>
  )
}
