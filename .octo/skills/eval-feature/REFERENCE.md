# eval-feature — Reference

Detailed material for the eval-feature skill. Read the section you need; SKILL.md holds
the flow.

## Stack detection

Detect from manifest files and use the project's own runner. Common cases:

| Stack | Signals | Test command | Live app (if a check needs it) |
|---|---|---|---|
| Python backend | `pyproject.toml`, `uv.lock` | `uv run pytest <path>` | `uv run uvicorn <app>.main:app --port <port>` |
| React/TS frontend | `package.json`, `vite`/`vitest` | `pnpm test` or `vitest run` | project's dev command (e.g. `vite`) |
| Go | `go.mod`, Makefile | `go test ./...` or `make test` | — |
| Anything else | manifest / CI config | whatever the project already defines | — |

Pick the test layer that fits the feature: a unit/integration test is enough for most
backend logic; UI behavior may need a component test or a headless browser against the
running app.

## Test-plan schema

One YAML file at `.eval-tmp/<feature-slug>.yaml`. This is the whole format — nothing
external needed:

```yaml
feature: <short name>
intent: <one line describing what the feature should do>
checks:
  - id: <stable-id>                 # short kebab-case name
    type: static | behavioral | llm
    description: <what passing this check proves>
    weight: <number, default 1>     # weigh real behavior higher than cosmetics
    # plus type-specific fields, below
```

### `static` — a fact about the code, verified by reading it

No execution. Use for "does this exist / is it wired". Cheapest.

- *Backend example:* "the `POST /presets` route is registered", "a `status` field was
  added to the `Preset` Pydantic model".
- *Frontend example:* "a `PresetsTab` component exists", "the label `Search by
  placement` is present in the search input".
- Fields: just `description` (and optionally a `look_for:` hint listing
  symbols/strings/paths to grep for). Verify with Read/Grep.

### `behavioral` — does it actually work, proven by a throwaway test

This is the important one: it catches "the code looks right but doesn't work."

- *Backend example:* a temp `pytest` test that calls the function or hits the endpoint
  (via the app's test client) and asserts the response/side effect.
- *Frontend example:* a temp `vitest`/component test that renders the component and
  asserts behavior, **or** drive the running app in a headless browser (type into the
  search box, assert the visible rows shrink).
- Fields: `how:` a short description of the action + expected result, so the user knows
  what will be automated. Generate the actual test file in `.eval-tmp/` (or the stack's
  expected test location) and run it with the project's test command; the test's
  pass/fail is the check's result.

### `llm` — a judgment call a simple rule can't express

Show the relevant code to the model with a short rubric and get PASS / FAIL / UNKNOWN.

- *Example:* "the badge text is driven by the record's real status, not hardcoded";
  "the menu opens as a dropdown, not a modal".
- Fields: `files:` which files/components to read, and `rubric:` the paragraph the model
  judges against. `UNKNOWN` → flag for human review, never count it as a pass.

### Choosing a type

- Simple fact about the code → **static**
- "Someone does X and Y happens" → **behavioral**
- Needs a paragraph to explain what "correct" looks like → **llm**

Write **one check per logical requirement** (group related bullets; don't make a check
per word). Give behavior-critical checks a higher `weight` than cosmetic ones.

## Scoring

Per check: **1.0 = pass, 0.5 = partial, 0.0 = fail, null = UNKNOWN/needs-human.**

Overall: **weighted average** over the checks that produced a score. Null-scored checks
are excluded from the average but must be reported.

## Reporting

Give the user:

- **Overall score** (weighted) and a one-line verdict.
- **Per-check results**, with failing checks called out and *why* they failed (paste
  the relevant test output / assertion).
- Anything **skipped or sent to human review** (UNKNOWN, or a check that couldn't run),
  stated plainly — a skipped check is not a passed check.

Classify each failure so the user knows what to do:

- **Genuine gap** — the feature is actually broken/missing. Report it; offer to fix.
- **Bad check** — the feature is fine but the check was wrong. Fix the check, re-run,
  and say you did.
- **Needs human** — genuinely ambiguous; surface it.