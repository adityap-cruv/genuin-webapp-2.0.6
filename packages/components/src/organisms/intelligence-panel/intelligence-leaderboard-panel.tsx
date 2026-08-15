"use client";

import { Image } from "@genuin/ui/components/image";
import { Heading, Text } from "@genuin/ui/components/typography";
import { cn } from "@genuin/ui/lib/utils";
import { ArrowUpRight } from "lucide-react";
import * as React from "react";

import { Link } from "@genuin/components/molecules/link";

import { IntelligencePanelShell } from "./intelligence-panel-shell";
import type {
  IntelligenceLeaderboardEntry,
  IntelligenceLeaderboardPanelProps,
  IntelligenceLeaderboardView,
} from "./intelligence-panel.types";

const DEFAULT_ACCENT = "#d4ad00";
const ACTIVE_TAB_CLIP = "polygon(0 0, 100% 0, 100% 72%, 94% 100%, 0 100%)";

function FoilSectionHeader({ view }: { view: IntelligenceLeaderboardView }) {
  return (
    <header className="gencl:pb-1">
      <Text
        as="p"
        size="body-4"
        weight="medium"
        className="gencl:mb-1 gencl:text-[10px]! gencl:tracking-[-0.01em] gencl:text-[#ef2525]">
        {view.eyebrow}
      </Text>
      <Heading
        as="h3"
        level="headline-3"
        weight="bold"
        className="gencl:text-[25px]! gencl:leading-[1.05]! gencl:font-bold! gencl:tracking-[-0.035em] gencl:text-white">
        {view.title}
      </Heading>
      <Text as="p" size="body-4" className="gencl:mt-1.5 gencl:text-[10px]! gencl:text-secondary-400">
        {view.subtitle}
      </Text>
    </header>
  );
}

function LeaderboardHero({ view }: { view: IntelligenceLeaderboardView }) {
  if (!view.hero) return null;

  return (
    <article
      data-slot="intelligence-leaderboard-hero"
      className="gencl:relative gencl:h-36 gencl:overflow-hidden gencl:bg-black gencl:text-white"
      style={{ clipPath: "polygon(7% 0, 100% 0, 100% 100%, 0 100%, 0 15%)" }}>
      <Image
        src={view.hero.image.src}
        alt={view.hero.image.alt}
        handleError
        className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover gencl:grayscale"
      />
      <div
        aria-hidden="true"
        className="gencl:absolute gencl:inset-0 gencl:bg-linear-to-t gencl:from-black/95 gencl:via-black/45 gencl:to-black/10"
      />

      <div className="gencl:absolute gencl:inset-x-0 gencl:bottom-0 gencl:flex gencl:items-end gencl:justify-between gencl:gap-3 gencl:p-3">
        <div className="gencl:min-w-0">
          <Text
            as="p"
            size="body-4"
            weight="medium"
            className="gencl:mb-1 gencl:text-[9px]! gencl:tracking-[0.08em] gencl:text-[#e1bd20] gencl:uppercase">
            {view.hero.label}
          </Text>
          <Heading
            as="h4"
            level="headline-4"
            weight="bold"
            className="gencl:text-[16px]! gencl:leading-4.5! gencl:font-bold! gencl:text-white">
            {view.hero.title}
          </Heading>
          <Text as="p" size="body-4" className="gencl:mt-1 gencl:text-[9px]! gencl:text-secondary-200">
            {view.hero.meta}
          </Text>
        </div>

        <div
          aria-hidden="true"
          className="gencl:flex gencl:h-10 gencl:min-w-10 gencl:shrink-0 gencl:items-center gencl:justify-center gencl:bg-[#d4ad00] gencl:px-2 gencl:text-[11px] gencl:font-bold gencl:text-black"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 72% 100%, 0 100%)" }}>
          {view.hero.badge}
        </div>
      </div>
    </article>
  );
}

function TeamMark({ entry }: { entry: IntelligenceLeaderboardEntry }) {
  return (
    <span aria-hidden="true" className="gencl:relative gencl:block gencl:h-5 gencl:w-6 gencl:shrink-0">
      <span
        className="gencl:absolute gencl:top-0 gencl:left-0 gencl:h-4 gencl:w-5"
        style={{
          backgroundColor: entry.accentColor ?? DEFAULT_ACCENT,
          clipPath: "polygon(0 58%, 100% 0, 72% 44%, 100% 78%, 35% 59%, 12% 100%)",
        }}
      />
    </span>
  );
}

