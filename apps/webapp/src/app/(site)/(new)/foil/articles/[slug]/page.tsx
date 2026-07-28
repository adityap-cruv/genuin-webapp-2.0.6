import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FoilSourcePage } from "../../_components/foil-source-page";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const FOIL_ARTICLES = {
  "article-1": {
    title: "Slingsby's start-line gamble was brilliant. It was also wrong.",
    sourceUrl: "https://prototype.thefoil.begenuin.com/TheFoil/article-1.html",
  },
  "article-2": {
    title: `Outteridge on home water: "We've been waiting three years for this weekend."`,
    sourceUrl: "https://prototype.thefoil.begenuin.com/TheFoil/article-2.html",
  },
  "article-3": {
    title: "Why wing trim is where the Aussies are losing half a knot.",
    sourceUrl: "https://prototype.thefoil.begenuin.com/TheFoil/article-3.html",
  },
  "article-4": {
    title: "Inside the grinder's race: seven minutes of flat-out sprint.",
    sourceUrl: "https://prototype.thefoil.begenuin.com/TheFoil/article-4.html",
  },
} as const;

type FoilArticleSlug = keyof typeof FOIL_ARTICLES;

function getArticle(slug: string) {
  return Object.hasOwn(FOIL_ARTICLES, slug) ? FOIL_ARTICLES[slug as FoilArticleSlug] : undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  return article ? { title: `${article.title} · The Foil` } : { title: "The Foil" };
}

export default async function FoilArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return <FoilSourcePage title={article.title} sourceUrl={article.sourceUrl} />;
}
