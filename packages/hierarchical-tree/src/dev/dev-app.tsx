import { ThemeProvider, type ThemeName } from '@genuin/ui/theme-provider';
import * as React from 'react';

import { PageRenderer } from '../page-renderer';
import type { ResolveSlotProps } from '../types';
import { validatePage, type ValidationError } from '../validate-rules';

import { devSlotRenderers } from './dev-slot-renderers';
import { DEFAULT_FIXTURE_NAME, FIXTURES } from './fixtures/fixtures';

/** Default theme for the dev shell — the neutral Genuin palette. */
const DEFAULT_THEME_NAME: ThemeName = 'genuin';

/**
 * Shape of the CDN loader's global API surface (see
 * `packages/web-sdk/src/loader.js`). The bundle queues `init` calls until
 * the lazy-loaded SDK chunk resolves, so calling it pre-load is safe.
 * Calling with no config triggers the SDK's DOM-scan path: it hydrates any
 * `<div id="gen-sdk-*">` whose `data-style-id` / `data-placement-id` /
 * `data-api-key` attributes are populated.
 */
declare global {
  interface Window {
    genuin?: {
      init: (config?: Record<string, unknown>) => Promise<unknown>;
      isLoaded?: () => boolean;
    };
  }
}

/**
 * Reads the `?fixture=<name>` query string. Falls back to the default
 * fixture name when no parameter is present.
 */
function readFixtureName(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_FIXTURE_NAME;
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('fixture') ?? DEFAULT_FIXTURE_NAME;
}

/**
 * Reads the `?theme=<name>` query string. Falls back to the neutral
 * Genuin palette. Any non-empty slug is passed through verbatim so a
 * publisher palette added via the `hierarchical-theme` skill becomes
 * previewable without editing this file.
 */
function readThemeName(): ThemeName {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_NAME;
  }
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('theme');
  return raw && raw.length > 0 ? raw : DEFAULT_THEME_NAME;
}

