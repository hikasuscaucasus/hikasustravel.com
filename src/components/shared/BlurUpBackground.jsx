import { useState } from 'react'
import useIntersectionObserver from '../../hooks/useIntersectionObserver'
import asset from '../../utils/basePath'

/**
 * Build a CSS `background-image` value safely.
 *
 * ⚠️ A CSS `url()` is a TOKEN, not a string: an *unquoted* url() may not contain
 * unescaped parentheses. This component used to interpolate the path raw —
 * `url(${src})` — so a perfectly valid file like
 * `/images/files/Qvevri%20(Clay%20Vessels).jpg` produced
 * `url(/images/files/Qvevri%20(Clay%20Vessels).jpg)`, which the CSS parser
 * rejects, dropping the WHOLE declaration. The card then painted as an empty
 * block. The lightbox was unaffected because it renders a real `<img src>`,
 * which is why the photo only appeared once you expanded it.
 *
 * Quoting makes parentheses, spaces and commas legal; the escape covers the
 * only characters that could still break out of the quotes.
 *
 * Returns `undefined` for an empty path so the caller omits `background-image`
 * entirely — `url("")` would resolve against the current document and make the
 * browser fetch the HTML page as an image.
 */
const cssUrl = (u) => (u ? `url("${String(u).replace(/["\\]/g, '\\$&')}")` : undefined)

/**
 * `position` anchors the cover crop, exactly like CSS `background-position`.
 *
 * It has to be a prop rather than a stylesheet rule because the value below is
 * an INLINE style, and an inline style beats any class selector. Defaults to
 * 'center', so every existing caller renders byte-identically.
 *
 * Needed for PORTRAIT card images: a 3:4 frame in the 4:3 `.tc__img` box keeps
 * only 56% of its height, so a centred crop can cut the subject out entirely
 * (Martvili Canyon loses its water). Tours opt in via `tour.cardPosition`.
 */
export default function BlurUpBackground({ src, thumbSrc, className = '', style = {}, position = 'center', children }) {
  const [ref, isIntersecting] = useIntersectionObserver()
  const [loaded, setLoaded] = useState(false)

  const fullSrc = asset(src)
  const thumb = thumbSrc ? asset(thumbSrc) : (src ? asset(src.replace('/images/files/', '/images/files-thumb/')) : '')

  return (
    <div
      ref={ref}
      className={`${className}`}
      style={{
        ...style,
        backgroundImage: loaded ? cssUrl(fullSrc) : cssUrl(thumb),
        backgroundSize: 'cover',
        backgroundPosition: position,
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      {isIntersecting && !loaded && (
        <img
          src={fullSrc}
          alt=""
          style={{ display: 'none' }}
          onLoad={() => setLoaded(true)}
        />
      )}
      {children}
    </div>
  )
}
