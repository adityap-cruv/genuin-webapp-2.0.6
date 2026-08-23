import { getArticleBySlug } from "@genuin/components/page/article/article-data";
import { ArticlePage } from "@genuin/components/page/article/article-page";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };

  const images = article.heroImage?.src ? [{ url: article.heroImage.src }] : undefined;
  return {
    title: article.title,
    description: article.standfirst,
    openGraph: {
      title: article.title,
      description: article.standfirst,
      images,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return <ArticlePage article={article} />;
}
