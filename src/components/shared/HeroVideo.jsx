import { useCallback, useEffect, useRef, useState } from 'react'
import asset from '../../utils/basePath'
import useT from '../../i18n/useT'

// Opt-in background video for a hero (currently the home page only).
//
// The poster is NOT handled here: it is a CSS background chosen with the same
// media queries as below (see `.hero--home-video` in styles.css), so the static
// HTML already paints the right poster and the browser can preload it. This
// component only decides, after mount, whether a video may play at all and which
// ONE file set to fetch. It renders nothing on the server and on the first client
// render, so the prerendered HTML and hydration always match.

// Keep these in sync with the poster rules in styles.css and the preload links
// emitted by scripts/prerender.js.
const Q_PORTRAIT = '(orientation: portrait)'
const Q_TABLET = '(max-width: 1023.98px)'

const pickSet = () => {
  if (window.matchMedia(Q_PORTRAIT).matches) return 'mobile'
  if (window.matchMedia(Q_TABLET).matches) return 'tablet'
  return 'desktop'
}

// Poster only: reduced motion, Save-Data, or a 2G-class connection.
const videoAllowed = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const c = navigator.connection
  if (c && (c.saveData === true || c.effectiveType === 'slow-2g' || c.effectiveType === '2g')) return false
  return true
}

export default function HeroVideo({ dir, name }) {
  const t = useT()
  const videoRef = useRef(null)
  const startedRef = useRef(false)
  const userPausedRef = useRef(false)
  const [set, setSet] = useState(null)
  const [failed, setFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)

  // Decide eligibility and the file set after mount (never during render).
  useEffect(() => {
    if (!videoAllowed()) return undefined
    setSet(pickSet())
    // Before the video has started, follow a rotation/resize across a threshold;
    // once it is playing keep the file already downloaded (no second download).
    const queries = [window.matchMedia(Q_PORTRAIT), window.matchMedia(Q_TABLET)]
    const onChange = () => { if (!startedRef.current) setSet(pickSet()) }
    queries.forEach((q) => q.addEventListener?.('change', onChange))
    return () => queries.forEach((q) => q.removeEventListener?.('change', onChange))
  }, [])

  // `muted` must be in effect before play() or iOS Safari refuses to autoplay,
  // and React does not reliably write the attribute, so set it explicitly.
  const attachVideo = useCallback((el) => {
    videoRef.current = el
    if (!el) return
    el.defaultMuted = true
    el.muted = true
    el.setAttribute('muted', '')
    el.setAttribute('playsinline', '')
  }, [])

  // Start playback and keep it paused while the hero is off screen or the tab is hidden.
  useEffect(() => {
    const video = videoRef.current
    if (!set || !video) return undefined
    let inView = true
    const sync = () => {
      if (userPausedRef.current) return
      if (inView && !document.hidden) video.play()?.catch(() => {})
      else video.pause()
    }
    const onPlaying = () => { startedRef.current = true; setPlaying(true) }
    video.addEventListener('playing', onPlaying)
    const first = video.play()
    if (first && first.catch) first.catch(() => setFailed(true)) // autoplay rejected: keep the poster, say nothing
    let io
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync() }, { threshold: 0.1 })
      io.observe(video.parentElement || video)
    }
    document.addEventListener('visibilitychange', sync)
    return () => {
      video.removeEventListener('playing', onPlaying)
      document.removeEventListener('visibilitychange', sync)
      io?.disconnect()
    }
  }, [set])

  if (!set || failed) return null

  const toggle = () => {
    const video = videoRef.current
    if (!video) return
    if (paused) {
      userPausedRef.current = false
      setPaused(false)
      video.play()?.catch(() => {})
    } else {
      userPausedRef.current = true
      setPaused(true)
      video.pause()
    }
  }

  const file = (ext) => asset(`${dir}/${name}-${set}.${ext}`)
  const label = paused ? t('a11y.playHeroVideo') : t('a11y.pauseHeroVideo')

  return (
    <>
      <video
        key={set}
        ref={attachVideo}
        className={`hero-video${playing ? ' is-playing' : ''}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
        disableRemotePlayback
      >
        <source src={file('webm')} type="video/webm" />
        <source src={file('mp4')} type="video/mp4" />
      </video>
      {playing && (
        <button type="button" className="hero-video-toggle" onClick={toggle} aria-label={label} title={label}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            {paused
              ? <path d="M8 5v14l11-7z" fill="currentColor" />
              : <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" />}
          </svg>
        </button>
      )}
    </>
  )
}
