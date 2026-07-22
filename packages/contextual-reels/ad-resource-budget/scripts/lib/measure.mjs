// measure.mjs — load the host page, attribute network bytes / requests / CPU to
// the ad frame subtree, and split initial vs. subload at the page load event.
// All measurement is over CDP (the same signals DevTools shows), which matches
// how Chrome's Heavy Ad Intervention accounts for resources.
// Import the browser from @playwright/test, which @genuin/contextual-reels
// already declares as a dev dependency — so the harness needs no separate
// `playwright` install and everything stays within the package.
import { chromium } from '@playwright/test';
import { interact } from './interact.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function measureOnce({
  url, observeMs, settleMs, cpuSampleMs, cpuThrottle,
  interactionState = 'non-interacted', postInteractObserveMs = 10000,
}) {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      // Make HAI thresholds deterministic if Chrome were to evaluate them; we
      // assert them ourselves regardless.
      '--disable-features=HeavyAdPrivacyMitigations',
    ],
  });

  try {
    // Fresh context with cache disabled => every build measures a cold load.
    const context = await browser.newContext({ bypassCSP: true });
    const page = await context.newPage();
    const client = await context.newCDPSession(page);

    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    await client.send('Page.enable');
    await client.send('Page.setLifecycleEventsEnabled', { enabled: true });
    await client.send('Performance.enable');
    if (cpuThrottle && cpuThrottle > 1) {
      await client.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottle });
    }

    // CDP's Network/Page timestamps are monotonic seconds since the browser
    // process started — a different clock than Date.now(). The offset between
    // the two is constant for the session, so capturing it once from the first
    // timestamped event lets later code (the post-interact boundary) convert a
    // wall-clock Date.now() reading into the same monotonic base as loadTs/startTs.
    let monoToWallOffsetMs = null;
    const noteClockOffset = (monotonicTs) => {
      if (monoToWallOffsetMs === null) monoToWallOffsetMs = Date.now() - monotonicTs * 1000;
    };

    // ---- request tracking -------------------------------------------------
    const requests = new Map(); // requestId -> record
    client.on('Network.requestWillBeSent', (e) => {
      noteClockOffset(e.timestamp);
      requests.set(e.requestId, {
        url: e.request.url,
        frameId: e.frameId,
        startTs: e.timestamp, // monotonic seconds
        type: e.type,
        bytes: 0,
        finished: false,
      });
    });
    client.on('Network.loadingFinished', (e) => {
      const r = requests.get(e.requestId);
      if (r) { r.bytes = e.encodedDataLength || 0; r.finished = true; }
    });
    client.on('Network.loadingFailed', (e) => {
      const r = requests.get(e.requestId);
      if (r) { r.failed = true; }
    });

    // ---- frame tracking ---------------------------------------------------
    // The ad subtree may grow after load (tags inject iframes), so keep it live.
    const adFrames = new Set();
    const parentOf = new Map();
    client.on('Page.frameAttached', (e) => {
      parentOf.set(e.frameId, e.parentFrameId);
      if (adFrames.has(e.parentFrameId)) adFrames.add(e.frameId);
    });
    client.on('Page.frameNavigated', (e) => {
      const f = e.frame;
      if (f.parentId) parentOf.set(f.id, f.parentId);
      if (f.parentId && adFrames.has(f.parentId)) adFrames.add(f.id);
    });

    // ---- page load boundary (initial vs subload) --------------------------
    let mainFrameId = null;
    let loadTs = null; // monotonic seconds of main-frame 'load'
    client.on('Page.lifecycleEvent', (e) => {
      noteClockOffset(e.timestamp);
      if (e.name === 'load' && e.frameId === mainFrameId && loadTs === null) {
        loadTs = e.timestamp;
      }
    });

    // ---- CPU sampling -----------------------------------------------------
    const cpuSamples = []; // { t: wallSeconds, taskDuration: seconds }
    const t0 = Date.now();
    const readTaskDuration = async () => {
      const { metrics } = await client.send('Performance.getMetrics');
      const m = metrics.find((x) => x.name === 'TaskDuration');
      return m ? m.value : 0;
    };
    const baselineTaskDuration = await readTaskDuration();
    const sampler = setInterval(async () => {
      try {
        const td = await readTaskDuration();
        cpuSamples.push({ t: (Date.now() - t0) / 1000, taskDuration: td });
      } catch { /* page may be navigating */ }
    }, cpuSampleMs);

    // Resolve the main frame id up front so the 'load' boundary can only be
    // taken from the main frame, never from a fast-loading subframe. The main
    // frame keeps its id across the upcoming navigation.
    const pre = await client.send('Page.getFrameTree');
    mainFrameId = pre.frameTree.frame.id;

    // ---- navigate & observe ----------------------------------------------
    await page.goto(`${url}/host.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Resolve the ad subtree from the frame tree.
    const { frameTree } = await client.send('Page.getFrameTree');
    const walk = (node, inAd) => {
      const id = node.frame.id;
      if (node.frame.parentId) parentOf.set(id, node.frame.parentId);
      const isAd = inAd || node.frame.name === 'ad-under-test';
      if (isAd) adFrames.add(id);
      for (const child of node.childFrames || []) walk(child, isAd);
    };
    walk(frameTree, false);

    // Observe for the configured window so timers/animations/subloads run.
    await sleep(observeMs + settleMs);

    // ---- optional interaction step -----------------------------------------
    // Only runs for the 'interacted' state; the non-interacted path below is
    // otherwise byte-for-byte identical to before this param existed.
    let interactTs = null;
    let interactionResult = null;
    let interactBaselineTaskDuration = null;
    if (interactionState === 'interacted') {
      interactionResult = await interact(page);
      // Convert to the same monotonic base as loadTs/startTs (see noteClockOffset
      // above). Falls back to loadTs-relative-never-null 0 offset in the
      // (practically unreachable) case no request has fired yet.
      interactTs = (Date.now() - (monoToWallOffsetMs ?? 0)) / 1000;
      interactBaselineTaskDuration = await readTaskDuration();
      await sleep(postInteractObserveMs);
    }

    clearInterval(sampler);
    const finalTaskDuration = await readTaskDuration();
    cpuSamples.push({ t: (Date.now() - t0) / 1000, taskDuration: finalTaskDuration });

    // ---- attribute requests to the ad subtree -----------------------------
    let initialBytes = 0, subloadBytes = 0, totalBytes = 0;
    let initialCount = 0, subloadCount = 0;
    let postInteractionBytes = 0, postInteractionCount = 0;
    const items = [];
    for (const r of requests.values()) {
      if (!adFrames.has(r.frameId)) continue; // only the ad subtree counts
      // 3-way phase: 'initial' (before load), 'subload' (after load, before
      // interaction or if never interacted), 'post-interaction' (after the
      // interact step — only possible when interactionState === 'interacted').
      let phase;
      if (loadTs === null || r.startTs <= loadTs) phase = 'initial';
      else if (interactTs !== null && r.startTs > interactTs) phase = 'post-interaction';
      else phase = 'subload';

      totalBytes += r.bytes;
      if (phase === 'initial') { initialBytes += r.bytes; initialCount += 1; }
      else if (phase === 'post-interaction') { postInteractionBytes += r.bytes; postInteractionCount += 1; }
      else { subloadBytes += r.bytes; subloadCount += 1; }
      items.push({ url: r.url, bytes: r.bytes, phase, type: r.type, failed: !!r.failed });
    }
    // Heaviest requests, for the report.
    items.sort((a, b) => b.bytes - a.bytes);

    // ---- CPU derivations --------------------------------------------------
    const cpuTotalSeconds = Math.max(0, finalTaskDuration - baselineTaskDuration);
    const postInteractionCpuSeconds = interactBaselineTaskDuration !== null
      ? Math.max(0, finalTaskDuration - interactBaselineTaskDuration)
      : 0;
    const observedSeconds = (Date.now() - t0) / 1000;
    const cpuAveragePercent = observedSeconds > 0 ? (cpuTotalSeconds / observedSeconds) * 100 : 0;

    // Peak main-thread time in any 30s sliding window over the samples.
    const windowSeconds = 30;
    let cpuPeakWindowSeconds = 0;
    let peakWindowObserved = observedSeconds >= windowSeconds;
    if (cpuSamples.length >= 2) {
      for (let j = 0; j < cpuSamples.length; j++) {
        // find earliest sample i within `windowSeconds` before j
        let i = 0;
        for (let k = j; k >= 0; k--) {
          if (cpuSamples[j].t - cpuSamples[k].t <= windowSeconds) i = k; else break;
        }
        const delta = cpuSamples[j].taskDuration - cpuSamples[i].taskDuration;
        if (delta > cpuPeakWindowSeconds) cpuPeakWindowSeconds = delta;
      }
    }

    await context.close();

    return {
      transferredBytesTotal: totalBytes,
      initialTransferredBytes: initialBytes,
      subloadTransferredBytes: subloadBytes,
      initialRequestCount: initialCount,
      subloadRequestCount: subloadCount,
      cpuTotalSeconds,
      cpuPeakWindowSeconds,
      cpuPeakWindowObserved: peakWindowObserved,
      cpuAveragePercent,
      observedSeconds,
      loadEventSeen: loadTs !== null,
      adFrameCount: adFrames.size,
      topRequests: items.slice(0, 10),
      requestCount: items.length,
      // Interacted-state fields — zero/absent-shaped when interactionState is
      // 'non-interacted' (interactTs stays null so every request falls into
      // 'initial'/'subload' as before, and postInteractionCpuSeconds is 0).
      interacted: interactionState === 'interacted',
      postInteractionTransferredBytes: postInteractionBytes,
      postInteractionRequestCount: postInteractionCount,
      postInteractionCpuSeconds,
      expandAttempted: interactionResult?.expandAttempted ?? false,
      expandFound: interactionResult?.expandFound ?? false,
      swipeAttempted: interactionResult?.swipeAttempted ?? false,
      swipeSucceeded: interactionResult?.swipeSucceeded ?? false,
    };
  } finally {
    await browser.close();
  }
}

// Run N times and keep the worst case per metric (ad tags vary run-to-run).
export async function measure({
  url, observeMs, settleMs, cpuSampleMs, cpuThrottle, runs,
  interactionState, postInteractObserveMs,
}) {
  const all = [];
  for (let i = 0; i < (runs || 1); i++) {
    all.push(await measureOnce({
      url, observeMs, settleMs, cpuSampleMs, cpuThrottle, interactionState, postInteractObserveMs,
    }));
  }
  if (all.length === 1) return { ...all[0], runs: 1 };

  const worstMax = (key) => Math.max(...all.map((r) => r[key]));
  return {
    ...all[all.length - 1],
    runs: all.length,
    transferredBytesTotal: worstMax('transferredBytesTotal'),
    initialTransferredBytes: worstMax('initialTransferredBytes'),
    subloadTransferredBytes: worstMax('subloadTransferredBytes'),
    initialRequestCount: worstMax('initialRequestCount'),
    subloadRequestCount: worstMax('subloadRequestCount'),
    cpuTotalSeconds: worstMax('cpuTotalSeconds'),
    cpuPeakWindowSeconds: worstMax('cpuPeakWindowSeconds'),
    cpuAveragePercent: worstMax('cpuAveragePercent'),
    postInteractionTransferredBytes: worstMax('postInteractionTransferredBytes'),
    postInteractionRequestCount: worstMax('postInteractionRequestCount'),
    postInteractionCpuSeconds: worstMax('postInteractionCpuSeconds'),
    perRun: all,
  };
}
