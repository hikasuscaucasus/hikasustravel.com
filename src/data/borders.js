// Border-crossing pages registry.
//
// This is the time-sensitive part of the site: open/closed status, operating
// hours, and entry rules can change. Content lives in pages.json / seoData.js
// like every other page; this file only decides which border pages exist, what
// they are called, and where they live in the URL tree.
//
// URL scheme (consistent with the rest of the /georgia tree):
//   /georgia/border-crossings                      -> the overview / complete guide
//   /georgia/border-crossings/<slug>               -> an individual crossing
//
// A page renders only when published === true; otherwise the route 404s, so an
// unfinished or unverified crossing never shows a half-built stub.

// The overview / complete-guide hub. It lives at the section index URL.
// noHero: no visible hero (solid title band instead); `image` is kept because
// it still feeds og:image / twitter:image / the Article JSON-LD.
export const borderOverview = {
  seoKey: 'borderCrossingsOverview',
  contentKey: 'borderCrossingsOverview',
  image: '/images/files/georgia-home.jpg',
  noHero: true,
  published: true,
}

// The sister guides for Armenia and Azerbaijan. Same hero-free article layout,
// one hub each at /<country>/border-crossings (a static segment, so it outranks
// /<country>/:citySlug). Each carries an existing approved country photo for
// og:image / the Article JSON-LD only; no visible hero. Georgia keeps its
// individual crossing pages under /georgia/border-crossings/<slug>; Armenia and
// Azerbaijan are single guides.
export const countryBorderOverviews = {
  georgia: { country: 'georgia', ...borderOverview },
  armenia: {
    country: 'armenia',
    seoKey: 'armeniaBorderCrossings',
    contentKey: 'armeniaBorderCrossings',
    image: '/images/files/khor-virap-monastery-ararat-armenia-og.jpg',
    noHero: true,
    published: true,
  },
  azerbaijan: {
    country: 'azerbaijan',
    seoKey: 'azerbaijanBorderCrossings',
    contentKey: 'azerbaijanBorderCrossings',
    image: '/images/files/baku-flame-towers-azerbaijan-1200.webp',
    noHero: true,
    published: true,
  },
}
export const borderHubPathFor = (country) => `/${country}/border-crossings`

// Individual crossings. Add an entry here (with matching seoData + pages.json
// keys) to publish a new one; flip published to false to hide it again.
export const borderCrossings = [
  {
    slug: 'akhkerpi-border-crossing',
    name: 'Akhkerpi Border Crossing',
    seoKey: 'akhkerpiBorderCrossing',
    contentKey: 'akhkerpiBorderCrossing',
    image: '/images/files/georgia-home.jpg',
    published: true,
  },
  {
    slug: 'guguti-gogavan-border-crossing',
    name: 'Guguti / Gogavan Border Crossing',
    seoKey: 'gugutiGogavanBorderCrossing',
    contentKey: 'gugutiGogavanBorderCrossing',
    image: '/images/files/georgia-home.jpg',
    published: true,
  },
  {
    slug: 'kartsakhi-border-crossing',
    name: 'Kartsakhi Border Crossing',
    seoKey: 'kartsakhiBorderCrossing',
    contentKey: 'kartsakhiBorderCrossing',
    image: '/images/files/georgia-home.jpg',
    published: true,
  },
  {
    slug: 'kazbegi-dariali-upper-lars-border-crossing',
    name: 'Kazbegi (Upper Lars) Border Crossing',
    seoKey: 'kazbegiUpperLarsBorderCrossing',
    contentKey: 'kazbegiUpperLarsBorderCrossing',
    image: '/images/files/georgia-home.jpg',
    published: true,
  },
  {
    slug: 'lagodekhi-balakan-border-crossing',
    name: 'Lagodekhi / Balakan Border Crossing',
    seoKey: 'lagodekhiBalakanBorderCrossing',
    contentKey: 'lagodekhiBalakanBorderCrossing',
    image: '/images/files/georgia-home.jpg',
    published: true,
  },
  {
    slug: 'ninotsminda-bavra-border-crossing',
    name: 'Ninotsminda / Bavra Border Crossing',
    seoKey: 'ninotsmindaBavraBorderCrossing',
    contentKey: 'ninotsmindaBavraBorderCrossing',
    image: '/images/files/georgia-home.jpg',
    published: true,
  },
  {
    slug: 'red-bridge-border-crossing',
    name: 'Red Bridge Border Crossing',
    seoKey: 'redBridgeBorderCrossing',
    contentKey: 'redBridgeBorderCrossing',
    image: '/images/files/georgia-home.jpg',
    published: true,
  },
  {
    slug: 'sadakhlo-bagratashen-border-crossing',
    name: 'Sadakhlo / Bagratashen Border Crossing',
    seoKey: 'sadakhloBagratashenBorderCrossing',
    contentKey: 'sadakhloBagratashenBorderCrossing',
    image: '/images/files/georgia-home.jpg',
    published: true,
  },
  {
    slug: 'sarpi-border-crossing',
    name: 'Sarpi Border Crossing',
    seoKey: 'sarpiBorderCrossing',
    contentKey: 'sarpiBorderCrossing',
    image: '/images/files/georgia-home.jpg',
    published: true,
  },
  {
    slug: 'vale-border-crossing',
    name: 'Vale Border Crossing',
    seoKey: 'valeBorderCrossing',
    contentKey: 'valeBorderCrossing',
    image: '/images/files/georgia-home.jpg',
    published: true,
  },
]

export const borderHubPath = '/georgia/border-crossings'
export const borderCrossingPath = (slug) => `/georgia/border-crossings/${slug}`
export const getBorderCrossing = (slug) =>
  borderCrossings.find((b) => b.slug === slug) || null

const strip = (p) => p.replace(/^\//, '')

// Published border pages (overview + individual crossings) for the sitemap and
// the prerenderer. Same shape as places.js publishedDestinationPages().
export function publishedBorderPages() {
  const pages = []
  for (const hub of Object.values(countryBorderOverviews)) {
    if (!hub.published) continue
    pages.push({
      path: strip(borderHubPathFor(hub.country)),
      seoKey: hub.seoKey,
      image: hub.image,
      country: hub.country,
      hub: true,
    })
  }
  for (const b of borderCrossings) {
    if (!b.published) continue
    pages.push({
      path: strip(borderCrossingPath(b.slug)),
      seoKey: b.seoKey,
      image: b.image,
      country: 'georgia',
    })
  }
  return pages
}
