"use client";

import { Home, type ChampionshipEntry } from "@genuin/components/page/home/home";
import { useCallback, useEffect, useRef, useState } from "react";

import { FoilBeyondStoryPage } from "../foil/_components/foil-beyond-story-page";
import { FoilEventPage } from "../foil/_components/foil-event-page";
import { FoilLocalAthletePage } from "../foil/_components/foil-athlete-page";
import { FoilLocalArticlePage } from "../foil/_components/foil-source-page";
import { getFoilBeyondStory } from "../foil/_data/foil-beyond-stories";
import { getFoilArticle } from "../foil/_data/foil-articles";
import { getFoilAthlete } from "../foil/_data/foil-athletes";
import { getFoilEvent } from "../foil/_data/foil-events";

import styles from "./client-page.module.css";

type DrawerSelection =
  | { kind: "article"; slug: string }
  | { kind: "athlete"; slug: string }
  | { kind: "championship"; entry: ChampionshipEntry }
  | { kind: "calendar"; slug: string }
  | { kind: "beyond"; slug: string }
  | null;
type DrawerState = "opening" | "open" | "closing";

const DRAWER_TRANSITION_MS = 450;

export function HomeClientPage() {
  const [selection, setSelection] = useState<DrawerSelection>(null);
  const [drawerState, setDrawerState] = useState<DrawerState>("open");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const homeLayerRef = useRef<HTMLDivElement>(null);
  const shouldRestoreFocusRef = useRef(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openContent = useCallback((nextSelection: Exclude<DrawerSelection, null>) => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDrawerState(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "open" : "opening");
    setSelection(nextSelection);
  }, []);

  const completeClose = useCallback(() => {
    closeTimerRef.current = null;
    shouldRestoreFocusRef.current = true;
    setSelection(null);
    setDrawerState("open");
  }, []);

  const closeContent = useCallback(() => {
    if (!selection || drawerState === "closing") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      completeClose();
      return;
    }

    setDrawerState("closing");
    closeTimerRef.current = window.setTimeout(completeClose, DRAWER_TRANSITION_MS);
  }, [completeClose, drawerState, selection]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    },
    []
  );

  useEffect(() => {
    homeLayerRef.current?.toggleAttribute("inert", selection !== null);
    if (!selection) {
      if (shouldRestoreFocusRef.current) {
        shouldRestoreFocusRef.current = false;
        window.requestAnimationFrame(() => triggerRef.current?.focus());
      }
      return;
    }

    closeButtonRef.current?.focus({ preventScroll: true });
  }, [selection]);

  useEffect(() => {
    if (!selection || drawerState !== "opening") return;

    const animationFrame = window.requestAnimationFrame(() => setDrawerState("open"));
    return () => window.cancelAnimationFrame(animationFrame);
  }, [drawerState, selection]);

  useEffect(() => {
    if (!selection) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      // The SDK owns Escape while its expanded video viewer is mounted.
      // Keeping the article drawer open lets the viewer close back to the
      // same article and preserves the drawer's current scroll position.
      if (document.getElementById("genuin-overlay-host-expand-view")) return;

      closeContent();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeContent, selection]);

  const article = selection?.kind === "article" ? getFoilArticle(selection.slug) : undefined;
  const athlete = selection?.kind === "athlete" ? getFoilAthlete(selection.slug) : undefined;
  const championship = selection?.kind === "championship" ? selection.entry : undefined;
  const calendarEvent = selection?.kind === "calendar" ? getFoilEvent(selection.slug) : undefined;
  const beyondStory = selection?.kind === "beyond" ? getFoilBeyondStory(selection.slug) : undefined;
  const drawerTitle =
    article?.title ??
    athlete?.name ??
    championship?.driver ??
    calendarEvent?.venue ??
    beyondStory?.title ??
    "Foil content unavailable";

  return (
    <div className={styles.shell}>
      <div ref={homeLayerRef} className={styles.homeLayer} aria-hidden={selection ? true : undefined}>
        <Home
          onOpenArticle={(slug) => openContent({ kind: "article", slug })}
          onOpenAthlete={(slug) => openContent({ kind: "athlete", slug })}
          onOpenChampionship={(entry) => openContent({ kind: "championship", entry })}
          onOpenCalendar={(slug) => openContent({ kind: "calendar", slug })}
          onOpenBeyond={(slug) => openContent({ kind: "beyond", slug })}
        />
      </div>

      {selection ? (
        <section
          className={styles.drawer}
          role="dialog"
          aria-modal="true"
          aria-labelledby="foil-content-drawer-title"
          data-state={drawerState}
          data-testid="foil-content-drawer">
          <h2 id="foil-content-drawer-title" className={styles.srOnly}>
            {drawerTitle}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            aria-label="Close content"
            data-testid="foil-content-drawer-close"
            disabled={drawerState === "closing"}
            onClick={closeContent}>
            <span aria-hidden="true">×</span>
          </button>
          <div className={styles.drawerBody}>
            {article ? <FoilLocalArticlePage article={article} presentation="drawer" /> : null}
            {athlete ? <FoilLocalAthletePage athlete={athlete} presentation="drawer" /> : null}
            {championship ? <ChampionshipDetail entry={championship} /> : null}
            {calendarEvent ? <FoilEventPage event={calendarEvent} /> : null}
            {beyondStory ? <FoilBeyondStoryPage story={beyondStory} /> : null}
            {!article && !athlete && !championship && !calendarEvent && !beyondStory ? (
              <div className={styles.unavailable}>
                <h3>Content unavailable</h3>
                <p>This Foil story could not be loaded.</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ChampionshipDetail({ entry }: { entry: ChampionshipEntry }) {
  const trend = entry.trend.replace(/^[▲▼●]\s*/, "").toLowerCase();

  return (
    <main className={styles.championshipDetail}>
      <header className={styles.championshipHeader}>
        <div className={styles.championshipHeaderInner}>
          <p>2025 Season Championship</p>
          <h1>{entry.driver}</h1>
          <span>
            {entry.flag} · {entry.team}
          </span>
        </div>
      </header>

      <section className={styles.championshipStats} aria-label={`${entry.driver} championship statistics`}>
        <div>
          <span>Rank</span>
          <strong>{entry.rank}</strong>
        </div>
        <div>
          <span>Points</span>
          <strong>{entry.points}</strong>
        </div>
        <div>
          <span>Latest result</span>
          <strong>{entry.lastEvent}</strong>
        </div>
        <div>
          <span>Trend</span>
          <strong>{entry.trend}</strong>
        </div>
      </section>

      <section className={styles.championshipCopy}>
        <h2>{entry.team}</h2>
        <p>
          {entry.driver} is currently ranked {entry.rank} in the 2025 Season Championship with {entry.points} points
          through 8 of 13 events.
        </p>
        <p>
          The latest listed result is {entry.lastEvent}, and the team&apos;s current championship trend is {trend}.
        </p>
      </section>
    </main>
  );
}
