import articleData from "./articles.json";

export type FoilArticle = {
  slug: string;
  source_url: string;
  title: string;
  category: string;
  hero: {
    url: string;
    alt: string;
  };
  byline: string;
  placement1_label: string;
  body_intro: string;
  body_mid?: string;
  body_outro?: string;
};

export const foilArticles = articleData.articles as FoilArticle[];

export function getFoilArticle(slug: string) {
  return foilArticles.find((article) => article.slug === slug);
}
