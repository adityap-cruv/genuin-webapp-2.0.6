# Jira ticket enforcement via local git hooks, with auto-injection

Ticket references had collapsed in this repo — 0 of the 60 most recent branches and
1 of the last 100 commits on `release/genuin-sdk/2.0.6` carried a `GEN` key, despite
~29% of all-time commits having one. We concluded the convention failed because it
demanded unrewarded manual effort on every commit, not because anyone disagreed with
it, so we made stating a Ticket ID a once-per-branch act that `prepare-commit-msg`
propagates to every commit automatically, rather than a rule that `commit-msg` merely
rejects.

## Considered Options

We chose local hooks over a GitHub Actions required check, knowing the trade-off:
a local hook cannot see a PR title at all, and `--no-verify` bypasses it. We accepted
this because squash-merge (226 of the last 300 commits) makes the commit subject
become the PR title, so enforcing the subject covers the PR by prefill. This is
deterrence, not enforcement. A `pull_request` check remains the only way to make it
unbypassable and is deliberately deferred, along with org-level rulesets.

We also rejected validating Ticket IDs against the Jira REST API. For a hook that
runs on every commit it would put a Jira token on every laptop, break offline
commits, and let a Jira outage stop all work — while still being bypassable. Shape
validation plus an explicit anti-placeholder rule closes the loophole we actually
observed (`GEN-000`, `GEN-0000`) at zero cost.

## Consequences

Two things here will look strange to a future reader:

`scripts/jira-hook/grandfathered.txt` lists every branch that existed at rollout.
91 branches had commits in the 30 days before enforcement and none were compliant;
blocking them all at once was the likeliest way to get this reverted. Branch _age_ is
undetectable here because the base branches are a zoo (`develop`, `qa`, `prod`,
`master`, several `release/*`), so an explicit committed snapshot was the only
deterministic test. The file is expected to be deleted once those branches merge.

The hook enforces git-flow Branch Types on a repo that no longer runs git-flow —
`develop` and `master` have been stale since late 2025 and all work forks from
Release Trains. The type vocabulary was kept as a useful taxonomy; the branching
model it came from was not. Consequently the hooks land on the live Release Trains
(2.0.5 and 2.0.6), not on `develop`, where they would enforce nothing.

## Addendum: commitlint owns validation

Message validation is commitlint's, not ours; the bash hooks keep only what
commitlint cannot see — branch names, and the `release`/`support` branch exemption.
Because `[GEN-10459] feat(cxr): …` is deliberately _not_ valid Conventional Commits,
`commitlint.config.js` overrides `parserPreset.parserOpts.headerPattern` with a
four-group pattern (`ticket`, `type`, `scope`, `subject`). Anyone editing that file
should know the bracket prefix is load-bearing: revert the pattern to the default
and every commit in the repo fails to parse.

We verified that commitlint's `defaultIgnores` already skips merge, `fixup!`/`squash!`
and `Revert "…"` commits, so three of the four exemptions we designed by hand are
inherited rather than implemented. Measured cost is ~140ms per commit, against a
`pre-commit` that already runs lint-staged for seconds.

The rule set is deliberately Moderate — type, scope _case_, and header length, but no
`scope-enum`. A closed scope list would reject the vocabulary actually in use (`cxr`
is not the package name `contextual-reels`) and would need a config PR before anyone
could commit in a new area. Scope remains free text on purpose.

## Addendum: coding agents

Git hooks bind agents for free — Claude Code, Cursor, Codex and Copilot all shell out
to `git commit`, so `commit-msg` fires for them exactly as for a human. What hooks
cannot supply is the Ticket ID itself: it exists only in Jira and in the developer's
head, never in the code. An agent asked to commit without one will invent a
well-formed number rather than stall, and a well-formed invented number defeats shape
validation completely. `AGENTS.md` therefore states the one rule that matters — never
invent a GEN number, stop and ask — and that instruction is load-bearing, not
decorative.

The second agent-specific hazard is recovery behaviour: a blocked commit commonly
prompts a retry with `--no-verify`. That is why `.claude/settings.json` carries a
`PreToolUse` hook denying it outright. The hook binds only Claude Code; for every
other tool the prohibition is advisory, which is an accepted limit rather than an
oversight.

`AGENTS.md` is canonical because each tool reads a different path. The other files
are pointers, so there is exactly one place to edit.

## Addendum: why the enforcement hooks do not source husky's shim

`commit-msg` and `prepare-commit-msg` deliberately do NOT source `.husky/_/husky.sh`,
unlike `pre-commit` and `pre-push`, and `pre-push` runs its branch gate _above_ that
sourcing. This looks inconsistent and will tempt a future reader to "tidy it up".

The shim exits early when `HUSKY=0` is set and it sources `~/.huskyrc`. Either one
silently disables the hook: a security review of this change confirmed that
`HUSKY=0 git commit -m "anything"` skipped traceability entirely, and that
`echo 'exit 0' > ~/.huskyrc` did the same. Enforcement that any environment variable
can switch off is not enforcement. Making these hooks self-contained closes both
vectors for every tool and every human, not just for the agents covered by
`scripts/jira-hook/claude-deny-bypass.js`.

