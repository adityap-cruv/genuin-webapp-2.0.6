// Shared ESLint flat config for Genuin monorepo
// See: https://eslint.org/docs/latest/use/configure/configuration-files-new

import base from "./base.js";
import reactInternal from "./react-internal.js";
import next from "./next.js";

/**
 * Full monorepo config: base + React + Next.js.
 * Each sub-config is self-contained and does NOT internally extend base,
 * so rules appear exactly once in the merged array.
 *
 * @type {import('eslint').Linter.Config[]}
 */
const flatConfig = [...base, ...reactInternal, ...next];

export default flatConfig;
