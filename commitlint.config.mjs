/**
 * Commit message rules.
 *
 * Our subject format is deliberately NOT valid Conventional Commits:
 *
 *     [GEN-10459] feat(cxr): lower unmuted-autoplay volume
 *
 * so the default parser cannot read it and `parserPreset.parserOpts.headerPattern`
 * below is load-bearing. Restore the stock pattern and every commit in this repo
 * stops parsing. See docs/adr/0001-jira-ticket-enforcement-via-local-git-hooks.md.
 *
 * The ticket group is OPTIONAL in the pattern on purpose. Grandfathered branches are
 * excused from the ticket but not from the rest; if the group were required, their
 * messages would fail to parse and every other rule would misfire at once.
 *
 * This file is .mjs on purpose: the repo standard is ESM only, and an ESM
 * commitlint.config.js would break the day someone adds "type": "module".
 *
 * Merge, fixup!/squash! and Revert commits need no handling here — commitlint's
 * defaultIgnores already skips them.
 */
const ticketRequired = process.env.JIRA_TICKET_REQUIRED !== "0";

export default {
  extends: ["@commitlint/config-conventional"],

  parserPreset: {
    parserOpts: {
      headerPattern: /^(?:\[(GEN-[1-9][0-9]*)\] )?(\w+)(?:\(([^)]+)\))?!?: (.+)$/,
      headerCorrespondence: ["ticket", "type", "scope", "subject"],
    },
  },

  plugins: [
    {
      rules: {
        "jira-ticket": ({ ticket }) => [
          /^GEN-[1-9][0-9]*$/.test(ticket || ""),
          [
            "commit subject must start with a Jira ticket, e.g.",
            "",
            "    [GEN-10459] feat(cxr): lower unmuted-autoplay volume",
            "",
            "Normally this is added for you from the branch name. Seeing this means",
            "the branch has no ticket in it — rename the branch rather than typing",
            "the ticket by hand, so every later commit gets it automatically.",
            "",
            "GEN-000 and GEN-0000 are not tickets.",
          ].join("\n"),
        ],
      },
    },
  ],

  rules: {
    "jira-ticket": [ticketRequired ? 2 : 0, "always"],

    // Caught `refector:` and `test+docs(cxr):` in real history.
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"],
    ],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],

    // Deliberately NOT scope-enum: `cxr` is not the package name
    // `contextual-reels`, so a closed list would reject the vocabulary in use.
    "scope-case": [2, "always", "lower-case"],

    // 112, not 100: the '[GEN-10459] ' prefix is injected, so a 100 limit would
    // reject an 88-character subject with "current length is 111" — a number the
    // developer never typed and cannot see in their editor. 112 = 100 + prefix.
    "header-max-length": [2, "always", 112],
    "body-max-line-length": [0],
  },
};
