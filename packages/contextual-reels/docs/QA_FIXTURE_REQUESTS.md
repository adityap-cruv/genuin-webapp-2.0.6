# QA fixture requests — ad-ops handoff

Three asks for ad-ops. None is engineering work; each unblocks E2E coverage that
is otherwise impossible, and the third is a probable live config bug.

Raised 2026-08-15 alongside the E2E rebuild. Current gaps are listed in
[`tests/e2e/README.md`](../tests/e2e/README.md#known-gaps).

---

## 1. A QA tag whose content clip is long enough to reach the ad break

**Unblocks:** AB-1 (fullscreen ad break) and, through it, `gateOnUnmute`.

`useFullscreenAdBreak` + `PlayerProvider.isAdBreakActive` are live in production.
The break triggers at a position in the content video that the current QA clip —
plus headless playback speed — never reaches, so it cannot be driven from the
harness at all.

`gateOnUnmute` rides on the same blocker. Measured while writing these specs: the
tag-level flag is only forwarded into `buildReelAdObject` /
`buildReelAdObjectFromConfig`, i.e. the **ad-break object on an organic video
reel**. A standalone `type: "ads"` slide never consults it. So the only path that
can exercise the flag is the ad break, and the ad break needs this fixture. With
`adBreakEnabled: true` and either value of `gateOnUnmute`, **zero** waterfall
requests fire within 8s today.

**What we need:** one QA tag, video feed, with a content clip long enough that the
break fires within ~15s of playback. Duration is the only requirement — reel
content, advertiser and creative are irrelevant.

---

## 2. A QA ad config that can be made to no-fill on demand

**Unblocks:** `singleHitWaterfall`, and the long-standing SY-1 / NF-1 gaps from
[ADR 004](cxr-decisions/004-e2e-real-genad.md).

The QA ad config always fills, which is exactly what makes the fill path testable
— and exactly what makes every no-fill path untestable.

`singleHitWaterfall`'s contract is **not** "one ad request per page load". Per
`AdProvider.onAdFail`, it defers the no-fill passback until every slot has failed
(`firePassbackIfExhausted`). Measured: with the flag ON, a looped-back second slot
**does** issue a second `/tagxml/` request. So observing what the flag actually
does requires a genuine no-fill, which we cannot produce.

(The `feedLoopEnabled` doc comment previously claimed single-hit prevented a
looped-back re-request. It does not; that comment has been corrected.)

**What we need:** either a QA tag whose waterfall reliably no-fills, or a
documented way to force a no-fill on an existing QA tag (a query param, a
zero-CPM config, a dedicated placement).

---

## 3. ⚠️ `TAG_EXPERIMENTS` looks inert in production — please confirm

**Not a test gap. A probable live config bug.**

`strategyConfig.ts` defines a 10%-of-loads experiment on three tags:

```ts
"6a3aa8244da8cd92d289cc72": {
  sampleRate: 0.1,
  overrides: { gateOnUnmute: false, mutePassback: false },
},
```

Both overrides concern **ads**. But that tag's feed is 6 `loop` reels with **no
ads at all** — so:

- `gateOnUnmute: false` has no ad request to ungate, and (per §1) would not apply
  to a standalone ad slide even if there were one; it only reaches an ad-break
  object, and that tag has no `adBreakEnabled`.
- `mutePassback: false` matches the tag's resolved base value already (`false` by
  default), so it changes nothing.

Net: for this tag the experiment appears to be a no-op — 10% of loads are being
bucketed into a variant identical to the control. If the intent was to measure
ungated ad requests, it is not measuring anything.

The same override pair is configured on `6a032e34054c8fcb08582510` and
`6a032de445fa9f171bd291cb`, which do carry `mutePassback: true` at base — so the
override is meaningful _there_. It is specifically the `6a3aa…` entry that looks
wrong.

**What we need:** confirmation of the intent. If the experiment should be
measuring something, it likely belongs on a tag with ads. If it is dead, removing
the entry would remove a source of per-load nondeterminism.

Worth knowing: that nondeterminism was a real cost. Each Playwright test gets a
fresh context, so the bucket was redrawn per test and silently flipped config on
~10% of runs — a live flake source in the previous suite. The harness now pins the
roll (`mountWidget`'s `experimentRoll`, defaulting out of every bucket), so the
suite is stable regardless of how this resolves.

---

## Why these are worth doing

They are the entire remaining E2E gap list for the package, minus accessibility
(blocked on a dependency approval and an owner, not on ad-ops). Two fixtures close
four documented gaps at zero engineering cost, and the third is a config question
that costs nothing to answer.
