import type { Breakpoint } from "../types";

import { layout1024 } from "./1024";
import { layout1280 } from "./1280";
import { layout1512 } from "./1512";
import { layout420 } from "./420";
import { layout748 } from "./748";

/**
 * Default breakpoint registry. Each entry's loader returns its layout
 * synchronously — module-level imports above mean tree-shaking depends
 * on consumer usage. Hosts that ship only one breakpoint should pass
 * a custom registry to `<HierarchicalGrid>` to skip the unused modules.
 */
export const BREAKPOINTS: Breakpoint[] = [
  { minWidth: 0, load: () => layout420 },
  { minWidth: 748, load: () => layout748 },
  { minWidth: 1024, load: () => layout1024 },
  { minWidth: 1280, load: () => layout1280 },
  { minWidth: 1512, load: () => layout1512 },
];
