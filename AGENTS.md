# Agent instructions

Canonical instructions for every coding agent working in this repository —
Claude Code, Codex, Cursor, Copilot, Gemini, Octo. Tool-specific files point here.

For how code should be written, read [`.claude/CLAUDE.md`](.claude/CLAUDE.md).
This file covers the rules an agent is most likely to get wrong.

## Commits & branches

Every change is traceable to a Jira ticket in the `GEN` project. Git hooks enforce
this; you will be blocked, not warned, if you get it wrong.

**Branch names** — `<type>/GEN-<ticket>/<slug>`

```
feature/GEN-10459/cxr-c8-ad-group-id
bugfix/GEN-10461/webp-fallback
```

Types: `feature` `bugfix` `hotfix` `chore` `docs`. (`release`, `support`, `stable` and `backport` branches are exempt: the first three are version-named, and backport branches carry the original commit's ticket.) `feat`, `fix`, `cxr` and `security` are **not**
valid branch types — use the full names.

**Commit messages** — `[GEN-<n>] <type>(<scope>): <subject>`

```
[GEN-10459] feat(cxr): lower unmuted-autoplay volume 10% to 1%
```

### Rules you must follow

1. **Never invent a `GEN` number.** The ticket exists only in Jira and in the
   developer's head — it is not in this codebase and you cannot infer it. A made-up
   number passes validation and silently corrupts traceability, which is worse than
   failing. If you need a ticket and do not have one, **stop and ask.**

2. **Never route around a blocked commit or push.** That means no `--no-verify`, no
   `-n`, no `SKIP_*` variable (the one exception, `SKIP_CXR_CHECKS=1`, skips only the
   Contextual Reels test suite — use it only when the user asks), no `HUSKY=0`, no `husky_skip_init`, no editing
   `core.hooksPath`, and no deleting or rewriting files in `.husky/`. A blocked
   commit is the system working. Report the block and what it said. This applies
   even when the developer seems to be in a hurry.

3. **Do not type `[GEN-<n>]` into the commit message yourself.** It is injected from
   the branch name by a hook. Typing it as well risks a duplicated prefix.

4. **If you need a new branch and have a ticket**, create it in the correct shape
   first — renaming later is more disruptive than naming it right.

5. **Scopes are lower-case.** `fix(DefaultPlacement):` is rejected; use
   `fix(placement):`.

6. **Set the PR title yourself: `[GEN-<n>] <type>(<scope>): <summary>`.** Never accept GitHub's default
   title and never use `gh pr create --fill` on a branch with more than one commit. For a
   multi-commit PR, GitHub derives the title from the branch name and turns hyphens into spaces,
   so `GEN-10459` becomes `GEN 10459`. That is no longer a Jira key, and on squash-merge it becomes
   the commit subject. Pass `--title` explicitly.
