import { useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import HeroSection from '../shared/HeroSection'
import Accordion from '../shared/Accordion'
import ContentImageLightbox from '../shared/ContentImageLightbox'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import useSEO from '../../hooks/useSEO'
import { getBlogArticle, getRelatedArticles } from '../../data/blogData'
import { useLinkedHtml, useLinkedFaq } from '../../utils/autolinkReact'
import asset from '../../utils/basePath'
import { buildBlogJsonLd } from '../../utils/blogSeo'

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

export default function BlogArticlePage() {
  const { slug } = useParams()
  const t = useT()
  const { lang } = useLang()
  const article = getBlogArticle(slug)
  const related = useMemo(() => article ? getRelatedArticles(slug) : [], [slug, article])
  const contentRef = useRef(null)

  // Per-language article body/FAQ (falls back to the English base when no translation exists).
  const tr = article && lang !== 'en' ? (article.translations?.[lang] || null) : null
  const articleContent = tr?.content || article?.content
  const articleFaq = tr?.faq || article?.faq
  // Auto-link destination mentions in the article body + FAQ answers.
  const linkedArticle = useLinkedHtml(articleContent)
  const linkedFaq = useLinkedFaq(articleFaq)
  const localizedDesc = article
    ? (article.descKey ? tf(t, article.descKey, article.metaDescription || article.excerpt) : (article.metaDescription || article.excerpt))
    : ''

  const heroTitle = tf(t, 'blog.heroTitle', 'Travel Blogs')
  const readTimeTemplate = tf(t, 'blog.readTime', '{min} min read')

  // Same builder the build-time prerender calls (src/utils/blogSeo.js), so the
  // static HTML and this hydrated <head> carry one identical graph.
  const jsonLd = useMemo(
    () => buildBlogJsonLd({ article, lang, description: localizedDesc, faq: articleFaq }),
    [article, lang, articleFaq, localizedDesc],
  )

  const articleKeywords = useMemo(() => {
    // A post may carry its own keyword list (the Armenia guide); every other
    // article keeps the Georgia-prefixed tag keywords it has always had.
    if (article?.keywords) return article.keywords
    if (!article?.tags?.length) return undefined
    const tagKeywords = article.tags.map(tag =>
      `Georgia ${tag.replace(/-/g, ' ')}`
    )
    return [...tagKeywords, 'travel tips Georgia'].join(', ')
  }, [article])

  useSEO(article ? {
    title: (lang === 'en' && article.seoTitle)
      ? article.seoTitle
      : `${tf(t, article.titleKey, article.title)} | Hikasus Travel Blog`,
    description: localizedDesc,
    keywords: articleKeywords,
    lang,
    path: `blog/${slug}`,
    image: article.heroImage,
    imageAlt: article.heroImageMeta?.alt?.[lang] || article.heroImageMeta?.alt?.en,
    ogImage: article.heroImageMeta?.og?.src,
    ogImageWidth: article.heroImageMeta?.og?.width,
    ogImageHeight: article.heroImageMeta?.og?.height,
    jsonLd,
  } : { title: 'Blog — Hikasus Travel', lang, path: 'blog' })

  if (!article) {
    return (
      <>
        <HeroSection className="hero--compact" image="/images/files/georgia-home.jpg" title={heroTitle} />
        <section className="blog-article">
          <div className="blog-article__not-found">
            <h2>{tf(t, 'blog.articleNotFound', 'Article Not Found')}</h2>
            <p>{tf(t, 'blog.articleNotFoundText', "The article you're looking for doesn't exist.")}</p>
            <LocaleLink to="/blog" className="blog-back-link">
              {tf(t, 'blog.backToBlog', 'Back to Blog')}
            </LocaleLink>
          </div>
        </section>
      </>
    )
  }

  const articleTitle = tf(t, article.titleKey, article.title)

  return (
    <>
      <HeroSection
        className="hero--compact"
        image={article.heroImage}
        title={articleTitle}
        bgClass={article.heroBgClass || ''}
        infographic={article.heroInfographic
          ? {
            ...article.heroInfographic,
            src: article.heroImage,
            alt: article.heroImageMeta?.alt?.[lang] || article.heroImageMeta?.alt?.en,
          }
          : null}
      />
      <section className="blog-article">
        {/* "Home" was hard-coded English here, so every blog article printed it
            untranslated in all seven locales — the `breadcrumb.home` string it
            needed already existed (Startseite / Accueil / Inicio / Domů /
            Strona główna). The trail also matches the shared <Breadcrumbs>
            component now: a labelled landmark, decorative separators hidden
            from assistive tech, and the current page marked as such. */}
        <nav className="blog-breadcrumb" aria-label={t('a11y.breadcrumb')}>
          <LocaleLink to="/">{t('breadcrumb.home')}</LocaleLink>
          <span className="blog-breadcrumb__sep" aria-hidden="true">/</span>
          <LocaleLink to="/blog">{heroTitle}</LocaleLink>
          <span className="blog-breadcrumb__sep" aria-hidden="true">/</span>
          <span aria-current="page">{articleTitle}</span>
        </nav>

        <div className="blog-article__meta">
          <span>{article.author}</span>
          <span>{formatDate(article.date, lang)}</span>
          <span>{readTimeTemplate.replace('{min}', article.readTime)}</span>
        </div>

        <div ref={contentRef} className="blog-article__content" dangerouslySetInnerHTML={{ __html: linkedArticle }} />
        {/* Inline editorial photos open in the shared viewer — the same
            ContentImageLightbox the destination pages use. The hero above is a
            CSS background and the related-article cards below sit outside this
            container, so neither becomes a trigger. */}
        <ContentImageLightbox containerRef={contentRef} />

        {articleFaq?.length > 0 && (
          <div className="blog-article__faq">
            <Accordion items={linkedFaq} headingKey="faq.heroTitle" />
          </div>
        )}

        <div className="blog-article__tags">
          {article.tags.map(tag => (
            <span key={tag} className="blog-item__tag">{tag}</span>
          ))}
        </div>

        <div className="blog-article__footer">
          <LocaleLink to="/blog" className="blog-back-link">
            {tf(t, 'blog.backToBlog', 'Back to Blog')}
          </LocaleLink>
        </div>
      </section>

      {related.length > 0 && (
        <section className="blog-article blog-related">
          <h2 className="blog-related__heading">
            {tf(t, 'blog.relatedArticles', 'Related Articles')}
          </h2>
          <div className="blog-related__grid">
            {related.map(r => {
              const relTitle = tf(t, r.titleKey, r.title)
              return (
                <LocaleLink key={r.slug} to={`/blog/${r.slug}`} className="blog-related__card">
                  <div className="blog-related__card-img-wrap">
                    <img src={asset(r.thumbnail)} alt={relTitle} className="blog-related__card-img" loading="lazy" />
                  </div>
                  <div className="blog-related__card-body">
                    <h3 className="blog-related__card-title">{relTitle}</h3>
                    <p className="blog-related__card-excerpt">{r.excerpt}</p>
                  </div>
                </LocaleLink>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}
