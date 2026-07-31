# Foil article source archive

This directory preserves the complete source used by the four original
`FROM THE SAILGP DESK` article pages.

## Original page snapshots

- `article-1.html`
- `article-2.html`
- `article-3.html`
- `article-4.html`

Each HTML snapshot contains the original page structure, inline CSS, article
loader, placement markup, responsive placement selection, and Genuin SDK
initialization logic.

## Original data and placement configuration

- `articles.original.json` contains the unmodified article records fetched by
  the original pages.
- `genuin-placements.json` contains every original desktop and mobile
  placement ID, style ID, API key, size, label, and sidebar configuration.

## Referenced code dependencies

- `vendor/gen_sdk-2.0.6.min.js` is the exact SDK script referenced by the
  original pages.
- `vendor/google-fonts.css` is the font stylesheet referenced by the original
  pages. The font binaries remain hosted by Google and their URLs are retained
  in this stylesheet.

## Editable local content

The editable application copy is in `../_data/articles.json`. Its four hero
images are stored in `apps/webapp/public/foil/articles/`. The original records
in this archive remain unchanged so future layout or placement work can always
be compared against the source.

## Upstream sources

- `https://prototype.thefoil.begenuin.com/TheFoil/article-1.html`
- `https://prototype.thefoil.begenuin.com/TheFoil/article-2.html`
- `https://prototype.thefoil.begenuin.com/TheFoil/article-3.html`
- `https://prototype.thefoil.begenuin.com/TheFoil/article-4.html`
- `https://prototype.thefoil.begenuin.com/TheFoil/articles.json`
- `https://prototype.thefoil.begenuin.com/TheFoil/genuin-placements.json`
- `https://media.begenuin.com/sdk/2.0.6/gen_sdk.min.js`
