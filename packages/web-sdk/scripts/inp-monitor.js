// Script to monitor INP (Interaction to Next Paint) in real-time on a webpage.
(function () {
  'use strict'

  // ── Thresholds ─────────────────────────────────────────────────────────────
  const GOOD_MS = 200
  const NI_MS = 500

  // ── State ──────────────────────────────────────────────────────────────────
  let worstINP = 0
  let totalCount = 0
  const entries = []
  const seen = new Map()

  // ── Panel HTML ─────────────────────────────────────────────────────────────
  const panel = document.createElement('div')
  panel.id = '__inp_monitor'
  panel.innerHTML = `
    <div id="__inp_header">
      <span id="__inp_title">INP Monitor</span>
      <div style="display:flex;gap:6px;align-items:center;">
        <button id="__inp_clear">Clear</button>
        <button id="__inp_toggle">−</button>
      </div>
    </div>
    <div id="__inp_body">
      <div id="__inp_summary">
        <div class="__inp_card">
          <div class="__inp_card_label">Worst INP</div>
          <div class="__inp_card_value" id="__inp_worst">—</div>
        </div>
        <div class="__inp_card">
          <div class="__inp_card_label">Rating</div>
          <div class="__inp_card_value" id="__inp_rating">—</div>
        </div>
        <div class="__inp_card">
          <div class="__inp_card_label">Interactions</div>
          <div class="__inp_card_value" id="__inp_count">0</div>
        </div>
      </div>
      <div id="__inp_log_wrap">
        <div id="__inp_log_header">
          <span>event</span>
          <span>dur</span>
          <span>delay</span>
          <span>proc</span>
          <span>pres</span>
          <span>element</span>
        </div>
        <div id="__inp_log"></div>
      </div>
      <div id="__inp_footer">Waiting for interactions…</div>
    </div>
  `

  // ── Styles ─────────────────────────────────────────────────────────────────
  const style = document.createElement('style')
  style.textContent = `
    #__inp_monitor {
      position: fixed;
      bottom: 16px;
      right: 16px;
      width: 520px;
      max-width: calc(100vw - 32px);
      background: #1a1a1a;
      color: #e8e8e8;
      font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
      font-size: 12px;
      border-radius: 10px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.5);
      z-index: 2147483647;
      overflow: hidden;
      border: 1px solid #333;
    }
    #__inp_header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: #111;
      border-bottom: 1px solid #2e2e2e;
      cursor: move;
      user-select: none;
    }
    #__inp_title {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #888;
    }
    #__inp_header button {
      background: #2a2a2a;
      color: #aaa;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 11px;
      cursor: pointer;
      font-family: inherit;
    }
    #__inp_header button:hover { background: #333; color: #fff; }
    #__inp_body { padding: 10px 12px 8px; }
    #__inp_summary {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      margin-bottom: 10px;
    }
    .__inp_card {
      background: #111;
      border: 1px solid #2e2e2e;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .__inp_card_label {
      font-size: 10px;
      color: #555;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 4px;
    }
    .__inp_card_value {
      font-size: 18px;
      font-weight: 600;
      color: #e8e8e8;
    }
    #__inp_log_wrap {
      border: 1px solid #2a2a2a;
      border-radius: 6px;
      overflow: hidden;
    }
    #__inp_log_header {
      display: grid;
      grid-template-columns: 72px 52px 52px 52px 52px 1fr;
      padding: 5px 8px;
      background: #111;
      color: #555;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #2a2a2a;
    }
    #__inp_log {
      max-height: 180px;
      overflow-y: auto;
    }
    .__inp_row {
      display: grid;
      grid-template-columns: 72px 52px 52px 52px 52px 1fr;
      padding: 5px 8px;
      border-bottom: 1px solid #1e1e1e;
      align-items: center;
      transition: background 0.1s;
    }
    .__inp_row:last-child { border-bottom: none; }
    .__inp_row:hover { background: #222; }
    .__inp_row.good  { border-left: 3px solid #22c55e; }
    .__inp_row.ni    { border-left: 3px solid #f59e0b; }
    .__inp_row.poor  { border-left: 3px solid #ef4444; }
    .__inp_badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      padding: 1px 5px;
      border-radius: 3px;
    }
    .__inp_badge.good { background: #14532d; color: #22c55e; }
    .__inp_badge.ni   { background: #451a03; color: #f59e0b; }
    .__inp_badge.poor { background: #450a0a; color: #ef4444; }
    .__inp_dur { font-weight: 600; }
    .__inp_dur.good { color: #22c55e; }
    .__inp_dur.ni   { color: #f59e0b; }
    .__inp_dur.poor { color: #ef4444; }
    .__inp_muted { color: #555; }
    .__inp_el {
      color: #7dd3fc;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #__inp_footer {
      margin-top: 8px;
      font-size: 10px;
      color: #444;
      text-align: center;
    }
    #__inp_monitor.collapsed #__inp_body { display: none; }
  `

  document.head.appendChild(style)
  document.body.appendChild(panel)

  // ── Drag ───────────────────────────────────────────────────────────────────
  const header = panel.querySelector('#__inp_header')
  let dragging = false,
    ox = 0,
    oy = 0
  header.addEventListener('mousedown', (e) => {
    dragging = true
    ox = e.clientX - panel.getBoundingClientRect().left
    oy = e.clientY - panel.getBoundingClientRect().top
  })
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return
    panel.style.left = e.clientX - ox + 'px'
    panel.style.top = e.clientY - oy + 'px'
    panel.style.right = 'auto'
    panel.style.bottom = 'auto'
  })
  document.addEventListener('mouseup', () => {
    dragging = false
  })

  // ── Toggle collapse ────────────────────────────────────────────────────────
  const toggleBtn = panel.querySelector('#__inp_toggle')
  toggleBtn.addEventListener('click', () => {
    const collapsed = panel.classList.toggle('collapsed')
    toggleBtn.textContent = collapsed ? '+' : '−'
  })

  // ── Clear ──────────────────────────────────────────────────────────────────
  panel.querySelector('#__inp_clear').addEventListener('click', () => {
    entries.length = 0
    seen.clear()
    worstINP = 0
    totalCount = 0
    panel.querySelector('#__inp_worst').textContent = '—'
    panel.querySelector('#__inp_worst').style.color = '#e8e8e8'
    panel.querySelector('#__inp_rating').textContent = '—'
    panel.querySelector('#__inp_rating').style.color = '#e8e8e8'
    panel.querySelector('#__inp_count').textContent = '0'
    panel.querySelector('#__inp_log').innerHTML = ''
    panel.querySelector('#__inp_footer').textContent =
      'Waiting for interactions…'
  })

  // ── Helpers ────────────────────────────────────────────────────────────────
  function rating(ms) {
    return ms <= GOOD_MS ? 'good' : ms <= NI_MS ? 'ni' : 'poor'
  }
  function ratingLabel(r) {
    return r === 'good' ? 'GOOD' : r === 'ni' ? 'NI' : 'POOR'
  }
  function ratingColor(r) {
    return r === 'good' ? '#22c55e' : r === 'ni' ? '#f59e0b' : '#ef4444'
  }

  // ── PerformanceObserver ────────────────────────────────────────────────────
  if (
    typeof PerformanceObserver === 'undefined' ||
    !PerformanceObserver.supportedEntryTypes?.includes('event')
  ) {
    panel.querySelector('#__inp_footer').textContent =
      'Event Timing API not supported in this browser'
    return
  }

  new PerformanceObserver((list) => {
    for (const raw of list.getEntries()) {
      const e = raw
      const id = e.interactionId
      if (!id) continue 
      const duration = Math.round(e.duration)
      const existing = seen.get(id)
      if (!existing || duration > existing) {
        seen.set(id, duration)
      } else {
        continue
      }
      const el = e.target ?? null
      const tag = el?.tagName?.toLowerCase() ?? '?'
      const elId = el?.id ? '#' + el.id : ''
      const cls =
        typeof el?.className === 'string' && el.className.trim()
          ? '.' + el.className.trim().split(/\s+/).join('.')
          : ''
      const target = elId || tag + cls

      const inputDelay = Math.max(
        0,
        Math.round(e.processingStart - e.startTime),
      )
      const processingTime = Math.max(
        0,
        Math.round(e.processingEnd - e.processingStart),
      )
      const presentationDelay = Math.max(
        0,
        Math.round(duration - inputDelay - processingTime),
      )

      const entry = {
        name: e.name,
        duration,
        inputDelay,
        processingTime,
        presentationDelay,
        target,
      }
      entries.push(entry)
      totalCount++

      if (duration > worstINP) worstINP = duration

      const r = rating(worstINP)

      // Update summary cards
      panel.querySelector('#__inp_worst').textContent = worstINP + 'ms'
      panel.querySelector('#__inp_worst').style.color = ratingColor(r)
      panel.querySelector('#__inp_rating').textContent = ratingLabel(r)
      panel.querySelector('#__inp_rating').style.color = ratingColor(r)
      panel.querySelector('#__inp_count').textContent = totalCount

      // Add log row
      const entryR = rating(duration)
      const row = document.createElement('div')
      row.className = '__inp_row ' + entryR
      row.innerHTML = `
        <span><span class="__inp_badge ${entryR}">${e.name.replace('pointer', 'ptr').replace('down', '↓').replace('up', '↑')}</span></span>
        <span class="__inp_dur ${entryR}">${duration}ms</span>
        <span class="__inp_muted">${inputDelay}ms</span>
        <span class="__inp_muted">${processingTime}ms</span>
        <span class="__inp_muted">${presentationDelay}ms</span>
        <span class="__inp_el" title="${target}">${target || '—'}</span>
      `
      const log = panel.querySelector('#__inp_log')
      log.appendChild(row)
log.scrollTop = log.scrollHeight 

      panel.querySelector('#__inp_footer').textContent =
        `Last: ${e.name} on ${target || '?'} — ${duration}ms`
    }
  }).observe({ type: 'event', buffered: true, durationThreshold: 16 })

  console.log('[INP Monitor] Running — interact with the page to see readings.')
})()
