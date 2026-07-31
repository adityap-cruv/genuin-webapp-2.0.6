import { GenuinEmbedCarousel } from "@genuin/components/legacy/websitev5/genuin-embed-carousel";
import Link from "next/link";

import type { FoilArticle } from "../_data/foil-articles";

import styles from "./foil-article-page.module.css";

type FoilSourcePageProps = {
  title: string;
  sourceUrl: string;
};

export function FoilSourcePage({ title, sourceUrl }: FoilSourcePageProps) {
  return (
    <main className="gencl:flex gencl:h-full gencl:min-h-0 gencl:flex-col gencl:bg-white">
      <div className="gencl:flex gencl:h-12 gencl:shrink-0 gencl:items-center gencl:justify-between gencl:border-b gencl:border-secondary-150 gencl:px-4 gencl:sm:px-6">
        <Link
          href="/home"
          className="gencl:inline-flex gencl:items-center gencl:text-body-2-medium gencl:text-secondary-600 gencl:no-underline hover:gencl:text-secondary-900">
          ← Back to The Foil
        </Link>
        <p className="gencl:truncate gencl:pl-4 gencl:text-body-3 gencl:text-secondary-500">{title}</p>
      </div>
      <iframe
        src={sourceUrl}
        title={title}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
        className="gencl:min-h-0 gencl:w-full gencl:flex-1 gencl:border-0 gencl:bg-white"
      />
    </main>
  );
}

const SDK_SRC = "https://media.begenuin.com/sdk/2.0.6/gen_sdk.min.js";
const API_KEY = "8a5582af807e98dbad239b749a1cd7fb026831eec1a95d00";

type ArticlePlacementProps = {
  articleSlug: string;
  className?: string;
  placementId: string;
  styleId: string;
  testId: string;
};

export function ArticlePlacement({ articleSlug, className, placementId, styleId, testId }: ArticlePlacementProps) {
  return (
    <div className={className}>
      <GenuinEmbedCarousel
        apiKey={API_KEY}
        styleId={styleId}
        placementId={placementId}
        containerId={`${testId}-${articleSlug}`}
        testId={`${testId}-sdk`}
        sdkSrc={SDK_SRC}
      />
    </div>
  );
}

type FoilLocalArticlePageProps = {
  article: FoilArticle;
  presentation?: "drawer" | "page";
};

export function FoilLocalArticlePage({ article, presentation = "page" }: FoilLocalArticlePageProps) {
  return (
    <main className={styles.page} data-testid="foil-local-article">
      {presentation === "page" ? (
        <nav className={styles.articleNav} aria-label="Foil article navigation">
          <Link className={styles.articleLogo} href="/home">
            The <span>Foil</span>
          </Link>
          <Link className={styles.backLink} href="/home">
            ← Back to Hub
          </Link>
        </nav>
      ) : null}

      {presentation === "page" ? (
        <header className={styles.hero}>
          <img src={article.hero.url} alt={article.hero.alt} />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <p className={styles.articleTag}>{article.category}</p>
            <h1>{article.title}</h1>
            <p className={styles.byline} dangerouslySetInnerHTML={{ __html: article.byline }} />
          </div>
        </header>
      ) : (
        <header className={styles.drawerHeader} data-testid="foil-drawer-article-header">
          <div className={styles.drawerHeaderInner}>
            <p className={styles.articleTag}>{article.category}</p>
            <h1>{article.title}</h1>
            <p className={styles.byline} dangerouslySetInnerHTML={{ __html: article.byline }} />
          </div>
        </header>
      )}

      <section className={styles.introGrid}>
        <div className={styles.articleBody} dangerouslySetInnerHTML={{ __html: article.body_intro }} />
        <aside className={styles.stickyColumn} aria-label="Live Foil feed">
          <div className={styles.stickyFeed} data-testid="foil-article-sticky-feed">
            <p className={styles.railLabel}>Live Feed</p>
            <ArticlePlacement
              articleSlug={article.slug}
              className={styles.stickyFeedHost}
              placementId="6a032db60ae65ee82495dd72"
              styleId="6a032db60ae65ee82495dd73"
              testId="foil-article-sticky-feed"
            />
          </div>
        </aside>
      </section>

      <section className={styles.placementSection} data-testid="foil-article-fan-reactions">
        <p className={styles.placementLabel}>{article.placement1_label}</p>
        <ArticlePlacement
          articleSlug={article.slug}
          className={styles.fanReactionsHost}
          placementId="69f4814de964b815fc224fec"
          styleId="69f4814de964b815fc224fed"
          testId="foil-article-fan-reactions"
        />
      </section>

      {article.body_mid ? (
        <section className={`${styles.articleWrap} ${styles.compactWrap}`}>
          <div className={styles.articleBody} dangerouslySetInnerHTML={{ __html: article.body_mid }} />
        </section>
      ) : null}

      <section className={`${styles.placementSection} ${styles.darkPlacement}`}>
        <p className={styles.placementLabel}>Related Video</p>
        <ArticlePlacement
          articleSlug={article.slug}
          className={styles.relatedVideoHost}
          placementId="69f481cbe964b815fc225021"
          styleId="69f481d1e964b815fc22502c"
          testId="foil-article-related-video"
        />
      </section>

      {article.body_outro ? (
        <section className={`${styles.articleWrap} ${styles.compactWrap}`}>
          <div className={styles.articleBody} dangerouslySetInnerHTML={{ __html: article.body_outro }} />
        </section>
      ) : null}

      <section className={styles.placementSection}>
        <p className={styles.placementLabel}>Fleet Fan Zone · Join the Conversation</p>
        <ArticlePlacement
          articleSlug={article.slug}
          className={styles.fleetFanZoneHost}
          placementId="69f85cd54e1859a88008a833"
          styleId="69f85cd54e1859a88008a834"
          testId="foil-article-fleet-fan-zone"
        />
      </section>

      <footer className={styles.articleFooter}>
        © 2025 The Foil · SailGP Season Hub &nbsp;·&nbsp; <Link href="/home">← Back to Hub</Link>
      </footer>
    </main>
  );
}
