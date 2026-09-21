import { describe, expect, it } from "vitest";

import { getAllArticleSlugs, getArticleBySlug } from "./article-data";

describe("iHeart article snapshot", () => {
  it("exposes the 31 unique brand-3938 articles and no Foil sources", () => {
    const slugs = getAllArticleSlugs();
    const articles = slugs.map((slug) => getArticleBySlug(slug));

    expect(slugs).toHaveLength(31);
    expect(new Set(slugs)).toHaveLength(31);
    expect(articles.every(Boolean)).toBe(true);
    expect(articles.every((article) => article?.source.name === "iHeart")).toBe(true);
    expect(articles.every((article) => article?.source.url.startsWith("https://www.iheart.com/content/"))).toBe(true);
    expect(JSON.stringify(articles).toLowerCase()).not.toContain("thefoil");
  });

  it("preserves complete renderable content and all Instagram references", () => {
    const articles = getAllArticleSlugs().map((slug) => getArticleBySlug(slug)!);
    const instagramReferences = articles.flatMap((article) => article.embeddedMedia ?? []);

    expect(articles.every((article) => article.title && article.standfirst && article.heroImage.src)).toBe(true);
    expect(articles.every((article) => article.body.some((block) => block.type === "paragraph" && block.text))).toBe(
      true
    );
    expect(instagramReferences).toHaveLength(54);
    expect(instagramReferences.every((media) => media.kind === "instagram")).toBe(true);
    expect(instagramReferences.every((media) => media.url.startsWith("https://www.instagram.com/"))).toBe(true);
  });

  it("uses canonical iHeart URL slugs for local article routes", () => {
    const slug = "2026-09-20-benson-boone-reveals-why-he-recently-became-a-drake-fan";
    const article = getArticleBySlug(slug);

    expect(article?.title).toBe("Benson Boone Reveals Why He Recently Became A Drake Fan");
    expect(article?.author).toBe("Tony M. Centeno");
    expect(article?.publishedAt).toBe("2026-09-20T16:13:00+00:00");
  });
});
