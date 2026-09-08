"use client";

import { DynamicSheet } from "@genuin/ui";
import { DynamicSheetOverlay } from "@genuin/ui/dynamic-sheet";
import { dialogManager } from "@genuin/ui/lib/dialog-manager";
import { getRootContainer } from "@genuin/ui/lib/shadow-dom.utils";
import { cn } from "@genuin/ui/lib/utils";
import { lazy, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import {
  IntelligenceChatSidePanel,
  type IntelligenceChatVideoContext,
} from "@genuin/components/organisms/intelligence-chat/intelligence-chat-side-panel";
import type { IntelligenceArticleSelectHandler } from "@genuin/components/organisms/intelligence-panel/intelligence-panel.types";
import { getArticleByHref, type Article } from "@genuin/components/page/article/article-data";

// Lazy: the article page (and its placements) only loads when an article card is
// actually tapped, never on plain chat usage.
const InlineArticleView = lazy(() =>
  import("@genuin/components/page/article/inline-article-view").then((m) => ({
    default: m.InlineArticleView,
  }))
);

/**
 * Bounds the conversation, not the sheet.
 *
 * With `height: "auto"` DynamicSheet leaves its content wrapper auto-sized (it has
 * to — measuring a `h-full` wrapper would be circular), so the chat panel renders
 * at its natural height. Once the answer is long that pushes the composer past the
 * sheet's cap and it can only be reached by scrolling. Capping the panel's own
 * scroll area instead keeps the panel's layout intact — heading on top, composer
 * pinned at the bottom, conversation scrolling between them — and keeps the
 * measured height inside the sheet's cap, so the sheet still grows with the answer.
 */
const INTELLIGENCE_SHEET_CSS = `
  [data-slot="intelligence-sheet-body"] [data-slot="intelligence-panel-scroll-content"] {
    max-height: 45vh;
  }
`;

/** Registry id used to mark the sheet as an open dialog (see the effect below). */
const INTELLIGENCE_SHEET_DIALOG_ID = "intelligence-chat-sheet";

type IntelligenceChatSheetProps = {
  /** Drives the sheet's open / close animation. */
  isOpen: boolean;
  /** Active video — the chat thread is scoped to it and remounts (key) on change. */
  videoId: string;
  /** Context about the active video, forwarded to the chat backend with each prompt. */
  videoContext?: IntelligenceChatVideoContext;
  /** Called when the sheet requests to close (drag-down, or the sparkle toggle). */
  onClose: () => void;
};

/**
 * Mobile Intelligence bottom sheet — the same `DynamicSheet` atom the Octo sheet
 * uses, wrapping the same chat panel the desktop right rail renders.
 *
 * `heights: { default: "auto" }` is what makes the sheet grow with the answer:
 * DynamicSheet measures its own chrome + body and re-measures whenever `children`
 * change, so the sheet opens compact and expands as blocks stream in rather than
 * jumping straight to a fixed 70vh.
 *
 * Deliberately chrome-less — no `navTitle`, no sheet-level close, no overlay: the
 * chat panel inside owns the only "Intelligence" heading and (via `showClose`) the
 * close control that sits opposite it, and the video stays visible behind.
 */
export function IntelligenceChatSheet({ isOpen, videoId, videoContext, onClose }: IntelligenceChatSheetProps) {
  // Register as an open dialog for as long as the sheet is up. This is the exact
  // mechanism the comments dialog relies on to stop the feed from swiping under
  // it: `swiper-implementation.tsx` subscribes to the registry and calls
  // `disable()` on the swiper while anything is registered. Keeping it here means
  // the player needs no knowledge of this sheet. It also suppresses the idle
  // auth modal (`use-interruption-manager.tsx`) mid-conversation, same as a dialog.
  useEffect(() => {
    if (!isOpen) return;
    dialogManager.registerDialog(INTELLIGENCE_SHEET_DIALOG_ID);
    return () => dialogManager.unregisterDialog(INTELLIGENCE_SHEET_DIALOG_ID);
  }, [isOpen]);

  // The article opened from a response card, presented in place instead of as a
  // route push — the same `InlineArticleView` the desktop rail opens, minus the
  // picture-in-picture video (that belongs to the desktop player's own layout,
  // and on a phone the article needs the whole screen anyway).
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const isArticleOpen = selectedArticle !== null;
  const closeArticle = useCallback(() => setSelectedArticle(null), []);

  // Same resolution as `player-swiper`'s desktop handler: a href the local article
  // data knows about opens in place; anything else falls through to normal link
  // navigation (returning `false` leaves the card's default intact).
  const handleArticleSelect = useCallback<IntelligenceArticleSelectHandler>((selection) => {
    const article = getArticleByHref(selection.href, window.location.origin) ?? getArticleByHref(selection.href);
    if (!article) return false;
    setSelectedArticle(article);
    return true;
  }, []);

  // Escape steps back to the conversation, not out of the sheet entirely.
  useEffect(() => {
    if (!isArticleOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      closeArticle();
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [closeArticle, isArticleOpen]);

  // Close the article whenever the sheet itself closes, so reopening the sparkle
  // always lands on the conversation.
  useEffect(() => {
    if (!isOpen) setSelectedArticle(null);
  }, [isOpen]);

  const surface = (
    // `swiper-no-swiping` + `stopPropagation` keep drags and taps inside the chat
    // from reaching the player behind it.
    <div className="swiper-no-swiping" onClick={(event) => event.stopPropagation()}>
      {/* Kept mounted (never unmounted) while the article is open so Back returns
          to the exact conversation the article was opened from. */}
      <div
        aria-hidden={isArticleOpen || undefined}
        inert={isArticleOpen || undefined}
        className={cn(isArticleOpen && "gencl:invisible gencl:pointer-events-none")}>
        {/* Dim + block everything behind the sheet, exactly like the comments
          dialog's Radix overlay. DynamicSheet's own overlay only renders for the
          `panel-view`/`full-view` states, and this sheet deliberately stays at
          `default` so the player never tiles the video — so the shared overlay
          part is mounted directly. At `z-40` it sits above the player chrome
          (the progress line is `z-20`) and below the sheet (`z-50`). */}
        <DynamicSheetOverlay theme="dark" position="fixed" isVisible={isOpen} onClick={onClose} aria-hidden="true" />
        <DynamicSheet
          isOpen={isOpen}
          renderMode="container"
          config={{
            initialState: "default",
            enabledStates: ["default"],
            // "auto" → DynamicSheet resolves this to a measured pixel height and
            // keeps it in sync with the conversation (dynamic-sheet.tsx:239).
            heights: { default: "auto" },
            showOverlay: false,
            // Drag off (same as the Octo sheet): DynamicSheet's pull-to-close arms
            // on every pointer-down where its content is at `scrollTop === 0`, and
            // takes pointer capture to do it. Our panel fits inside that content
            // area — the scrolling happens one level deeper, in the conversation —
            // so the sheet would capture every touch and the thread could never be
            // scrolled.
            disableDragAndSwipe: true,
            showIndicator: true,
            theme: "light",
            onClose,
          }}
          // `fixed!` overrides the inline `position: absolute` container mode sets
          // (an `!important` rule beats an inline style — same trick as
          // `octo-sheet-config.ts`). Needed because the expanded player's box is
          // taller than the visual viewport on phones, so a bottom-anchored absolute
          // sheet lands below the fold and its footer gets cut off. Going `fixed`
          // also makes `max-h-[70%]` resolve against the viewport, so the sheet can
          // never cover more of the video than that.
          className={cn(
            "gencl:fixed! gencl:bottom-0! gencl:left-0! gencl:right-0! gencl:z-50!",
            "gencl:max-h-[70%]! gencl:rounded-t-2xl! gencl:rounded-b-none! gencl:bg-white!"
          )}
          contentClassName="swiper-no-swiping"
          data-testid="intelligence-chat-sheet">
          <div data-slot="intelligence-sheet-body">
            <style>{INTELLIGENCE_SHEET_CSS}</style>
            <IntelligenceChatSidePanel
              key={`intelligence-sheet-${videoId}`}
              videoId={videoId}
              videoContext={videoContext}
              autoPromptOnMount
              showClose
              onClose={onClose}
              onArticleSelect={handleArticleSelect}
            />
          </div>
        </DynamicSheet>
      </div>

      {selectedArticle && (
        <SafeSuspense fallback={null} errorFallback={null}>
          {/* Full-screen on purpose: with no PIP video to sit beside, the article
              gets the whole viewport. `fixed` gives the view's own `inset-0` a
              containing block, and z-60 puts it above the sheet (z-50). */}
          <div className="gencl:fixed gencl:inset-0 gencl:z-60 gencl:overflow-hidden">
            <InlineArticleView key={selectedArticle.slug} article={selectedArticle} onBack={closeArticle} />
          </div>
        </SafeSuspense>
      )}
    </div>
  );

  // Portal to the SDK's root container, exactly like the comments dialog
  // (`dialog.tsx:123`). Rendered in place, the overlay is trapped inside the
  // expand view's `z-20` stacking context, so it cannot paint over the player's
  // progress line — a sibling of that context which comes later in DOM order.
  // z-index only ranks siblings within one context; hoisting to the root is what
  // actually puts the overlay above the player chrome.
  const container = getRootContainer();
  return container ? createPortal(surface, container) : surface;
}
