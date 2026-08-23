import { useRef } from 'react'
import asset from '../../utils/basePath'

// Build the hero background value. Default to a plain url() so every browser
// shows the WebP; when an AVIF variant is supplied and the browser supports
// CSS image-set(), upgrade to it so AVIF-capable browsers get the smaller file.
// The hero is a CSS background (not an <img>), so image-set() is where the
// responsive/AVIF handling lives.
function heroBackground(image, imageAvif) {
  const webp = `url(${asset(image)})`
  if (!imageAvif) return webp
  const imageSet = `image-set(url("${asset(imageAvif)}") type("image/avif"), url("${asset(image)}") type("image/webp"))`
  // The build-time render has no CSS engine to ask, so it emits image-set() —
  // what every browser with image-set() support produces on its own first
  // render, which is what keeps the static HTML and hydration identical (and
  // means the AVIF is the hero's first paint rather than a post-hydration swap).
  // A browser without support still downgrades itself here on that first render.
  if (typeof window === 'undefined') return imageSet
  return window.CSS?.supports?.('background-image', imageSet) ? imageSet : webp
}

// Build one srcset line from the width ladder a packaged image ships with.
const srcSetFor = (base, widths, ext) =>
  widths.map((w) => `${asset(`${base}-${w}.${ext}`)} ${w}w`).join(', ')

export default function HeroSection({ image, imageAvif, title, className = '', isTaxi = false, bgClass = '', infographic = null }) {
  const sectionRef = useRef(null)

  const scrollToNext = () => {
    const next = sectionRef.current?.nextElementSibling
    if (next) next.scrollIntoView({ behavior: 'smooth' })
  }

  // An infographic hero is read, not just looked at: a chart cover-cropped into
  // the 100dvh background above would clip letters at every viewport, and the
  // 35% scrim `.coverme` paints would sit on top of them. So this variant is a
  // real <picture> at the image's own aspect ratio — nothing to crop, nothing
  // to clip — with the title below it instead of over it. Opt-in per article;
  // every other hero still takes the branch below.
  if (infographic) {
    const { base, widths, src, sizes, width, height, alt } = infographic
    return (
      <section ref={sectionRef} className={`hero--infographic ${className}`}>
        <picture>
          <source type="image/avif" srcSet={srcSetFor(base, widths, 'avif')} sizes={sizes} />
          <source type="image/webp" srcSet={srcSetFor(base, widths, 'webp')} sizes={sizes} />
          <img
            className="hero--infographic__img"
            src={asset(src)}
            width={width}
            height={height}
            alt={alt}
            loading="eager"
            fetchPriority="high"
          />
        </picture>
        <div className="hero--infographic__title">
          <h1>{title}</h1>
        </div>
      </section>
    )
  }

  // A page may supply its own background via a CSS class (`bgClass`) — used when
  // the hero needs a responsive image-set() ladder and/or a non-default
  // background-position that an inline single-width background can't express
  // (e.g. `.hero--juta`). In that case we omit the inline background-image so the
  // class fully controls it; every other hero is unchanged (bgClass = '').
  return (
    <section
      ref={sectionRef}
      className={`fullscreen coverme ${isTaxi ? 'taxi-item' : ''} ${bgClass} ${className}`}
      style={bgClass ? undefined : { backgroundImage: heroBackground(image, imageAvif) }}
    >
      <div className="hometop-item">
        <h1 className={isTaxi ? 'taxiH1' : ''}>{title}</h1>
      </div>
      <div
        className={`arrow-down${isTaxi ? ' taxi-arrow' : ''}`}
        onClick={scrollToNext}
        role="button"
        aria-label="Scroll down"
      ></div>
    </section>
  )
}
