import type { FoilBeyondStory } from "../_data/foil-beyond-stories";

import { ArticlePlacement } from "./foil-source-page";
import styles from "./foil-beyond-story-page.module.css";

type FoilBeyondStoryPageProps = {
  story: FoilBeyondStory;
};

export function FoilBeyondStoryPage({ story }: FoilBeyondStoryPageProps) {
  return (
    <main className={styles.page} data-testid="foil-beyond-story-detail">
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <p className={styles.eyebrow}>Beyond SailGP · {story.tag}</p>
          <h1>{story.title}</h1>
          <p className={styles.byline}>{story.byline}</p>
          <p className={styles.summary}>{story.summary}</p>
        </div>
      </header>

      <section className={styles.detailGrid}>
        <article className={styles.content}>
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          <dl className={styles.facts}>
            {story.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>

          <h2>{story.outlookTitle}</h2>
          {story.outlook.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>

        <aside className={styles.feedColumn} aria-label={`${story.tag} live fan feed`}>
          <div className={styles.stickyFeed}>
            <p className={styles.feedLabel}>Live feed</p>
            <ArticlePlacement
              articleSlug={`beyond-${story.slug}`}
              className={styles.feedHost}
              placementId="6a032db60ae65ee82495dd72"
              styleId="6a032db60ae65ee82495dd73"
              testId="foil-beyond-sticky-feed"
            />
          </div>
        </aside>
      </section>
    </main>
  );
}
