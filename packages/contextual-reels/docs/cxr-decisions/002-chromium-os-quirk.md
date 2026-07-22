# ADR 002 — Preserve `chromium` os_type for Linux/ChromeOS Chrome

**Status**: Preserved (intentional)

## Context

The device-detection module (`src/platform/device.ts`, ported from the original CXR
code) identifies the operating system as `'chromium'` when the user-agent string contains `'CrOS'` or when
the browser is Chrome on Linux. This is evaluated **before** the `'android'` and
`'linux'` checks, so Chrome on Linux and ChromeOS both receive `os_type: 'chromium'`
rather than `'linux'` or `'chromeos'`.

This is technically incorrect UA taxonomy — `chromium` is a browser, not an OS — but
the string has been emitted to the analytics pipeline since the widget's initial
deployment. Ad-team dashboards and downstream data models filter on this exact value.

## Decision

Preserve the `'chromium'` branch verbatim in `src/platform/device.ts` (`resolveOsType`).
The function
signature, evaluation order, and returned string must not change. A JSDoc comment in the
source file links to this ADR so future contributors do not "fix" it by accident.

## Consequences

- Analytics dashboards continue to receive `os_type: 'chromium'` for Linux Chrome and
  ChromeOS Chrome users — no backfill needed.
- Slight taxonomic inconsistency for new engineers reading the device-detect code;
  mitigated by the in-source comment and this ADR.
- If the analytics schema is ever migrated (separate workstream), the fix is: move
  `'chromium'` after `'android'` and `'linux'` in the evaluation chain and remap
  historical data.
