#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook: refuse attempts to bypass the git hooks.
 *
 * KNOWN LIMITS — read before trusting this.
 * This inspects the raw Bash command string. It does not parse shell grammar, so it
 * cannot soundly decide "will the shell ultimately skip the hooks?". It catches the
 * direct attempts and the common quoting tricks. It does NOT catch indirection the
 * string never reveals — writing a script with the Write tool then running it, a git
 * alias defined in an earlier call, or an MCP git server. It also binds Claude Code
 * only; other agents are covered by AGENTS.md alone.
 *
 * So this is a speed bump, not a sandbox. The durable guarantee is a required CI
 * check, deliberately out of scope for now. Note the enforcement hooks themselves no
 * longer source husky's shim, so HUSKY=0 and ~/.huskyrc cannot disable them for
 * anyone — that fix does not depend on this file.
 *
 * FALSE POSITIVES ARE A REAL COST. Blocking `SKIP_ENV_VALIDATION=1 pnpm build` or
 * `git log -n 5` with a stern traceability lecture teaches the model that the block
 * is noise, which is worse than having no hook. Hence the tokenising below rather
 * than free-text matching.
 *
 * Exit 2 = block the tool call and show stderr back to the model.
 */
let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let command = "";
  try {
    command = (JSON.parse(raw).tool_input || {}).command || "";
  } catch {
    process.exit(0); // unparseable input is not ours to adjudicate
  }

  // 1. Drop quoted spans. This also defeats fragment-splitting:
  //    --no-verif''y becomes '--no-verif y', and '--no-verif' still matches below.
  //    Drop quoted spans. A commit message like -m "fix: handle -n correctly" must
  //    never be mistaken for a flag. Done before anything else.
  const unquoted = command.replace(/'[^']*'/g, " ").replace(/"(?:[^"\\]|\\.)*"/g, " ");

  // 2. Split into segments on shell separators so an assignment prefix is only
  //    recognised where the shell would treat it as one.
  const segments = unquoted
    .split(/[;&|]+|\n/)
    .map((t) => t.trim())
    .filter(Boolean);

  // SKIP_CXR_CHECKS is a documented, legitimate escape hatch in .husky/pre-push. It
  // skips the Contextual Reels test suite, NOT traceability — the branch gate runs
  // before it and is unaffected. Blocking it would contradict our own pre-push.
  const ALLOWED_ENV = new Set(["SKIP_CXR_CHECKS"]);

  let hookEnvVar = null;
  for (const seg of segments) {
    // Only relevant when this segment actually runs git. SKIP_ENV_VALIDATION=1 in
    // front of `pnpm build` is standard Next.js practice and has nothing to do with
    // git hooks; blocking it would be exactly the kind of noise that teaches the
    // model to ignore this guard.
    if (!/(^|\s)(git|[^\s]*\/git)(\s|$)/.test(seg)) continue;
    for (const m of seg.matchAll(/(^|\s)([A-Za-z_][A-Za-z0-9_]*)=(\S*)/g)) {
      const [, , name, value] = m;
      const before = seg.slice(0, m.index).trim();
      // Only an assignment PREFIX disables hooks for the following command.
      if (before && !/^(env|sudo|nice)$/.test(before)) continue;
      if (name === "HUSKY" && value === "0") hookEnvVar = "HUSKY=0";
      else if (name === "husky_skip_init") hookEnvVar = "husky_skip_init";
      else if (/^SKIP_[A-Z0-9_]+$/.test(name) && !ALLOWED_ENV.has(name)) hookEnvVar = `${name}=`;
    }
  }

  // Find git's subcommand, skipping global options. `git -c core.hooksPath=x commit`
  // must be seen as a commit.
  const gitSubcommand = (seg) => {
    const parts = seg.split(/\s+/);
    const i = parts.findIndex((p) => p === "git" || p.endsWith("/git"));
    if (i === -1) return null;
    for (let j = i + 1; j < parts.length; j++) {
      const p = parts[j];
      if (p === "-c" || p === "--config-env") {
        j++;
        continue;
      }
      if (p.startsWith("-")) continue;
      return { sub: p, rest: parts.slice(j + 1), all: parts };
    }
    return null;
  };

  let noVerify = null;
  let hookTamper = null;
  for (const seg of segments) {
    const g = gitSubcommand(seg);
    if (g && /core\.hooksPath/.test(seg)) hookTamper = "a change to core.hooksPath";
    if (!g) continue;
    const isCommit = g.sub === "commit";
    const isPush = g.sub === "push";
    if (!isCommit && !isPush) continue;
    // git accepts unambiguous long-option prefixes, so --no-veri really works.
    if (g.all.some((p) => /^--no-ver/.test(p))) noVerify = "--no-verify";
    // For commit, -n is --no-verify (anywhere in a short cluster: -nm is n + m).
    // For push, -n is --dry-run and is harmless.
    if (isCommit && g.all.some((p) => /^-[a-zA-Z]*n/.test(p) && !p.startsWith("--"))) noVerify = "-n (--no-verify)";
  }

  if (/\b(rm|mv|truncate|chmod)\b[^\n]*\.husky\b/.test(unquoted)) hookTamper = "removing or disabling a hook file";

  const reason = noVerify
    ? `a ${noVerify} bypass`
    : hookEnvVar
      ? `${hookEnvVar}, which disables git hooks`
      : hookTamper || null;

  if (reason) {
    console.error(
      [
        `Blocked: this command contains ${reason}.`,
        "",
        "This repository does not permit bypassing git hooks. A blocked commit or",
        "push is the traceability check working as intended.",
        "",
        "Instead: read what the hook printed and fix the cause. Usually the branch",
        "needs renaming to <type>/GEN-<ticket>/<slug>. If you do not have a ticket",
        "number, stop and ask the user — never invent one.",
        "",
        "See AGENTS.md#commits--branches",
      ].join("\n")
    );
    process.exit(2);
  }
  process.exit(0);
});
