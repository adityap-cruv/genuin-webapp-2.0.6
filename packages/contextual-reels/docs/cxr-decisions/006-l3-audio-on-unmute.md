# ADR 006 — L3 (320×50) plays audio via a lazy, offscreen player

**Status**: Accepted

## Context

`AdProvider` marks both L3 (320×50) and L4 (320×100) as `isAudioOnlyAds` — the
compact banners are meant to be audio-forward: the user unmutes and hears the reel
while the bar shows identity, a ticker, and controls.

L4 delivers this by mounting a hidden 100px thumbnail `LightPlayer` beside the bar,
which is the actual media source. L3, however, originally rendered **only** the
`VideoControlLayer` bar and mounted no `<video>` at all (`renderL3` in
`src/feed/layouts/VideoLayout.tsx`). The mute button and the `CompactUnmuteOverlay`
toggled the shared player state (`volume` 0 → `DEFAULT_UNMUTE_VOLUME`) and swapped
the icon, but there was nothing to make audible — tapping "unmute" produced silence.

This affected both `video` and `video-with-ad` reels (both route through
`VideoLayout` → `renderL3`). Pure ad reels (`kind: "ad"` → `AdLayout`) were
unaffected: their audio comes from the GenAd SDK, unmuted synchronously via the
`ad:unmuteRequest` bus event in the click handler.

## Decision

`renderL3` mounts a `LightPlayer` for the reel, gated on a one-way `l3AudioEngaged`
latch:

- **Lazy and per-slide**: the latch flips `true` the first time this slide is both
  active and unmuted (`useEffect` on `isActive && !isMuted`). `isMuted` is shared
  feed-wide state, so the `isActive` gate is load-bearing — without it a single unmute
  would engage every off-screen `VideoLayout` at once and mount a hidden `LightPlayer`
  for the whole feed, defeating the no-decode goal. A slide the user never reaches and
  unmutes never fetches or decodes video.
- **Latched (never torn down once engaged)**: a subsequent re-mute pauses playback via
  `volume` 0 / `isPlay`, but the element stays mounted, so audio position is preserved
  and re-unmuting is instant.
- **Offscreen, not display:none**: the player is clipped to a 1px box positioned at
  `left: -9999px` with `opacity-0` and `pointer-events-none`. A 50px bar has no room
  for a frame, but the `<video>` must still be laid out so the browser decodes and
  plays its audio track (`display:none` would suspend it).
- **Ad-break aware**: `isPlay` includes `!adBreak.suppressVideo`, matching L1/L2/L4,
  so on a `video-with-ad` reel the reel's audio pauses while the fullscreen ad break
  is on screen (no overlapping reel + ad audio).

## Consequences

- L3 video-only and video-with-ad units are now audible at `initialVolume` on unmute,
  consistent with L4 and the `isAudioOnlyAds` intent.
- No behaviour change while muted: a never-unmuted L3 unit mounts no media element,
  so idle/silent resource usage is identical to before.
- The offscreen-clip technique depends on the element remaining in layout; a future
  refactor that switches it to `display:none` would silently break audio. The comment
  in `renderL3` calls this out.
- Pure ad (`AdLayout`) and all non-compact layouts (L1/L2) are untouched.
