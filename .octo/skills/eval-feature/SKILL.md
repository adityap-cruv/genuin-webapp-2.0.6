---
name: eval-feature
description: >
  Test a feature the agent just implemented by turning its acceptance criteria into
  automated checks (static, behavioral, LLM-judged), running them, and reporting a
  weighted score. Stack-agnostic (backend or frontend); creates all test artifacts in a
  temp dir and deletes them afterward. Use when the user asks to "test this feature",
  "eval what you built", "run an eval on this", "verify this scenario works", or "check
  the feature you implemented". ALSO REQUIRED before publishing: whenever the user says
  "publish", "create a PR", "open a PR", "raise a PR", or the agent itself is about to
  create a pull request for feature work, run this skill FIRST and only create the PR
  after the eval passes (or the user explicitly accepts the failures).
---

# eval-feature

Test something the agent just built against what it was *supposed* to do, and leave the
repo exactly as clean as you found it. This skill is **self-contained** — it assumes no
eval framework exists in the repo. You create what you need, run it, and delete it.

Core loop: **pin down criteria → write a test-plan YAML → get user approval → run the
checks → report a score → delete everything you created.**

**Pre-PR gate:** this skill is a mandatory prerequisite to publishing. Before creating a
pull request — whether the user asked for one or the agent decided to open one — run this
eval on the feature being shipped. Only proceed to the PR after the eval passes, or after
the user explicitly accepts the reported failures.

Details (YAML schema, check types, stack detection, scoring): see [REFERENCE.md](REFERENCE.md).

## Step 1 — Pin down what to test

Gather the feature's **intent** and **acceptance criteria** from the conversation,
ticket, or user's request. You need concrete, checkable statements ("the endpoint
returns 201 with the created id", "typing in the search box filters the list").

If the criteria are vague or you'd be inventing them, **stop and ask the user**. Do not
make up a spec.

## Step 2 — Detect the stack

Look at the code that changed. Identify the language/framework from manifest files and
use the **project's own** test runner — don't hardcode. Pick the test layer that fits:
unit/integration for most backend logic; component test or headless browser for UI
behavior. See [REFERENCE.md § Stack detection](REFERENCE.md#stack-detection).

## Step 3 — Write a test-plan YAML

Write **one** YAML file at `.eval-tmp/<feature-slug>.yaml` describing the feature and
its checks. Each check is one of three types:

- **`static`** — a fact about the code, verified by reading it (Read/Grep). Cheapest.
- **`behavioral`** — proves it actually works: a throwaway test you write and run. The
  important one — catches "looks right but doesn't work."
- **`llm`** — a judgment call a simple rule can't express, judged against a rubric →
  PASS / FAIL / UNKNOWN.

One check per logical requirement; weight behavior-critical checks higher than cosmetic
ones. Full schema, type-specific fields, and examples:
[REFERENCE.md § Test-plan schema](REFERENCE.md#test-plan-schema).

## Step 4 — Ask the user to verify the YAML (required gate)

Show the test plan and ask the user to confirm or adjust it **before running anything**.
Apply their edits. Do not proceed until they approve — the checks decide the verdict, so
the user must agree they're the right checks.

## Step 5 — Run the checks (only after approval)

- **static:** confirm each fact with Read/Grep.
- **behavioral:** generate throwaway test file(s) under `.eval-tmp/` (or where the
  runner expects them) and run the project's test command. Boot a dev server / headless
  browser only if a check needs the live app; stop it in cleanup.
- **llm:** read the listed files, judge against the rubric.

Score each check **1.0 / 0.5 / 0.0 / null (UNKNOWN)** and compute a weighted average
over scored checks. Details: [REFERENCE.md § Scoring](REFERENCE.md#scoring).

## Step 6 — Report

Give the user the **overall weighted score** with a one-line verdict, **per-check
results** (paste failing output), and anything **skipped or sent to human review** —
a skipped check is not a passed check. Classify each failure as **genuine gap**
(feature broken — offer to fix), **bad check** (fix the check, re-run, say so), or
**needs human**. See [REFERENCE.md § Reporting](REFERENCE.md#Reporting).

## Step 7 — Clean up (mandatory)

Delete **everything you created for testing** — `.eval-tmp/`, the YAML, throwaway
tests, temp scripts — and stop any server/browser you started. Verify the working tree
is clean of test artifacts.

**Never modify or delete the feature's source code.** If a test would need hooks (like
`data-testid`) that don't exist, don't add them — use other selectors and note the
limitation in the report.

## Safety rule

A buggy check gives a wrong verdict — worse than no check, because the score gets
trusted. Before relying on a non-trivial behavioral test, sanity-check that it would
actually **fail** if the feature were broken.