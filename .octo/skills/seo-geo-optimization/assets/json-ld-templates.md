# JSON-LD templates (ready to adapt)

Generic, framework-agnostic snippets — replace the `<...>` / `example.com` placeholders with real
values. Emit each as `<script type="application/ld+json">{JSON.stringify(data)}</script>` in the
server-rendered HTML. `JSON.stringify` escapes the values; the script tag content is the only
injection surface — don't hand-concatenate unescaped user text. **Omit an optional field rather
than emit an empty string**, and apply the missing-data rule (SKILL.md).

> Project-specific field sources and caveats (e.g. genuin-webapp's `descritptionText` typo, raw
> mp4 vs m3u8, epoch→ISO dates) live in `references/codebase-map.md`.

## Article / BlogPosting (blog post, news)
Use `BlogPosting` for blog posts, `NewsArticle` for news, `Article` as the generic fallback.
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "<headline ≤110 chars, matches the visible h1>",
  "description": "<dek / meta description>",
  "image": ["https://media.example.com/.../cover_1200x630.jpg"],
  "datePublished": "2026-06-22T09:00:00-05:00",
  "dateModified": "2026-06-22T09:00:00-05:00",
  "author": { "@type": "Person", "name": "<Author Name>", "url": "https://example.com/author/<id>" },
  "publisher": {
    "@type": "Organization",
    "name": "<Your Org>",
    "logo": { "@type": "ImageObject", "url": "https://media.example.com/.../logo.png" }
  },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://example.com/blog/<slug>" }
}
```

## FAQPage (pairs with a visible FAQ section — strong GEO chunking)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "<question>",
      "acceptedAnswer": { "@type": "Answer", "text": "<self-contained answer>" } }
  ]
}
```

## BreadcrumbList (site position — helps SEO + AI structure)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Blog", "item": "https://example.com/blog" },
    { "@type": "ListItem", "position": 2, "name": "<Post Title>", "item": "https://example.com/blog/<slug>" }
  ]
}
```

## VideoObject (video page)
See the duration/mp4/date caveats in `video-seo.md`.
```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "<clip title>",
  "description": "<clip description>",
  "thumbnailUrl": ["https://media.example.com/.../poster_1280x720.jpg"],
  "uploadDate": "2026-04-15T09:00:00-05:00",
  "duration": "PT2M14S",
  "contentUrl": "https://media.example.com/.../clip.mp4",
  "embedUrl": "https://example.com/video/<id>/embed",
  "author": { "@type": "Person", "name": "<Author>", "url": "https://example.com/brand/<id>" },
  "publisher": {
    "@type": "Organization",
    "name": "<Your Org>",
    "logo": { "@type": "ImageObject", "url": "https://media.example.com/.../logo.png" }
  },
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": "https://schema.org/WatchAction",
    "userInteractionCount": 1284
  }
}
```
Conditional add when a transcript is available: `"transcript": "<full transcript text>"`.

## Collection (community / collection page)
```json
{
  "@context": "https://schema.org",
  "@type": "Collection",
  "name": "<collection name>",
  "description": "<real description>",
  "url": "https://example.com/community/<slug>",
  "sameAs": ["https://twitter.com/...", "https://www.linkedin.com/company/..."]
}
```

## Organization / Person (brand / creator page)
Use `Organization` for brands/companies, `Person` for individual creators.
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "<name>",
  "url": "https://example.com/brand/<id>",
  "description": "<bio>",
  "sameAs": [
    "https://www.instagram.com/...",
    "https://www.linkedin.com/company/...",
    "https://twitter.com/..."
  ]
}
```

## Product + Offer (only with real commerce data — never fabricate price/availability)
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "<product name>",
  "image": ["https://media.example.com/.../product.jpg"],
  "description": "<description>",
  "offers": {
    "@type": "Offer",
    "price": "29.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/product/<id>"
  }
}
```

## Video sitemap entry (reference shape)
```xml
<url>
  <loc>https://example.com/video/<id></loc>           <!-- param-free canonical -->
  <lastmod>2026-04-15</lastmod>
  <video:video>
    <video:thumbnail_loc>https://media.example.com/.../poster.jpg</video:thumbnail_loc>
    <video:title><clip title></video:title>
    <video:description><clip description></video:description>
    <video:content_loc>https://media.example.com/.../clip.mp4</video:content_loc>
    <video:duration>134</video:duration>
    <video:publication_date>2026-04-15T09:00:00-05:00</video:publication_date>
  </video:video>
</url>
```
