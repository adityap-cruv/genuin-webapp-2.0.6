import base from "./base.js";
import reactInternal from "./react-internal.js";

/**
 * ESLint configuration for React library packages (ui, components, web-sdk).
 * Does NOT include Next.js rules — use index.js for Next.js apps.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  ...base,
  ...reactInternal,
  {
    rules: {
      // Library packages don't configure parserOptions.project for typed linting.
      "@typescript-eslint/no-misused-promises": "off",

      // Allow console.warn/error for surfacing real issues; flag console.log as debug noise.
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Flag unused vars as errors; _-prefixed names opt out intentionally.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];
