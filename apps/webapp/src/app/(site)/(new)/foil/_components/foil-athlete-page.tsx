import Link from "next/link";

import type { FoilAthlete } from "../_data/foil-athletes";

import { ArticlePlacement } from "./foil-source-page";
import styles from "./foil-athlete-page.module.css";

type FoilLocalAthletePageProps = {
  athlete: FoilAthlete;
  presentation?: "drawer" | "page";
};

function resultTone(result: string) {
  if (result === "1st") return styles.gold;
  if (result === "2nd") return styles.silver;
  return undefined;
}

export function FoilLocalAthletePage({ athlete, presentation = "page" }: FoilLocalAthletePageProps) {
  return (
    <main className={styles.page} data-testid="foil-local-athlete">
      {presentation === "page" ? (
        <nav className={styles.athleteNav} aria-label="Foil athlete navigation">
          <Link className={styles.logo} href="/home">
            The <span>Foil</span>
          </Link>
          <Link className={styles.backLink} href="/home#the-fleet">
            ← Athletes
          </Link>
        </nav>
      ) : null}

      {presentation === "page" ? (
        <header className={styles.hero}>
          <img src={athlete.hero.url} alt={athlete.hero.alt} />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <p className={styles.tag}>{athlete.tag}</p>
            <h1>{athlete.name}</h1>
            <div className={styles.athleteMeta}>
              <p>
                {athlete.team} · {athlete.role}
              </p>
              <strong>{athlete.rank}</strong>
            </div>
          </div>
        </header>
      ) : (
        <header className={styles.drawerHeader} data-testid="foil-drawer-athlete-header">
          <div className={styles.drawerHeaderInner}>
            <p className={styles.tag}>{athlete.tag}</p>
            <h1>{athlete.name}</h1>
            <div className={styles.athleteMeta}>
              <p>
                {athlete.team} · {athlete.role}
              </p>
              <strong>{athlete.rank}</strong>
            </div>
          </div>
        </header>
      )}

      <section className={styles.stats} aria-label={`${athlete.name} statistics`}>
        {athlete.stats.map((stat) => (
          <div className={styles.stat} key={stat.label}>
            <strong>
              {stat.value}
              {stat.suffix ? <small> {stat.suffix}</small> : null}
            </strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className={styles.profileWrap}>
        <div className={styles.profileBody}>
          <h2>{athlete.about_title}</h2>
          {athlete.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <blockquote>{athlete.quote}</blockquote>

          <h2>Recent Results</h2>
          <div className={styles.tableScroller}>
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  {["Event", "Venue", "Race 1", "Race 2", "Race 3", "Overall"].map((heading) => (
                    <th key={heading}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {athlete.results.map(([event, venue, ...results]) => (
                  <tr key={event}>
                    <td>{event}</td>
                    <td>{venue}</td>
                    {results.map((result, index) => (
                      <td key={`${event}-${index}`}>
                        <span className={`${styles.result} ${resultTone(result) ?? ""}`}>{result}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className={styles.stickyColumn} aria-label="Live Foil feed">
          <div className={styles.stickyFeed} data-testid="foil-athlete-sticky-feed">
            <p className={styles.railLabel}>Live Feed</p>
            <ArticlePlacement
              articleSlug={`athlete-${athlete.slug}`}
              className={styles.stickyFeedHost}
              placementId="6a032db60ae65ee82495dd72"
              styleId="6a032db60ae65ee82495dd73"
              testId="foil-athlete-sticky-feed"
            />
          </div>
        </aside>
      </section>

      <section className={styles.placementSection} data-testid="foil-athlete-fan-reactions">
        <p className={styles.placementLabel}>Fan Reactions · Powered by Genuin</p>
        <ArticlePlacement
          articleSlug={`athlete-${athlete.slug}`}
          className={styles.fanReactionsHost}
          placementId="69f4814de964b815fc224fec"
          styleId="69f4814de964b815fc224fed"
          testId="foil-athlete-fan-reactions"
        />
      </section>

      <section className={`${styles.profileWrap} ${styles.outlook}`}>
        <div className={styles.profileBody}>
          <h2>Championship Outlook</h2>
          {athlete.outlook.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className={`${styles.placementSection} ${styles.darkPlacement}`}>
        <p className={styles.placementLabel}>Related Video · Powered by Genuin</p>
        <ArticlePlacement
          articleSlug={`athlete-${athlete.slug}`}
          className={styles.relatedVideoHost}
          placementId="69f481cbe964b815fc225021"
          styleId="69f481d1e964b815fc22502c"
          testId="foil-athlete-related-video"
        />
      </section>

      <footer className={styles.footer}>
        © 2025 The Foil · SailGP Season Hub · <Link href="/home">← Back to Hub</Link>
      </footer>
    </main>
  );
}