function LeaderboardTable({ view }: { view: IntelligenceLeaderboardView }) {
  return (
    <table data-slot="intelligence-leaderboard-table" className="gencl:w-full gencl:border-collapse gencl:table-fixed">
      <caption className="gencl:sr-only">{view.title}</caption>
      <colgroup>
        <col className="gencl:w-8" />
        <col />
        <col className="gencl:w-12" />
      </colgroup>
      <thead>
        <tr className="gencl:border-b gencl:border-white gencl:text-left">
          <th scope="col" className="gencl:px-0 gencl:py-2 gencl:text-[9px] gencl:font-bold gencl:text-white">
            Pos
          </th>
          <th scope="col" className="gencl:px-1 gencl:py-2 gencl:text-[9px] gencl:font-bold gencl:text-white">
            Team / driver
          </th>
          <th
            scope="col"
            className="gencl:px-0 gencl:py-2 gencl:text-right gencl:text-[9px] gencl:font-bold gencl:text-white">
            Points
          </th>
        </tr>
      </thead>
      <tbody>
        {view.entries.map((entry) => (
          <tr key={entry.id} className="gencl:border-b gencl:border-secondary-700 gencl:bg-secondary-900">
            <td className="gencl:px-0 gencl:py-2.5 gencl:align-middle">
              <Text
                as="span"
                size="body-4"
                className={cn("gencl:text-[11px]! gencl:text-white", entry.position <= 3 && "gencl:font-bold!")}>
                {entry.position}
              </Text>
            </td>
            <td className="gencl:min-w-0 gencl:px-1 gencl:py-2.5 gencl:align-middle">
              <div className="gencl:flex gencl:min-w-0 gencl:items-center gencl:gap-2">
                <TeamMark entry={entry} />
                <div className="gencl:min-w-0">
                  <Text
                    as="p"
                    size="body-4"
                    weight="medium"
                    className="gencl:truncate gencl:text-[11px]! gencl:leading-3.5! gencl:text-white gencl:underline gencl:decoration-white/45 gencl:underline-offset-2">
                    {entry.team}
                  </Text>
                  <Text
                    as="p"
                    size="body-4"
                    className="gencl:truncate gencl:text-[9px]! gencl:leading-3! gencl:text-secondary-400">
                    {entry.participant}
                  </Text>
                </div>
              </div>
            </td>
            <td className="gencl:px-0 gencl:py-2.5 gencl:text-right gencl:align-middle">
              <Text as="span" size="body-4" weight="medium" className="gencl:text-[11px]! gencl:text-white">
                {entry.points}
              </Text>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Compact adaptation of The Foil's standings treatment for Intelligence. */
export const IntelligenceLeaderboardPanel = React.forwardRef<HTMLElement, IntelligenceLeaderboardPanelProps>(
  function IntelligenceLeaderboardPanel(
    { views, defaultViewId, fullStandingsHref, sourceLabel, size, onClose, className, ...props },
    ref
  ) {
    const tabsId = React.useId();
    const [selectedViewId, setSelectedViewId] = React.useState(defaultViewId ?? views[0]?.id);
    const selectedView = views.find((view) => view.id === selectedViewId) ?? views[0];

    return (
      <IntelligencePanelShell
        ref={ref}
        data-slot="intelligence-leaderboard-panel"
        size={size}
        onClose={onClose}
        className={className}
        {...props}>
        {selectedView ? (
          <div className="gencl:mt-2 gencl:flex gencl:min-h-full gencl:flex-col gencl:gap-3 gencl:bg-secondary-900 gencl:p-3 gencl:text-white">
            <FoilSectionHeader view={selectedView} />

            <LeaderboardHero view={selectedView} />

            {views.length > 1 && (
              <div role="tablist" aria-label="Leaderboard view" className="gencl:grid gencl:grid-cols-2 gencl:gap-2">
                {views.map((view, viewIndex) => {
                  const isSelected = view.id === selectedView.id;

                  return (
                    <button
                      key={view.id}
                      id={`${tabsId}-tab-${view.id}`}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      aria-controls={`${tabsId}-panel`}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => setSelectedViewId(view.id)}
                      onKeyDown={(event) => {
                        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

                        event.preventDefault();
                        const nextIndex =
                          event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? views.length - 1
                              : (viewIndex + (event.key === "ArrowRight" ? 1 : -1) + views.length) % views.length;
                        const nextView = views[nextIndex];
                        if (!nextView) return;

                        setSelectedViewId(nextView.id);
                        event.currentTarget.parentElement
                          ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                          [nextIndex]?.focus();
                      }}
                      className={cn(
                        "gencl:h-9 gencl:border gencl:px-2 gencl:text-[9px] gencl:font-medium gencl:transition-colors",
                        "gencl:focus-visible:outline-none gencl:focus-visible:ring-2 gencl:focus-visible:ring-[#d4ad00]",
                        isSelected
                          ? "gencl:border-[#d4ad00] gencl:bg-[#d4ad00] gencl:text-black"
                          : "gencl:border-white/50 gencl:bg-secondary-900 gencl:text-white gencl:hover:bg-white/10"
                      )}
                      style={isSelected ? { clipPath: ACTIVE_TAB_CLIP } : undefined}>
                      {view.tabLabel}
                    </button>
                  );
                })}
              </div>
            )}

            <div
              id={`${tabsId}-panel`}
              role={views.length > 1 ? "tabpanel" : undefined}
              aria-labelledby={views.length > 1 ? `${tabsId}-tab-${selectedView.id}` : undefined}>
              <LeaderboardTable view={selectedView} />
            </div>

            <footer className="gencl:flex gencl:items-center gencl:justify-between gencl:gap-3 gencl:pb-2">
              <Text as="p" size="body-4" className="gencl:text-[9px]! gencl:text-secondary-400">
                Source: {sourceLabel}
              </Text>
              <Link
                href={fullStandingsHref}
                className={cn(
                  "gencl:inline-flex gencl:h-7 gencl:items-center gencl:gap-1 gencl:bg-[#ed1c24] gencl:px-3 gencl:text-[9px] gencl:font-medium",
                  "gencl:text-white gencl:no-underline gencl:transition-[filter] gencl:hover:brightness-95",
                  "gencl:focus-visible:outline-none gencl:focus-visible:ring-2 gencl:focus-visible:ring-black"
                )}
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 88% 100%, 0 100%)" }}>
                Full standings
                <ArrowUpRight aria-hidden="true" className="gencl:size-3" />
              </Link>
            </footer>
          </div>
        ) : (
          <div className="gencl:flex gencl:min-h-48 gencl:items-center gencl:justify-center gencl:px-6 gencl:text-center">
            <Text as="p" size="body-3" className="gencl:text-secondary-500">
              Standings are not available yet.
            </Text>
          </div>
        )}
      </IntelligencePanelShell>
    );
  }
);
