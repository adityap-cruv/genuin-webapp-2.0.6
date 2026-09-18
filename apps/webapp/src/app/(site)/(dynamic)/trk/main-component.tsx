"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import Analytics from "@/services/analytics";
import { Loader } from "@components/ui/loader";

import { resolveRedirectTarget } from "./resolve-redirect";

/** Hard cap: redirect no later than this, even if analytics never signals delivery. */
const REDIRECT_CAP_MS = 2000;

/** How often to poll for the RudderStack global while waiting for AnalyticsProvider to install it. */
const RUDDERSTACK_POLL_MS = 50;

/**
 * `/trk` — ad/campaign redirect middleware. Fires a RudderStack "Page Viewed" event carrying the
 * ad tracking params, then redirects to a validated https `redirect_url` (or `/` on invalid input),
 * within {@link REDIRECT_CAP_MS}.
 *
 * A `/trk` hit is always a cold navigation, so `window.rudderanalytics` (installed by
 * `AnalyticsProvider` from an idle callback) usually does not exist yet when this effect runs.
 * Calling `track` too early would silently no-op and drop the campaign event. We therefore poll for
 * the RudderStack global and fire only once it exists — its stub queues the call and survives the
 * redirect via the provider's `pagehide`/`beforeunload` flush. The {@link REDIRECT_CAP_MS} timer is
 * the hard floor: if the global never appears in time we redirect anyway (best-effort logging).
 */
export function MainComponent() {
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    const target = resolveRedirectTarget(searchParams.get("redirect_url"));

    let capTimer = 0;
    let pollTimer = 0;

    const redirectOnce = () => {
      if (hasRedirected.current) return;
      hasRedirected.current = true;
      window.clearTimeout(capTimer);
      window.clearInterval(pollTimer);
      window.location.replace(target);
    };

    // Log all query params as a single `query_params` object, matching the standard pageview
    // payload convention (see AnalyticsProvider's default payload). The raw `user_id` param lives
    // nested here and never clobbers the top-level session user_id that Analytics.track injects.
    const properties = {
      query_params: Object.fromEntries(searchParams.entries()),
      ad_redirect_url: target,
    };

    const fireThenRedirect = () => {
      void Analytics.track({ eventName: "Page Viewed", properties, onSent: redirectOnce });
    };

    // `window.rudderanalytics` is set up by AnalyticsProvider and isn't declared on the Window
    // type; read it the same guarded way the analytics wrapper does.
    const rudderReady = () =>
      typeof window !== "undefined" && Boolean((window as { rudderanalytics?: unknown }).rudderanalytics);

    // Fire as soon as the RudderStack global is available so the event is queued before we
    // navigate; the hard cap below still wins if it never shows up in time.
    if (rudderReady()) {
      fireThenRedirect();
    } else {
      pollTimer = window.setInterval(() => {
        if (rudderReady()) {
          window.clearInterval(pollTimer);
          fireThenRedirect();
        }
      }, RUDDERSTACK_POLL_MS);
    }

    capTimer = window.setTimeout(redirectOnce, REDIRECT_CAP_MS);
    // No cleanup that clears the timers: the effect is guarded by `hasFired` so it runs once, and
    // StrictMode's dev remount must NOT tear down the armed timers (that would strand the user with
    // no redirect). `redirectOnce` clears both timers itself when it fires, and the only real
    // unmount of `/trk` is the redirect navigating away.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div role="status" aria-label="Redirecting" className="flex h-screen w-screen items-center justify-center">
      <Loader size="xl" />
    </div>
  );
}
