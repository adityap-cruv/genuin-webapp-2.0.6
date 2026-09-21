#!/usr/bin/env sh
# Regenerates grandfathered.txt: the branches that existed when enforcement began
# AND would otherwise be blocked by it.
#
# Branches that already satisfy the naming rule are deliberately excluded — listing
# them would be noise, and it would silently excuse a compliant branch from the
# ticket rule if it were ever renamed. Same for release/* and support/*, which are
# exempt by type, not by history.
#
# Run at rollout, and once more immediately before the enforcement change merges.
# Re-running AFTER merge would excuse branches created under enforcement, which
# defeats the point — so this is not wired into any hook.
set -e
ROOT=$(git rev-parse --show-toplevel)
. "$ROOT/scripts/jira-hook/lib.sh"
OUT="$ROOT/scripts/jira-hook/grandfathered.txt"
# Copy first: the `> "$OUT"` below truncates the file as the pipeline starts, before
# a `cat "$OUT"` inside it could read anything.
PREV=$(mktemp "${TMPDIR:-/tmp}/grandfathered.XXXXXX")
trap 'rm -f "$PREV"' EXIT
[ -f "$OUT" ] && cp "$OUT" "$PREV"

# Merge with the existing list rather than overwrite it. A re-run after
# `git fetch --prune` would otherwise DROP branches deleted on the remote — which
# can still exist as local branches on a teammate's machine, and which existed
# before enforcement either way. The set only grows until the file is retired.
{
  [ -f "$PREV" ] && cat "$PREV"
  git for-each-ref --format='%(refname:short)' refs/heads
  git for-each-ref --format='%(refname:short)' refs/remotes/origin | sed 's|^origin/||'
} | grep -v '^HEAD$' | sort -u | while IFS= read -r b; do
  [ -n "$b" ] || continue
  jira_is_exempt_branch "$b" && continue
  jira_is_trunk_branch "$b" && continue
  jira_branch_is_valid "$b" && continue
  printf '%s\n' "$b"
done > "$OUT"

printf 'wrote %s branches to %s\n' "$(wc -l < "$OUT" | tr -d ' ')" "$OUT"