The cost is losing husky's `hook exited with code N` line. Our own messages are more
specific, so this is not a real loss.

Related: `claude-deny-bypass.js` normalises quotes before matching, because the shell
concatenates adjacent quoted fragments — `--no-verif''y` executes as `--no-verify`
while the raw text never contains that substring. That guard remains a speed bump by
construction; regex over unparsed shell text cannot decide what the shell will do,
and the file says so.

## Addendum: accepted limits

An adversarial review of this change produced four gaps we are accepting rather than
closing, so nobody has to rediscover them.

**Renaming a branch is not always cheap, though the hooks call it free.** With ~28
worktrees sharing one `.git`, `git branch -m` fails outright when the branch is
checked out elsewhere, and renaming an already-pushed branch orphans the remote and
can strand its PR. The hooks now point at the README instead of promising "nothing is
lost".

**The grandfathered list is a name-based opt-out.** `grep -Fxq` matches a branch
_name_, not its identity, so a new branch created with one of the 757 listed names
inherits the exemption, and a deleted-then-recreated branch does too. `post-checkout`
now says so out loud whenever a grandfathered name is checked out, which removes the
silence but not the loophole. Trunk names (`main`, `master`, `develop`, `prod`, `qa`)
were pulled out of the list and given their own rule so that committing straight to a
trunk warns rather than passing unremarked.

**The snapshot is taken once and will be slightly stale at merge time.** Branches
created between the snapshot and the merge are not in it and will be blocked.
Re-run `scripts/jira-hook/snapshot-branches.sh` immediately before merging, or absorb
a few days of support questions.

**Local hooks remain advisory by construction.** `git push --no-verify`, a git alias, a
script written and then executed, or simply deleting `.husky/` all defeat this, and
one non-compliant push lands permanently with nothing to notice it. The `pull_request`
check remains the only structural answer and is still deferred. These hooks make the
right thing the default; they are not a guarantee, and should not be described as one.

## Addendum: relationship to the branching & versioning plan

A separate design (the branching & versioning plan, `binary-nibbling-kite.md` in the
maintainer's Claude plans folder) replaces the current release-branch sprawl with a real
Trunk (`develop`), a production branch (`master`) and long-lived Version Lines
(`stable/<package>/<version>`). The two efforts were reconciled on 2026-09-21. What each
one changed in the other:

**This change bends to the plan:**

- `stable/*` is an Exempt Branch Type. Without it, the plan's Phase 3 — pushing the new
  stable branches — would have been rejected by `pre-push`.
- `backport/*` and `backport-<n>-to-*` are exempt from the ticket-in-branch rule. The
  plan uses `npx backport` (sorenlouv/backport) and korthout/backport-action. Their
  commits are cherry-picks that already carry the source commit's `[GEN-n]`. The CLI
  defaults to `noVerify: true` and works in its own clone under `~/.backport/`, so our
  hooks never run inside it. The exemption matters when someone checks out one of these
  branches in their own worktree to fix it up.
- The glossary's "Release Train" is gone. It described today's sprawl as if it were the
  model; the plan's Trunk and Version Line describe where the repo is going.

**The plan bends to this change:**

- Its branch grammar `feature/<slug>` becomes `feature/GEN-<n>/<slug>`, likewise for
  `bugfix/` and `hotfix/`. Its hand-reimplemented-backport recipe used `bugfix/<slug>`,
  which these hooks block.
- Its PR template's Backport section is appended to `.github/pull_request_template.md`
  from this change, not substituted for it.
- The `Backport-of: #<n>` trailer the plan relies on was checked against this commitlint
  config and passes untouched.

**A correction this change took from the plan:** earlier text here called a required
`pull_request` check "the only unbypassable version". The org is on GitHub Free, where
private repositories get no branch protection and no rulesets, so a check can run but
cannot be _required_. That guarantee exists only after the GitHub Team upgrade, which the
plan already makes a prerequisite of its cutover. Until then, `{GP} --no-verify` lands
unchallenged no matter what CI does.

## Addendum: the PR-title claim was half wrong

The Considered Options section says squash-merge carries the ticket into the PR title "by prefill".
That holds for **single-commit** PRs only. Verified 2026-09-21:

- The repo's `squash_merge_commit_title` is `COMMIT_OR_PR_TITLE`. A single-commit PR squash-merges with
  the commit's own subject, which the hooks have already stamped with `[GEN-n]`, so that case is fine.
- A **multi-commit** PR squash-merges with the PR title, and GitHub's default title for it is derived
  from the branch name, with hyphens turned into spaces. History shows the shape:
  `Bugfix/new cxr compatible (#615)`, `Feature/demo changes 2.0.6 (#580)`. From
  `feature/GEN-10459/cxr-c8` that default becomes `Feature/GEN 10459/cxr c8`, so the Jira key is
  destroyed and the subject is not a Conventional Commit.
- `squash_merge_commit_message` is `COMMIT_MESSAGES`, so nothing in a PR _body_ reaches git either.

Local hooks cannot see or fix a PR title. The fixes live outside this change: set
`squash_merge_commit_title` to `PR_TITLE` so there is one rule, and add a PR-title check (decision D3
in the branching plan). Until then, `AGENTS.md` and the README tell authors to write the title
themselves.
