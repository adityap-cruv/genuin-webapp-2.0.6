"use client";
import { useEffect, useState } from "react";

import { onFloatingVideoClear, onFloatingVideoPresented } from "./events";
import { getFloatingVideoSession } from "./session-store";

/**
 * The id of the floating session this placement is currently *presenting as a card*, or null.
 *
 * Keyed to the presenter, not to the session: a session opens the moment a link is clicked,
 * but the navigation may still be in flight, and shrinking the player then would gut the page
 * the user is still looking at. The framing — and everything that follows from it, the compact
 * control layer and the released scroll lock — starts when the source route actually goes.
 */
export function useFloatingVideoSessionId(sourceDomId: string | null | undefined): string | null {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!sourceDomId) return;
    const adopt = (id: string) => {
      const session = getFloatingVideoSession();
      if (session?.sessionId === id && session.sourceDomId === sourceDomId) setSessionId(id);
    };

    // Already presented when this subtree (re)registers — Strict Mode double-invokes effects,
    // and lazy chunks can resolve after the hand-off.
    const presented = document.querySelector('[data-genuin-floating-video="true"]');
    const pending = getFloatingVideoSession();
    if (presented && pending) adopt(pending.sessionId);

    const offPromote = onFloatingVideoPresented(({ sessionId: id }) => adopt(id));
    const offClear = onFloatingVideoClear(({ sessionId: cleared }) =>
      setSessionId((current) => (current === cleared ? null : current))
    );
    return () => {
      offPromote();
      offClear();
    };
  }, [sourceDomId]);

  return sessionId;
}
