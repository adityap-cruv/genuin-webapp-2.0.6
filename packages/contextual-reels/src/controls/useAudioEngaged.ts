"use client";
/**
 * "Has the user performed an AUDIO action in this widget instance yet?"
 *
 * The mute icon starts as an enticement: a unit loads unmuted-but-silent
 * (`volume=0`, so `isMuted` is genuinely `true`), yet the icon shows "sound on"
 * to nudge the user to tap for audio. That enticement must end only when the
 * user does something *audio-related* — taps the mute/unmute control, or
 * unmutes via the ad tap-overlay (both surface as a `mute:unmuted` bus event).
 *
 * It must NOT end on generic interaction (play/pause, expand, a stray tap).
 * `useUserInteracted` flips on any pointer-down at the App root, so using it to
 * gate the mute icon makes a play/pause tap reveal the real (muted) state —
 * the icon jumps to "muted" for an action that has nothing to do with sound.
 * This hook is the audio-scoped replacement.
 *
 * The latch is one-directional: once an audio action has occurred the icon
 * tracks the real `isMuted` forever after (so a later system mute — e.g. an
 * autoplay-policy mute on the next ad — correctly shows the mute icon).
 *
 * The latch is per-WIDGET-INSTANCE, not per-component: it lives on the shared
 * bus, so a slide that mounts AFTER the user engaged audio on an earlier slide
 * still reads the engaged state (via `bus.hasFired`) instead of re-showing the
 * enticement. Plain subscription is not enough — it only delivers future
 * events, and the engaging `mute:unmuted` fired before the new slide mounted.
 */
import { useEffect, useState } from "react";

import { useOptionalEventBus } from "@cxr/instance/coordination/EventBusContext";

/**
 * Returns whether the user has performed an audio action (unmute) in this
 * instance. Re-renders the consumer once, when the first `mute:unmuted` fires.
 *
 * @param locallyEngaged - Optional component-local signal that the user has
 *   already engaged with audio (e.g. an immediate mute-button tap, before the
 *   bus event round-trips). OR-ed into the result so the icon flips synchronously.
 */
export function useAudioEngaged(locallyEngaged = false): boolean {
  // Degrades safely outside a provider (Storybook / standalone atom): no bus
  // means no `mute:unmuted`, so the enticement simply never auto-ends — matching
  // the old `useUserInteracted` safe-default of `false`.
  const bus = useOptionalEventBus();
  // Seed from the bus's one-way latch so a slide mounting after an earlier
  // slide's audio action starts already-engaged (no enticement flash).
  const [engaged, setEngaged] = useState(() => bus?.hasFired("mute:unmuted") ?? false);

  useEffect(() => {
    if (engaged || !bus) return;
    // Re-check on mount in case the event fired between render and effect.
    if (bus.hasFired("mute:unmuted")) {
      setEngaged(true);
      return;
    }
    return bus.on("mute:unmuted", () => setEngaged(true));
  }, [bus, engaged]);

  return engaged || locallyEngaged;
}
