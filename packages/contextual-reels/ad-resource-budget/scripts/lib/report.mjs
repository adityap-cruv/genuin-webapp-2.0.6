// report.mjs — compare measurements to the budget, format a console report, and
// compute pass/fail.
const C = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  dim: '\x1b[2m', bold: '\x1b[1m', cyan: '\x1b[36m',
};

function fmt(value, unit) {
  if (unit === 'bytes') {
    if (value >= 1024 * 1024) return `${(value / 1048576).toFixed(2)} MB`;
    return `${(value / 1024).toFixed(1)} KB`;
  }
  if (unit === 's') return `${value.toFixed(1)} s`;
  if (unit === '%') return `${value.toFixed(1)}%`;
  return String(value);
}

// Map each limit key to the measured field it checks.
const METRIC_OF = {
  transferredBytesTotal: 'transferredBytesTotal',
  cpuTotalSeconds: 'cpuTotalSeconds',
  cpuPeakWindowSeconds: 'cpuPeakWindowSeconds',
  initialTransferredBytes: 'initialTransferredBytes',
  initialRequestCount: 'initialRequestCount',
  subloadRequestCount: 'subloadRequestCount',
  cpuAveragePercent: 'cpuAveragePercent',
};

export function evaluate({ measured, limits, cpuThrottle, strict }) {
  const rows = [];

  for (const [key, limit] of Object.entries(limits)) {
    const field = METRIC_OF[key];
    if (field === undefined) continue;
    const value = measured[field];

    // Skip rules that can't be evaluated under current conditions.
    if (key === 'cpuPeakWindowSeconds' && !measured.cpuPeakWindowObserved) {
      rows.push({ key, label: limit.label, status: 'skip',
        note: 'observe >=30s to evaluate the peak window', value, limit });
      continue;
    }
    if (key === 'cpuAveragePercent' && limit.skipWhenThrottled && cpuThrottle > 1) {
      rows.push({ key, label: limit.label, status: 'skip',
        note: 'not gated under CPU throttling', value, limit });
      continue;
    }

    let status = 'pass';
    let note = '';
    if (value > limit.max) {
      // Breach. error-severity breaches fail; warn-severity fail only in strict.
      status = limit.severity === 'error' ? 'fail' : (strict ? 'fail' : 'warn');
    } else if (limit.warnAtFraction && value > limit.max * limit.warnAtFraction) {
      status = 'near';
      note = `>= ${Math.round(limit.warnAtFraction * 100)}% of the hard limit`;
    }
    rows.push({ key, label: limit.label, status, note, value, limit });
  }

  const failed = rows.some((r) => r.status === 'fail');
  return { rows, failed };
}

export function printReport({ rows, measured, cpuThrottle, runs, target }) {
  const sym = {
    pass: `${C.green}PASS${C.reset}`,
    near: `${C.yellow}NEAR${C.reset}`,
    warn: `${C.yellow}WARN${C.reset}`,
    fail: `${C.red}FAIL${C.reset}`,
    skip: `${C.dim}SKIP${C.reset}`,
  };

  console.log('');
  console.log(`${C.bold}Ad Resource Budget${C.reset}  ${C.dim}${target}${C.reset}`);
  console.log(`${C.dim}observed ${measured.observedSeconds.toFixed(1)}s · CPU throttle ${cpuThrottle}x · runs ${runs} · ad frames ${measured.adFrameCount}${measured.loadEventSeen ? '' : ' · NO load event seen (all bytes counted as initial)'}${C.reset}`);
  console.log('');

  const pad = (s, n) => (s + ' '.repeat(Math.max(n, s.length + 1))).slice(0, Math.max(n, s.length + 1));
  console.log(`${C.dim}${pad('  CHECK', 37)}${pad('MEASURED', 14)}${pad('LIMIT', 14)}SOURCE${C.reset}`);
  for (const r of rows) {
    const measuredStr = fmt(r.value, r.limit.unit) + (r.limit.windowSeconds ? `/${r.limit.windowSeconds}s` : '');
    const limitStr = fmt(r.limit.max, r.limit.unit) + (r.limit.windowSeconds ? `/${r.limit.windowSeconds}s` : '');
    const line = `${sym[r.status]} ${pad(r.label, 33)}${pad(measuredStr, 14)}${pad(limitStr, 14)}${C.dim}${r.limit.source}${C.reset}`;
    console.log(line);
    if (r.note) console.log(`     ${C.dim}↳ ${r.note}${C.reset}`);
  }

  if (measured.topRequests && measured.topRequests.length) {
    console.log('');
    console.log(`${C.dim}  heaviest requests:${C.reset}`);
    for (const it of measured.topRequests.slice(0, 5)) {
      const kb = (it.bytes / 1024).toFixed(1);
      const u = it.url.length > 70 ? it.url.slice(0, 67) + '...' : it.url;
      console.log(`   ${C.dim}${pad(kb + ' KB', 10)}${pad(it.phase, 9)}${u}${C.reset}`);
    }
  }

  // Informational only — no gating limit exists for post-interaction cost by
  // design (see cxr/run-budgets.mjs: interacted cells never fail the build).
  if (measured.interacted) {
    console.log('');
    console.log(`${C.dim}  post-interaction (informational, not HAI-gated):${C.reset}`);
    console.log(`   ${C.dim}${pad('transferred', 14)}${fmt(measured.postInteractionTransferredBytes, 'bytes')}${C.reset}`);
    console.log(`   ${C.dim}${pad('requests', 14)}${measured.postInteractionRequestCount}${C.reset}`);
    console.log(`   ${C.dim}${pad('cpu', 14)}${fmt(measured.postInteractionCpuSeconds, 's')}${C.reset}`);
    console.log(`   ${C.dim}${pad('expand', 14)}attempted=${measured.expandAttempted} found=${measured.expandFound}${C.reset}`);
    console.log(`   ${C.dim}${pad('swipe', 14)}attempted=${measured.swipeAttempted} succeeded=${measured.swipeSucceeded}${C.reset}`);
  }
  console.log('');
}
