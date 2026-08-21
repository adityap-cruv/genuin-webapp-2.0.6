#!/usr/bin/env sh
# Shared helper for the graphify git hooks (.husky/post-commit, post-checkout,
# post-merge). Two jobs:
#   1. If the optional `graphify` CLI is installed  -> rebuild the knowledge graph
#      (detached, AST-only, no LLM/API cost).
#   2. If it is NOT installed -> print a one-time-per-day hint telling the dev how
#      to enable it. Never blocks or fails the git operation.
#
# Arg $1 = event: "commit" | "checkout" | "merge".

event="${1:-}"

if command -v graphify >/dev/null 2>&1; then
    # Don't rebuild in the middle of a rebase/cherry-pick commit (would touch the
    # tree during --continue). Merges/checkouts are fine.
    if [ "$event" = "commit" ]; then
        git_dir=$(git rev-parse --git-dir 2>/dev/null) || exit 0
        for _m in rebase-merge rebase-apply CHERRY_PICK_HEAD; do
            [ -e "$git_dir/$_m" ] && exit 0
        done
    fi
    mkdir -p "${HOME}/.cache" 2>/dev/null
    ( graphify update . >"${HOME}/.cache/graphify-rebuild.log" 2>&1 & ) >/dev/null 2>&1
    exit 0
fi

# --- graphify CLI not installed: nudge the developer ---------------------------
# Never nag on the dev's own commits; only on pull/merge and branch checkout.
[ "$event" = "commit" ] && exit 0

# Throttle to once per day so it informs without spamming every branch switch.
_stamp="${HOME}/.cache/graphify-enable-hint.day"
_today=$(date +%Y%m%d 2>/dev/null || echo unknown)
[ "$_today" = "$(cat "$_stamp" 2>/dev/null)" ] && exit 0
mkdir -p "${HOME}/.cache" 2>/dev/null
printf '%s' "$_today" > "$_stamp" 2>/dev/null

cat >&2 <<'MSG'

  ────────────────────────────────────────────────────────────────────────
   📊  This repo is now graphify-compatible (code knowledge-graph for
       AI-assisted dev). It's OPTIONAL and currently OFF on your machine.

   Enable it once (per machine):
       brew install uv && uv tool install graphifyy
       graphify update .          # build the graph once (~30s, free, local)

   After that it auto-rebuilds on every commit / pull — nothing else to do.
   Full details & uninstall:  docs/setup/GRAPHIFY.md

   (Shown once a day until installed; it never blocks your git commands.)
  ────────────────────────────────────────────────────────────────────────

MSG
exit 0
