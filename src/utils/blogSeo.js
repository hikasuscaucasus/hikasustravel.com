// The BlogPosting graph of one blog article, built by ONE function that both
// the React page (BlogArticlePage.jsx) and the build-time prerender
// (scripts/prerender.js) call, so the static HTML and the hydrated <head>
// carry the same structured data. Before this the graph lived only in the
// component and so was missing from every prerendered article.
//
// Plain data only — no React, no window — because prerender.js imports it in
// Node. `faq` is the locale's [{ title, content }] list (translation first,
// English base as fallback); `description` the localized meta description.

export function buildBlogJsonLd({ article, lang, description, faq }) {
  if (!article) return null
  const url = `https://www.hikasustravel.com/${lang}/blog/${article.slug}`
  const graph = [
    {
      '@type': 'BlogPosting',
      headline: article.title,
      description,
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
  if (faq?.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.title,
        acceptedAnswer: { '@type': 'Answer', text: f.content },
      })),
    })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}
