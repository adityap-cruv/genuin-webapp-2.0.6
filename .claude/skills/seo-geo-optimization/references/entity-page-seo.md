# Entity pages — communities, brands, creators, products

An "entity page" represents a *thing* (a collection, an organization, a person, a product) rather
than a single article or clip. The job is the same as everywhere: get the entity's facts into the
**served HTML** as crawlable text **and** as JSON-LD so search + AI engines can recognize and
attribute it. Apply the same **additive server SEO block** pattern as video (`video-seo.md §1`)
when the body is client-rendered; if SSR/CMS already renders it, just add the JSON-LD.

> **genuin-webapp binding:** exact routes (`community/[slug]`, `brand/[nickname]`), schemas, and
> available fields are in `codebase-map.md`. Below is generic.

## Community / collection → `Collection`

Crawlable body: `<h1>` name, visible `<p>` description, counts as text (members/items/views), and
a **recent-item list** of crawlable internal links (often a second fetch from the collection feed).

```json
{ "@context": "https://schema.org", "@type": "Collection",
  "name": "Innovative Leadership",
  "description": "<real description>",
  "url": "https://example.com/community/innovative-leadership",
  "sameAs": ["https://twitter.com/...", "https://www.linkedin.com/company/..."] }
```

Map the entity's social links (twitter/x, linkedin, instagram, discord, reddit, web) → `sameAs`.

## Brand / creator / org → `Organization` or `Person`

Use **`Organization`** for brands/companies, **`Person`** for individual creators. Body: `<h1>`
name, visible bio/description, social links. Map bio → `description`, website + socials → `sameAs`.

```json
{ "@context": "https://schema.org", "@type": "Organization",
  "name": "Acme",
  "url": "https://example.com/brand/acme",
  "description": "<bio>",
  "sameAs": ["https://www.instagram.com/...", "https://www.linkedin.com/company/...", "https://twitter.com/..."] }
```

## Product → `Product` + `Offer` *(only with real commerce data)*

```json
{ "@context": "https://schema.org", "@type": "Product",
  "name": "<product name>", "image": ["<absolute url>"], "description": "<desc>",
  "offers": { "@type": "Offer", "price": "29.00", "priceCurrency": "USD",
    "availability": "https://schema.org/InStock", "url": "https://example.com/product/<id>" } }
```

**Do not invent product/offer data.** If no commerce data source exists, tag `[DROPPED]` and skip —
fabricated price/availability is a structured-data violation and a trust risk. (In genuin-webapp,
`Product`/`Offer` is `[DROPPED]` — no such data in any profile schema; see `codebase-map.md`.)

## Canonical & per-host consistency

Same rule as everywhere: `canonical` / `og:url` = the **param-free** entity URL, self-referencing
per host. If the project serves multiple/whitelabel domains, each domain canonicalizes to itself.

## Entity consistency (GEO)

State the org's name + one-line description **identically** across pages (footer, JSON-LD
`publisher`, About). Inconsistent entity descriptions weaken the trust signal AI engines use to
attribute quotes. See `geo-checklist.md`.
