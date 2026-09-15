import { getArticleBySlug } from "@genuin/components/page/article/article-data";
import { ArticlePage } from "@genuin/components/page/article/article-page";
import { type Metadata, type Viewport } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import {
  buildArticleJsonLd,
  getArticleCanonical,
  getArticleDescription,
  parseByline,
  serializeJsonLd,
  toIsoDate,
} from "./article-seo";

export const dynamic = "force-dynamic";

// Reading pages must stay zoomable (WCAG 1.4.4); overrides the app-wide no-zoom viewport.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getRequestHost() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article not found", robots: { index: false, follow: true } };

  const canonical = getArticleCanonical(slug, await getRequestHost());
  const description = getArticleDescription(article);
  const publishedTime = toIsoDate(article.publishedAt);
  const byline = parseByline(article.author);
  const hero = article.heroImage;
  const images = hero?.src ? [{ url: hero.src, alt: hero.alt || article.title }] : undefined;

  return {
    title: article.title,
    description,
    ...(byline ? { authors: [{ name: byline.name }] } : {}),
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: article.title,
      description,
      siteName: article.source.name,
      ...(publishedTime ? { publishedTime } : {}),
      ...(article.author ? { authors: [article.author] } : {}),
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: article.title,
      description,
      images: images?.map((image) => image.url),
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const canonical = getArticleCanonical(slug, await getRequestHost());
  const jsonLd = buildArticleJsonLd(article, canonical);

  return (
    <>
      {/* Server-rendered so crawlers and AI engines see the article entity in the initial HTML.
          Content is our own static snapshot, serialised with `<` escaped. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <ArticlePage article={article} />
    </>
  );
}
