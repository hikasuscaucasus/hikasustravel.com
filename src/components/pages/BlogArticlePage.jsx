import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import HeroSection from '../shared/HeroSection'
import Accordion from '../shared/Accordion'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import useSEO from '../../hooks/useSEO'
import { getBlogArticle, getRelatedArticles } from '../../data/blogData'
import { useLinkedHtml, useLinkedFaq } from '../../utils/autolinkReact'
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

export default function BlogArticlePage() {
  const { slug } = useParams()
  const t = useT()
  const { lang } = useLang()
  const article = getBlogArticle(slug)
  const related = useMemo(() => article ? getRelatedArticles(slug) : [], [slug, article])

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

  const jsonLd = useMemo(() => {
    if (!article) return null
    const url = `https://www.hikasustravel.com/${lang}/blog/${slug}`
    const graph = [
      {
        '@type': 'BlogPosting',
        headline: article.title,
        description: localizedDesc,
        author: { '@type': 'Organization', name: article.author },
        datePublished: article.date,
        // `schemaImage` is the opt-in override for a post whose hero is not a
        // good social/search card on its own — the alphabet chart, whose 1200px
        // hero is a wide infographic, ships a 1200x630 crop for this instead.
        image: `https://www.hikasustravel.com${article.schemaImage || article.heroImage}`,
        mainEntityOfPage: url,
        inLanguage: lang,
        publisher: {
          '@type': 'Organization',
          name: 'Hikasus Travel',
          url: 'https://www.hikasustravel.com',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `https://www.hikasustravel.com/${lang}` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `https://www.hikasustravel.com/${lang}/blog` },
          { '@type': 'ListItem', position: 3, name: article.title, item: url },
        ],
      },
    ]
    // Hero image (added for posts that ship a dedicated hero image with metadata).
    // AI-generated illustration → no creditText/creator/copyrightNotice.
    if (article.heroImageMeta) {
      const m = article.heroImageMeta
      graph.push({
        '@type': 'ImageObject',
        '@id': `${url}#hero-image`,
        contentUrl: `https://www.hikasustravel.com${article.heroImage}`,
        width: m.width,
        height: m.height,
        name: m.alt?.[lang] || m.alt?.en,
        caption: m.caption?.[lang] || m.caption?.en,
        representativeOfPage: true,
      })
    }
    if (article.phrases?.length > 0) {
      graph.push({
        '@type': 'ItemList',
        name: article.title,
        itemListElement: article.phrases.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p })),
      })
    }
    if (articleFaq?.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: articleFaq.map((f) => ({
          '@type': 'Question',
          name: f.title,
          acceptedAnswer: { '@type': 'Answer', text: f.content },
        })),
      })
    }
    return { '@context': 'https://schema.org', '@graph': graph }
  }, [article, lang, slug, articleFaq, localizedDesc])

  const articleKeywords = useMemo(() => {
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

        <div className="blog-article__content" dangerouslySetInnerHTML={{ __html: linkedArticle }} />

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
