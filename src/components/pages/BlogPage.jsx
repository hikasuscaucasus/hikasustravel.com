import HeroSection from '../shared/HeroSection'
import FadeUp from '../shared/FadeUp'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'
import { blogArticles, blogGuides } from '../../data/blogData'
import asset from '../../utils/basePath'

function formatDate(dateStr, lang) {
  try {
    return new Date(dateStr).toLocaleDateString(lang, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function tf(t, key, fallback) {
  const val = t(key)
  return val === key ? fallback : val
}

// Cards normally ship one flat thumbnail. A post that packages a width ladder
// can opt into a srcset instead (`thumbnailSrcSet`); everything without one
// renders exactly the single <img src> it always did.
function cardImageProps(item) {
  const s = item.thumbnailSrcSet
  if (!s) return {}
  return {
    srcSet: s.widths.map((w) => `${asset(`${s.base}-${w}.webp`)} ${w}w`).join(', '),
    sizes: s.sizes,
    width: s.width,
    height: s.height,
    decoding: 'async',
  }
}

export default function BlogPage() {
  const t = useT()
  const { lang } = useLang()
  const seo = getSEO('blog', lang)
  useSEO({ ...seo, lang, path: 'blog', image: '/images/files/georgia-home.jpg' })

  const heroTitle = tf(t, 'blog.heroTitle', 'Travel Blogs')
  const intro = tf(t, 'blog.intro', 'Insider tips, practical guides, and inspiring stories to help you plan your perfect Georgia adventure.')
  const readMore = tf(t, 'blog.readMore', 'Read Article')
  const readTimeTemplate = tf(t, 'blog.readTime', '{min} min read')

  // Combine articles + standalone guide cards into one list, sorted by date (newest first).
  const items = [
    ...blogArticles.map(a => ({
      key: a.slug,
      to: `/blog/${a.slug}`,
      title: tf(t, a.titleKey, a.title),
      excerpt: a.descKey ? tf(t, a.descKey, a.excerpt) : a.excerpt,
      date: a.date,
      readTime: a.readTime,
      thumbnail: a.thumbnail,
      thumbnailSrcSet: a.thumbnailSrcSet,
      // An infographic card shows a chart, so it is described by what the chart
      // contains rather than by the headline; photo cards keep the title as alt.
      thumbnailAlt: a.heroInfographic
        ? (a.heroImageMeta?.alt?.[lang] || a.heroImageMeta?.alt?.en)
        : undefined,
      tags: a.tags,
    })),
    ...blogGuides.map(g => {
      const gseo = getSEO(g.seoKey, lang)
      return {
        key: g.path,
        to: g.path,
        title: gseo.title,
        excerpt: gseo.description,
        date: g.date,
        readTime: g.readTime,
        thumbnail: g.thumbnail,
        tags: g.tags,
      }
    }),
  ].sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  return (
    <>
      <HeroSection className="hero--compact" image="/images/files/georgia-home.jpg" title={heroTitle} />
      <section className="page-items blog-listing">
        <nav className="blog-breadcrumb" aria-label={t('a11y.breadcrumb')}>
          <LocaleLink to="/">{t('breadcrumb.home')}</LocaleLink>
          <span className="blog-breadcrumb__sep" aria-hidden="true">/</span>
          <span aria-current="page">{heroTitle}</span>
        </nav>

        <FadeUp>
          <p className="blog-intro">{intro}</p>

          <div className="blog-list">
            {items.map(item => (
              <LocaleLink
                key={item.key}
                to={item.to}
                className="blog-item"
              >
                <div className="blog-item__img-wrap">
                  <img
                    src={asset(item.thumbnail)}
                    alt={item.thumbnailAlt || item.title}
                    className="blog-item__img"
                    loading="lazy"
                    {...cardImageProps(item)}
                  />
                </div>
                <div className="blog-item__body">
                  <h2 className="blog-item__title">{item.title}</h2>
                  <div className="blog-item__meta">
                    <span>{formatDate(item.date, lang)}</span>
                    <span className="blog-item__meta-dot">·</span>
                    <span>{readTimeTemplate.replace('{min}', item.readTime)}</span>
                  </div>
                  <p className="blog-item__excerpt">{item.excerpt}</p>
                  <div className="blog-item__footer">
                    <div className="blog-item__tags">
                      {item.tags.map(tag => (
                        <span key={tag} className="blog-item__tag">{tag}</span>
                      ))}
                    </div>
                    <span className="blog-item__read-more">{readMore} →</span>
                  </div>
                </div>
              </LocaleLink>
            ))}
          </div>
        </FadeUp>
      </section>
    </>
  )
}
