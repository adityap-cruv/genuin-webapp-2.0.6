#!/usr/bin/env sh
# Shared helpers for Jira ticket enforcement.
#
# Sourced by .husky/{prepare-commit-msg,commit-msg,post-checkout,pre-push,post-merge}.
# Pure POSIX sh — no bashisms, so it behaves the same under every dev's shell and
# under the editor/IDE git clients that do not run an interactive shell at all.
#
# See docs/adr/0001-jira-ticket-enforcement-via-local-git-hooks.md for the why.

JIRA_PROJECT_KEYS='GEN'
JIRA_TICKET_RE="(${JIRA_PROJECT_KEYS})-[1-9][0-9]*"
JIRA_BRANCH_TYPES='feature|bugfix|hotfix|chore|docs'
JIRA_EXEMPT_TYPES='release|support|stable|backport'

jira_repo_root() { git rev-parse --show-toplevel 2>/dev/null; }

jira_grandfathered_file() {
  printf '%s/scripts/jira-hook/grandfathered.txt\n' "$(jira_repo_root)"
}

# Empty on detached HEAD. The `|| :` is load-bearing: symbolic-ref EXITS 1 there, and
# hooks that run under husky's `sh -e` would abort on the bare assignment with only
# "hook exited with code 1" to show for it.
jira_current_branch() { git symbolic-ref --quiet --short HEAD 2>/dev/null || :; }

jira_rebase_in_progress() {
  _d=$(git rev-parse --git-dir 2>/dev/null) || return 1
  [ -d "$_d/rebase-merge" ] || [ -d "$_d/rebase-apply" ]
}

# Branches whose name cannot carry ONE ticket, so the ticket-in-branch rule does not
# apply to them. Message hygiene still does.
#   release/*, support/*  named for a version, not a work item
#   stable/*              a Version Line (stable/web-sdk/2.0.5) — long-lived, many tickets.
#                         See the branching plan; without this, standing up the stable
#                         lines would be rejected by pre-push.
#   backport/*            made by `npx backport` (sorenlouv/backport, default template
#   backport-<n>-to-*     backport/{{targetBranch}}/{{refValues}}) and by
#                         korthout/backport-action. Their commits are cherry-picks that
#                         already carry the source commit's [GEN-n].
jira_is_exempt_branch() {
  printf '%s\n' "$1" | grep -qE "^(${JIRA_EXEMPT_TYPES})/|^backport-[0-9]+-to-"
}

jira_is_grandfathered() {
  # `--` matters: git plumbing can produce a ref named like `-f/etc/passwd`, which
  # grep would otherwise read as options rather than as the pattern.
  _f=$(jira_grandfathered_file)
  [ -f "$_f" ] && grep -Fxq -- "$1" "$_f"
}

jira_branch_is_valid() {
  printf '%s\n' "$1" | grep -qE "^(${JIRA_BRANCH_TYPES})/${JIRA_TICKET_RE}/.+$"
}

# Echoes the ticket, or nothing if the branch does not carry one.
jira_ticket_from_branch() {
  # NB: the delimiter must not be `|`. JIRA_BRANCH_TYPES contains alternation pipes,
  # and BSD sed reads the first one as the closing delimiter — silently producing
  # nothing, so the ticket never gets injected and every commit looks non-compliant.
  printf '%s\n' "$1" | sed -nE "s#^(${JIRA_BRANCH_TYPES})/(${JIRA_TICKET_RE})/.+\$#\2#p"
}

# Subjects git itself generates, or that autosquash will delete before merge.
# commitlint ignores these too (defaultIgnores); we repeat the check because the
# injector runs before commitlint ever sees the message.
jira_subject_is_generated() {
  # Match the forms git itself generates, not any sentence starting with "Merge".
  # A plain ^Merge exempted hand-written subjects like "Merge the two configs into
  # one", which is a plausible thing to type and skipped every check.
  printf '%s\n' "$1" | grep -qE '^(fixup! |squash! |amend! |Revert "|Merge (branch|remote-tracking branch|tag|commit|pull request) )'
}

# True during an operation where git composes the message itself.
jira_git_is_composing() {
  _d=$(git rev-parse --git-dir 2>/dev/null) || return 1
  [ -f "$_d/MERGE_HEAD" ] || [ -f "$_d/REVERT_HEAD" ] || [ -f "$_d/CHERRY_PICK_HEAD" ]
}

# Trunk branches. Historically exempt, but a commit landing straight on one is worth
# saying out loud rather than waving through in silence.
JIRA_TRUNK_BRANCHES='main|master|develop|prod|qa'
jira_is_trunk_branch() {
  printf '%s\n' "$1" | grep -qE "^(${JIRA_TRUNK_BRANCHES})$"
}

jira_hint_rename() {
  _b="$1"
  # This line is designed to be pasted into a shell, so it must never carry shell
  # metacharacters out of the branch name. Git permits $( ), backticks, ; | & and
  # quotes in ref names; strip everything outside a safe slug alphabet.
  _slug=$(printf '%s\n' "$_b" | sed -E 's#^[^/]+/##; s#/#-#g' | tr -cd 'A-Za-z0-9._-')
  [ -n "$_slug" ] || _slug='short-slug'
  printf '   git branch -m feature/GEN-<ticket>/%s\n' "$_slug"
}
