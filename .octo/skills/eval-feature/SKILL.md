---
name: eval-feature
description: >
  Test a feature or scenario the agent just implemented, by turning its acceptance
  criteria into automated checks, running them, and reporting a score. Works for any
  stack (backend or frontend). The flow is: write a test-plan YAML → ask the user to
  verify it → run the checks → delete every test file created. Invoke whenever the user
  asks to "test this feature", "eval what you built", "run an eval on this", "verify
  this scenario works", or "check the feature you implemented". NOT tied to PRs — use it
  any time testing of an implemented feature is requested.
---

# eval-feature

Test something the agent just built against what it was *supposed* to do, automatically,
and leave the repo exactly as clean as you found it. This skill is **self-contained** —
it assumes there is **no** eval framework, YAML, or grader code in the repo. You create
what you need, run it, and delete it.

Core loop: **figure out what to test → write a test-plan YAML → get the user to approve
it → run the checks → report a score → delete everything you created for testing.**

---

## Step 1 — Pin down what to test

Gather the feature's **intent** and its **acceptance criteria** from the conversation,
the task/ticket, or the user's request. You need concrete, checkable statements ("the
endpoint returns 201 with the created id", "typing in the search box filters the list",
"the badge reflects the record's real status").

If the criteria are vague or you're inventing them, **stop and ask the user** for the
acceptance criteria before continuing. Do not make up a spec.

---

## Step 2 — Detect the stack

Look at the code that was actually changed and identify the language/framework and how
tests run there. Detect from manifest files and use the **project's own** runner — don't
hardcode. Common cases:

- **Python backend** (`pyproject.toml` / `uv`): run tests with `uv run pytest <path>`.
  Start a service if a check needs it live, e.g. `uv run uvicorn <app>.main:app --port <port>`.
- **React/TS frontend** (`package.json`, `vite`/`vitest`): run tests with `pnpm test`
  or `vitest run`; start the dev server with the project's dev command (e.g. `vite`) if
  a check needs the live app.
- **Go** (`go.mod` + Makefile): `go test ./...` or `make test`.
- **Anything else**: read the manifest/CI config and use whatever test command the
  project already defines.

Pick the test layer that fits the feature: a unit/integration test is enough for most
backend logic; UI behavior may need a component test or a headless browser against the
running app.

---

## Step 3 — Write a test-plan YAML

Write **one** YAML file describing the feature and the checks, into a dedicated temp dir
so it's trivial to delete later:

```
.eval-tmp/<feature-slug>.yaml
```

### Schema (this is the whole format — nothing external needed)

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

### The three check types

**`static` — a fact about the code, verified by reading it** (no execution). Use for
"does this exist / is it wired". Cheapest.
- *Backend example:* "the `POST /presets` route is registered", "a `status` field was
  added to the `Preset` Pydantic model".
- *Frontend example:* "a `PresetsTab` component exists", "the label `Search by
  placement` is present in the search input".
- Fields: just `description` (and optionally a `look_for:` hint listing
  symbols/strings/paths to grep for). You verify these with Read/Grep.

**`behavioral` — does it actually work, proven by a throwaway test you write and run.**
This is the important one: it catches "the code looks right but doesn't work."
- *Backend example:* a temp `pytest` test that calls the function or hits the endpoint
  (via the app's test client) and asserts the response/side effect.
- *Frontend example:* a temp `vitest`/component test that renders the component and
  asserts behavior, **or** drive the running app in a headless browser (type into the
  search box, assert the visible rows shrink).
- Fields: `how:` a short description of the action + expected result, so the user knows
  what you'll automate. You then generate the actual test file in `.eval-tmp/` (or the
  stack's expected test location) and run it with the project's test command; the test's
  pass/fail is the check's result.

**`llm` — a judgment call a simple rule can't express.** Show the relevant code to the
model with a short rubric and get `PASS` / `FAIL` / `UNKNOWN`.
- *Example:* "the badge text is driven by the record's real status, not hardcoded";
  "the menu opens as a dropdown, not a modal".
- Fields: `files:` which files/components to read, and `rubric:` the paragraph the model
  judges against. `UNKNOWN` → flag for human review, never count it as a pass.

### How to choose a type

- Simple fact about the code → **static**
- "Someone does X and Y happens" → **behavioral**
- Needs a paragraph to explain what 'correct' looks like → **llm**

Write **one check per logical requirement** (group related bullets; don't make a check
per word). Give behavior-critical checks a higher `weight` than cosmetic ones.

---

## Step 4 — Ask the user to verify the YAML (required gate)

Show the generated test plan to the user and ask them to confirm or adjust it **before
running anything**. Apply their edits. Do not proceed to Step 5 until they approve. This
gate matters because the checks decide the verdict — the user should agree they're the
right checks.

---

## Step 5 — Run the checks (only after approval)

- **static:** use Read/Grep to confirm each fact. Pass if the fact holds.
- **behavioral:** generate the throwaway test file(s) under `.eval-tmp/` (or the
  location the test runner expects), then run the project's test command. Boot the dev
  server / headless browser only if a check needs the live app, and remember to stop it
  in cleanup. The test result is the check result.
- **llm:** read the listed files and judge against the rubric → PASS / FAIL / UNKNOWN.

Score each check: **1.0 = pass, 0.5 = partial, 0.0 = fail, null = UNKNOWN/needs-human.**
Compute a **weighted average** over the checks that produced a score.

---

## Step 6 — Report

Give the user:

- **Overall score** (weighted) and a one-line verdict.
- **Per-check results**, with failing checks called out and *why* they failed (paste the
  relevant test output / assertion).
- Anything **skipped or sent to human review** (e.g. UNKNOWN, or a check you couldn't
  run), stated plainly — a skipped check is not a passed check.

For each failure, classify it so the user knows what to do:
- **Genuine gap** — the feature is actually broken/missing. Report it; offer to fix.
- **Bad check** — the feature is fine but the check was wrong. Fix the check, re-run,
  and say you did.
- **Needs human** — genuinely ambiguous; surface it.

---

## Step 7 — Clean up (mandatory)

Delete **every file and directory you created for testing** — the `.eval-tmp/` dir, the
YAML, all throwaway test files, any temp scripts — and stop any dev server or browser the
skill started. Verify nothing test-related remains (e.g. check the working tree).

**Never modify or delete the feature's source code.** If a behavioral test would have
needed test hooks (like `data-testid`) that don't exist, do **not** edit source to add
them — fall back to other selectors/assertions and note the limitation in the report.

End state: the repo is identical to before the eval, except the feature code the agent
already wrote.

---

## Safety rule

A check is test code, and a buggy check gives a wrong verdict — it can pass broken work
or fail working code — which is worse than no check, because the score gets trusted.
Before relying on a non-trivial behavioral test, sanity-check that it would actually
**fail** if the feature were broken (e.g. confirm the assertion is really exercising the
behavior, not trivially true).