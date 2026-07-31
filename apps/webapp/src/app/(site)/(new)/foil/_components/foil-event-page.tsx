import type { FoilEvent } from "../_data/foil-events";

import { ArticlePlacement } from "./foil-source-page";
import styles from "./foil-event-page.module.css";

type FoilEventPageProps = {
  event: FoilEvent;
};

export function FoilEventPage({ event }: FoilEventPageProps) {
  return (
    <main className={styles.page} data-testid="foil-event-detail">
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <p className={styles.eyebrow}>Season calendar · {event.status}</p>
          <h1>{event.venue}</h1>
          <div className={styles.meta}>
            <span>{event.dates}</span>
            <span>{event.country}</span>
          </div>
          <p className={styles.summary}>{event.summary}</p>
        </div>
      </header>

      <section className={styles.detailGrid}>
        <article className={styles.content}>
          <h2>{event.title}</h2>
          {event.overview.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          <h2>Course intelligence</h2>
          <dl className={styles.notes}>
            {event.courseNotes.map((note) => (
              <div key={note.label}>
                <dt>{note.label}</dt>
                <dd>{note.value}</dd>
              </div>
            ))}
          </dl>

          <h2>Race-week schedule</h2>
          <div className={styles.sessions}>
            {event.sessions.map((session) => (
              <section key={session.day}>
                <span>{session.day}</span>
                <h3>{session.title}</h3>
                <p>{session.detail}</p>
              </section>
            ))}
          </div>
        </article>

        <aside className={styles.feedColumn} aria-label={`${event.venue} live fan feed`}>
          <div className={styles.stickyFeed}>
            <p className={styles.feedLabel}>Live feed</p>
            <ArticlePlacement
              articleSlug={`event-${event.slug}`}
              className={styles.feedHost}
              placementId="6a032db60ae65ee82495dd72"
              styleId="6a032db60ae65ee82495dd73"
              testId="foil-event-sticky-feed"
            />
          </div>
        </aside>
      </section>
    </main>
  );
}

