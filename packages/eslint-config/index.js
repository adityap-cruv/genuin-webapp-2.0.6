// Shared ESLint flat config for Genuin monorepo
// See: https://eslint.org/docs/latest/use/configure/configuration-files-new

/** @type {import('eslint').Linter.FlatConfig[]} */
import base from "./base.js";
import next from "./next.js";
import reactInternal from "./react-internal.js";

// Flatten the config arrays to avoid nested arrays
const flatConfig = [
  ...base,
  ...next,
  ...reactInternal,
  // Add more configs or overrides as needed
];

export default flatConfig;
