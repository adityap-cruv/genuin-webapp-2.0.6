import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FoilLocalArticlePage } from "../../_components/foil-source-page";
import { foilArticles, getFoilArticle } from "../../_data/foil-articles";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return foilArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getFoilArticle(slug);
  return article ? { title: `${article.title} · The Foil` } : { title: "The Foil" };
}

export default async function FoilArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getFoilArticle(slug);
  if (!article) notFound();

  return <FoilLocalArticlePage article={article} />;
}