/** Inline-styled diagnostic panel used by the dev shell. */
function DiagnosticPanel({
  issues,
  tone,
  testId,
  heading,
}: {
  issues: ValidationError[];
  tone: 'error' | 'warning';
  testId: string;
  heading: string;
}) {
  // Warnings are non-blocking and may not need attention every refresh —
  // let the operator dismiss the panel locally so it doesn't permanently
  // obscure the top of the page during visual QA. Errors are dismissable
  // too; the validator output is still visible in the terminal.
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;
  const background = tone === 'error' ? '#b91c1c' : '#b45309';
  return (
    <div
      data-testid={testId}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '12px 40px 12px 16px',
        background,
        color: '#ffffff',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: 12,
        lineHeight: 1.4,
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      }}
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        data-testid={`${testId}-dismiss`}
        aria-label="Dismiss"
        style={{
          position: 'absolute',
          top: 6,
          right: 8,
          width: 24,
          height: 24,
          padding: 0,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: 4,
          color: '#ffffff',
          cursor: 'pointer',
          fontSize: 14,
          lineHeight: '20px',
          fontFamily: 'inherit',
        }}>
        ×
      </button>
      <strong style={{ display: 'block', marginBottom: 6 }}>{heading}</strong>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {issues.map((issue, idx) => (
          <li key={`${issue.code}-${issue.path}-${idx}`} style={{ marginBottom: 2 }}>
            {issue.code}: {issue.message} ({issue.path || '<root>'})
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Dev shell for QA-ing emitted `Page` artifacts. Reads the fixture
 * name and theme slug from the URL (`?fixture=<name>&theme=<slug>`),
 * wraps the matching fixture in the chosen `<ThemeProvider>`, and
 * hands it to `<PageRenderer>`. Defaults to the neutral Genuin palette
 * when no `?theme=` is supplied.
 *
 * The fixture-not-found branch renders a small diagnostic block so
 * the agent can see at a glance what fixtures are registered.
 *
 * The validator runs against every loaded fixture and surfaces rule
 * violations as a fixed-position panel above the rendered page so
 * authoring agents see the same diagnostic the CLI emits.
 *
 * A small status footer in the bottom-right corner reports the active
 * `fixture` and `theme` slugs to make previews unambiguous.
 */
export function DevApp() {
  const fixtureName = readFixtureName();
  const themeName = readThemeName();
  const fixture = FIXTURES[fixtureName];

  // After the tree mounts, ask the CDN-loaded SDK to hydrate any
  // `<div id="gen-sdk-*">` cells the video slot renderer just placed
  // in the DOM. `window.genuin.init()` is the public CDN entrypoint
  // (see `packages/web-sdk/src/loader.js`); calling it with no config
  // triggers the SDK's DOM-scan path which reads per-cell
  // `data-api-key` / `data-style-id` / `data-placement-id` attributes
  // and runs one embed per cell.
  //
  // Effect runs once per fixture swap so a navigation that swaps in a
  // new set of video slots re-triggers hydration. The CDN loader is
  // idempotent — internal flags guard against repeat module loads.
  /**
   * `<PageRenderer>` swaps the rendered tree atomically when the viewport
   * crosses a breakpoint — the previous subtree (including any `<div id="gen-sdk-*">`
   * the SDK was attached to) unmounts; a fresh subtree with new DOM nodes
   * mounts in its place. The SDK doesn't observe these mutations on its
   * own, so we observe the page root with a `MutationObserver` and re-fire
   * `window.genuin.init()` whenever a new `gen-sdk-*` element appears.
   */
  const pageRootRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!fixture) return;
    const sdk = window.genuin;
    if (!sdk) {
      // Loader script failed to download — surface in the console so a
      // network error doesn't look like silent SDK breakage.
       
      console.warn(
        '[hierarchical-tree dev shell] window.genuin not present — CDN loader did not load',
      );
      return;
    }

    const tryInit = () => {
      sdk.init().catch((err: unknown) => {
        // Dev-only diagnostic — never silently swallow.
         
        console.error('[hierarchical-tree dev shell] window.genuin.init failed', err);
      });
    };

    // Initial mount.
    tryInit();

    const root = pageRootRef.current;
    if (!root) return;

    let pending = 0;
    const observer = new MutationObserver(mutations => {
      const sawNewSdkTarget = mutations.some(m =>
        Array.from(m.addedNodes).some(n => {
          if (!(n instanceof HTMLElement)) return false;
          if (n.id?.startsWith('gen-sdk-')) return true;
          return n.querySelector?.('[id^="gen-sdk-"]') !== null;
        }),
      );
      if (!sawNewSdkTarget) return;
      // Debounce — the walker swaps the whole subtree at once; coalesce
      // mutations into a single init() call per tick.
      window.cancelAnimationFrame(pending);
      pending = window.requestAnimationFrame(tryInit);
    });
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(pending);
    };
  }, [fixtureName, fixture]);

  if (!fixture) {
    const available = Object.keys(FIXTURES).join(', ') || '(none registered)';
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h1>Unknown fixture: {fixtureName}</h1>
        <p>
          Available fixtures: <code>{available}</code>
        </p>
        <p>
          Add new fixtures under <code>src/dev/fixtures/</code> and register them in{' '}
          <code>fixtures.ts</code>.
        </p>
      </div>
    );
  }

  const resolveSlotProps: ResolveSlotProps = slot => fixture.slotData[slot.name] ?? {};
  const validation = validatePage(fixture.page);

  return (
    <ThemeProvider theme={themeName}>
      {validation.errors.length > 0 ? (
        <DiagnosticPanel
          issues={validation.errors}
          tone="error"
          testId="hierarchical-validation-errors"
          heading={`Validation errors (${validation.errors.length})`}
        />
      ) : validation.warnings.length > 0 ? (
        <DiagnosticPanel
          issues={validation.warnings}
          tone="warning"
          testId="hierarchical-validation-warnings"
          heading={`Validation warnings (${validation.warnings.length})`}
        />
      ) : null}
      <div ref={pageRootRef}>
        <PageRenderer
          page={fixture.page}
          resolveSlotProps={resolveSlotProps}
          slotRenderers={devSlotRenderers}
        />
      </div>
      <div
        data-testid="hierarchical-dev-status"
        style={{
          position: 'fixed',
          right: 8,
          bottom: 8,
          zIndex: 9998,
          padding: '4px 8px',
          background: 'rgba(0,0,0,0.6)',
          color: '#ffffff',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: 11,
          lineHeight: 1.2,
          borderRadius: 4,
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      >
        fixture: {fixtureName} · theme: {themeName}
      </div>
    </ThemeProvider>
  );
}
