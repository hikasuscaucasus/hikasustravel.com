import { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { tours } from '../data/tours'
import { I18nContext } from '../i18n/I18nContext'
import useT from '../i18n/useT'
import { buildWhatsAppHref, pageUrl } from '../utils/whatsapp'

const TOUR_PATH = /^\/[a-z]{2}\/(?:private|group)-tours\/([^/]+)\/?$/

/**
 * The prefilled WhatsApp link for the page being rendered: a tour page gets
 * the "interested in this tour: {name} ({url})" message, every other page the
 * general question. Route information comes from the router, so the same href
 * is produced on the server (prerender) and in the browser.
 */
export default function useWhatsAppHref() {
  const t = useT()
  const { pathname } = useLocation()
  const { tourTranslations } = useContext(I18nContext)
  const url = pageUrl(pathname)
  const slug = pathname.match(TOUR_PATH)?.[1]
  const tour = slug ? tours.find((x) => x.slug === slug) : null
  if (!tour) return { href: buildWhatsAppHref(t('whatsapp.generalMessage', { url })), tourSlug: '' }
  const name = tourTranslations?.[slug]?.title || tour.title
  return { href: buildWhatsAppHref(t('whatsapp.tourMessage', { tour: name, url })), tourSlug: slug }
}
