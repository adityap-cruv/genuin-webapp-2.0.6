/**
 * Hierarchical Tree — rule-level validator.
 *
 * Pure helpers that enforce the rules from SKILL.md §"Hard rules /
 * fail conditions" that cannot be expressed by the Zod schema alone
 * (structural shape lives in `./schema.ts`).
 *
 * The CLI wrapper (`scripts/validate-page-artifact.mjs`) and the
 * runtime walker both consume this module. Errors are accumulated
 * (never fast-failed) so a single pass surfaces the full diagnostic.
 *
 * Closed allow-list, deny-list, and per-breakpoint budgets below are
 * lifted verbatim from `.team/skills/hierarchical-tree/SKILL.md`
 * (sections "Closed UI vocabulary", "Explicit deny-list",
 * "Per-breakpoint budgets"). Any amendment to the SKILL must update
 * this file in lock-step — both surfaces are the contract.
 */

import type { Nodes as MdastNode } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';

import { pageSchema, type LayoutNode, type LayoutTree, type Page, type SlotNode } from './schema';

/**
 * The 23 emittable `uiVariant` strings (7 layout primitives + 13
 * static-page atoms + 3 authored-structure interactive atoms).
 * Source: SKILL.md §"Closed UI vocabulary".
 */
export const ALLOWED_UI_VARIANTS: readonly string[] = [
  // Layout primitives (7)
  'row',
  'column',
  'stack',
  'cluster',
  'grid',
  'split-view',
  'container',
  // Static-page atoms (13)
  'button',
  'avatar',
  'chip',
  'image',
  'decorative-list',
  'meta-list',
  'heading',
  'text',
  'divider',
  'link',
  'icon',
  'accent-border',
  'surface',
  // Authored-structure interactive atoms (3)
  'accordion',
  'tabs',
  'collapsible',
] as const;

/**
 * Strings the agent must NEVER emit as a `uiVariant`. Hitting one of
 * these surfaces a distinct error code so the agent can self-correct
 * to a closed-vocabulary primitive.
 * Source: SKILL.md §"Explicit deny-list — never emit any of these".
 */
export const DENY_LIST_UI_VARIANTS: readonly string[] = [
  // Runtime / interaction primitives
  'dialog',
  'popover',
  'tooltip',
  'sheet',
  'dynamic-sheet',
  'hover-card',
  'command',
  'loader',
  'skeleton',
  'toaster',
  // Form controls
  'form',
  'input',
  'select',
  'checkbox',
  'radio-input',
  'textarea',
  'switch',
  'slider',
  'phone-input',
  'input-otp',
  'label',
  // Tables and media
  'table',
  'video-player',
  'audio-player',
] as const;

/**
 * Slot-count budgets per breakpoint band. The validator picks the
 * band whose `minWidth` ≤ tree.minWidth (last match wins — same as
 * CSS media-query semantics).
 * Source: SKILL.md §"Per-breakpoint budgets".
 */
export interface BudgetBand {
  /** Lower bound (inclusive) for the band. */
  minWidth: number;
  /** Max `content` Slots allowed in the tree. */
  maxContent: number;
  /** Max `video` Slots allowed in the tree. */
  maxVideo: number;
  /** Max `linkout` Slots allowed in the tree. */
  maxLinkout: number;
  /** Soft cap on total Slot count for the tree. */
  maxTotal: number;
}

export const BUDGET_BANDS: readonly BudgetBand[] = [
  { minWidth: 0, maxContent: 1, maxVideo: 4, maxLinkout: 13, maxTotal: 20 },
  { minWidth: 748, maxContent: 1, maxVideo: 4, maxLinkout: 11, maxTotal: 15 },
  { minWidth: 1024, maxContent: 2, maxVideo: 4, maxLinkout: 13, maxTotal: 18 },
  { minWidth: 1280, maxContent: 1, maxVideo: 4, maxLinkout: 14, maxTotal: 18 },
  { minWidth: 1512, maxContent: 2, maxVideo: 4, maxLinkout: 13, maxTotal: 17 },
] as const;

/** UI-node grid-placement props that are never allowed (rule 3). */
const FORBIDDEN_UI_GRID_PROPS: readonly string[] = ['col', 'row', 'colSpan', 'rowSpan'] as const;

/**
 * UI variants that honor the closed `minHeight` / `height` dimension
 * decorators. Other variants ignore the props — the validator surfaces
 * a `DIMENSION_NO_EFFECT` warning so authors don't carry no-op props.
 * Spec §4.1: dimensions belong to children/parent for layout glue
 * (`row`, `column`, `grid`, `split-view`, `cluster`); only the wrapper
 * primitives below own a visible bounding box.
 */
const DIMENSION_AWARE_UI_VARIANTS: readonly string[] = ['surface', 'stack', 'container'] as const;

/** Allowed MDAST node types in `content` Slot body markdown. */
const ALLOWED_MARKDOWN_NODE_TYPES: ReadonlySet<string> = new Set([
  'root',
  'paragraph',
  'heading',
  'list',
  'listItem',
  'link',
  'image',
  'emphasis',
  'strong',
  'blockquote',
  'code',
  'inlineCode',
  'thematicBreak',
  'text',
  'break',
  // mdast-util-from-markdown emits these structural wrappers
  'definition',
]);

/** Stable rule code emitted alongside each error/warning. */
export interface ValidationError {
  /**
   * Stable rule code, e.g. `'LINKOUT_BEFORE_FEED_VIDEO'`,
   * `'BAD_UI_VARIANT'`, `'SLOT_BUDGET_EXCEEDED'` (warning),
   * `'DENSITY_NO_EFFECT'` (warning).
   */
  code: string;
  /** Human-readable message including the offending value when relevant. */
  message: string;
  /** JSONPath-ish location, e.g. 'breakpoints[0].root.children[2]'. */
  path: string;
}

/**
 * Result of a rule-level validation pass. `ok` is `true` iff
 * `errors` is empty; `warnings` is non-blocking diagnostic noise
 * (e.g. budget over upper bound).
 */
export interface ValidationResult {
  ok: boolean;
  /** Empty when `ok=true`. */
  errors: ValidationError[];
  /** Warnings (non-blocking — e.g. budget over upper bound). */
  warnings: ValidationError[];
}

/** Build a JSONPath-ish path from a parent prefix and a child segment. */
function pathJoin(parent: string, segment: string | number): string {
  if (parent === '') {
    return typeof segment === 'number' ? `[${segment}]` : segment;
  }
  return typeof segment === 'number' ? `${parent}[${segment}]` : `${parent}.${segment}`;
}

/** Find the budget band matching a given `minWidth` (last match wins). */
function pickBudgetBand(minWidth: number): BudgetBand {
  // BUDGET_BANDS is a non-empty readonly array; index 0 always exists.
  // The non-null assertion is justified by the constant's literal shape.
   
  let band: BudgetBand = BUDGET_BANDS[0]!;
  for (const candidate of BUDGET_BANDS) {
    if (candidate.minWidth <= minWidth) {
      band = candidate;
    }
  }
  return band;
}

/** Type guard: is the node a Slot? */
function isSlot(node: LayoutNode): node is SlotNode {
  return node.type === 'slot';
}

/**
 * Walk an MDAST tree and push an error for every node whose type is
 * not in the markdown allow-list, plus H1 headings (depth === 1).
 */
function checkMarkdownNode(node: MdastNode, slotPath: string, errors: ValidationError[]): void {
  if (!ALLOWED_MARKDOWN_NODE_TYPES.has(node.type)) {
    errors.push({
      code: 'MARKDOWN_DISALLOWED_NODE',
      message: `Markdown body contains disallowed construct '${node.type}' (allow-list rejects raw HTML, JSX, tables, and other unrecognized nodes).`,
      path: slotPath,
    });
    return;
  }
  if (node.type === 'heading') {
    // `Heading` carries a `depth` field (1-6).
    const depth = (node as { depth: number }).depth;
    if (depth === 1) {
      errors.push({
        code: 'MARKDOWN_DISALLOWED_NODE',
        message:
          "Markdown body contains H1 (`# heading`). Page-level H1 belongs in a `heading` UI node; markdown allows only H2/H3.",
        path: slotPath,
      });
    } else if (depth > 3) {
      errors.push({
        code: 'MARKDOWN_DISALLOWED_NODE',
        message: `Markdown body contains H${depth}. Only H2 and H3 are allowed inside a content Slot.`,
        path: slotPath,
      });
    }
  }
  // Recurse into children if present (mdast nodes that have children).
  const children = (node as { children?: MdastNode[] }).children;
  if (Array.isArray(children)) {
    for (const child of children) {
      checkMarkdownNode(child, slotPath, errors);
    }
  }
}

/**
 * Parse the markdown `body` payload of a `content` Slot and reject
 * anything outside the SKILL allow-list. No-op if the slot has no
 * string `body`.
 */
function validateContentMarkdown(slot: SlotNode, slotPath: string, errors: ValidationError[]): void {
  const body = slot.props?.body;
  if (typeof body !== 'string') {
    return;
  }
  let tree: MdastNode;
  try {
    tree = fromMarkdown(body);
  } catch (err) {
    // Parse failure is itself a rule violation — the runtime walker
    // would also fail to render this.
    errors.push({
      code: 'MARKDOWN_DISALLOWED_NODE',
      message: `Markdown body failed to parse: ${(err as Error).message}`,
      path: slotPath,
    });
    return;
  }
  // `fromMarkdown` raw HTML appears as nodes with `type: 'html'`,
  // which is NOT in the allow-list, so the recursive check below
  // already rejects it. Same for MDX (`mdxJsxFlowElement`, etc.).
  checkMarkdownNode(tree, slotPath, errors);
}

/**
 * Per-node rule checks. Walks one node, recurses into children, and
 * pushes errors/warnings into the supplied collectors.
 *
 * `currentStripe` carries the active visual stripe when we descend
 * through a `split-view` subtree: every Slot found under that
 * SplitView (at any depth) is appended to the same stripe so rule 13
 * treats the SplitView's tracks as parallel rather than sequential.
 * Outside a SplitView, each Slot becomes its own single-element stripe
 * and the existing source-order semantics apply.
 */
function walkNode(
  node: LayoutNode,
  nodePath: string,
  ctx: {
    errors: ValidationError[];
    warnings: ValidationError[];
    slotNames: Set<string>;
    slotsInOrder: SlotNode[];
    stripes: SlotNode[][];
  },
  currentStripe: SlotNode[] | null,
): void {
  if (isSlot(node)) {
    ctx.slotsInOrder.push(node);
    if (currentStripe) {
      currentStripe.push(node);
    } else {
      ctx.stripes.push([node]);
    }

    // Rule 9 — duplicate slot name within the tree.
    if (ctx.slotNames.has(node.name)) {
      ctx.errors.push({
        code: 'DUPLICATE_SLOT_NAME',
        message: `Slot name '${node.name}' appears more than once in this LayoutTree. Slot names must be unique per tree.`,
        path: nodePath,
      });
    } else {
      ctx.slotNames.add(node.name);
    }

    // Rule 7 — per-kind allowed styles. Defaults per SKILL output
    // schema: content + linkout default to 'single', video defaults
    // to 'feed'. Treat `undefined` as the default and validate the
    // resolved value.
    const rawStyle = node.style;
    const resolvedStyle =
      rawStyle ?? (node.kind === 'video' ? 'feed' : 'single');
    if (node.kind === 'content' && resolvedStyle !== 'single') {
      ctx.errors.push({
        code: 'BAD_KIND_STYLE',
        message: `content Slot has style '${rawStyle}'. content allows only 'single' (or omitted).`,
        path: nodePath,
      });
    }
    if (node.kind === 'video' && resolvedStyle === 'single') {
      ctx.errors.push({
        code: 'BAD_KIND_STYLE',
        message: `video Slot has style 'single'. video allows only 'feed' | 'grid' | 'carousel'.`,
        path: nodePath,
      });
    }
    if (node.kind === 'linkout' && resolvedStyle === 'feed') {
      ctx.errors.push({
        code: 'BAD_KIND_STYLE',
        message: `linkout Slot has style 'feed'. linkout allows only 'single' | 'grid' | 'carousel'.`,
        path: nodePath,
      });
    }
    const style = rawStyle;

    // Rule 8 — style decorator requirements.
    if (style === 'grid') {
      if (typeof node.cols !== 'number' || typeof node.rows !== 'number') {
        ctx.errors.push({
          code: 'MISSING_STYLE_DECORATOR',
          message: `Slot style 'grid' requires both 'cols' and 'rows' (got cols=${node.cols ?? 'undefined'}, rows=${node.rows ?? 'undefined'}).`,
          path: nodePath,
        });
      }
    }
    if (style === 'carousel') {
      if (typeof node.cols !== 'number') {
        ctx.errors.push({
          code: 'MISSING_STYLE_DECORATOR',
          message: `Slot style 'carousel' requires 'cols' (got cols=${node.cols ?? 'undefined'}).`,
          path: nodePath,
        });
      }
    }

    // Density hint — only meaningful on linkout (v0) / video (v1).
    // On content Slots, emit a non-blocking warning. Rule code:
    // `DENSITY_NO_EFFECT`.
    if (node.kind === 'content' && node.density !== undefined) {
      ctx.warnings.push({
        code: 'DENSITY_NO_EFFECT',
        message:
          'density has no effect on content slots; remove the field or move it to a linkout/video slot',
        path: nodePath,
      });
    }

    // Aspect ratio — only meaningful on video / linkout (which carry
    // a visible bounded frame). Content slots size themselves from
    // markdown flow, so emit `ASPECT_NO_EFFECT` instead of silently
    // dropping the decorator.
    if (node.kind === 'content' && node.aspect !== undefined) {
      ctx.warnings.push({
        code: 'ASPECT_NO_EFFECT',
        message:
          'aspect has no effect on content slots; markdown bodies size themselves — remove the field or move it to a linkout/video slot',
        path: nodePath,
      });
    }

    // Markdown allow-list — content Slots only.
    if (node.kind === 'content') {
      validateContentMarkdown(node, nodePath, ctx.errors);
    }

    return;
  }

  // UI node — rules 3 + 11.
  // Rule 3 — UI grid-placement props on a UI node.
  if (node.props) {
    for (const forbidden of FORBIDDEN_UI_GRID_PROPS) {
      if (forbidden in node.props) {
        ctx.errors.push({
          code: 'UI_GRID_PLACEMENT_PROPS',
          message: `UI node carries forbidden grid-placement prop '${forbidden}'. Positioning is internal to each layout primitive — use grid / split-view / row / column for arrangement.`,
          path: nodePath,
        });
      }
    }

    // Dimension decorators — `minHeight` and `height` are only
    // honored by `surface` / `stack` / `container`. On every other
    // UI variant they fall through to no-op props, so emit a
    // non-blocking warning so authors fix the misuse. Same pattern as
    // DENSITY_NO_EFFECT on content slots.
    if (!DIMENSION_AWARE_UI_VARIANTS.includes(node.uiVariant)) {
      for (const prop of ['minHeight', 'height'] as const) {
        if (prop in node.props) {
          ctx.warnings.push({
            code: 'DIMENSION_NO_EFFECT',
            message: `'${prop}' has no effect on '${node.uiVariant}' nodes; only surface, stack, and container honor the dimension decorators.`,
            path: nodePath,
          });
        }
      }
    }
  }

  // Rule 11 — uiVariant allow-list + deny-list.
  if (DENY_LIST_UI_VARIANTS.includes(node.uiVariant)) {
    ctx.errors.push({
      code: 'DENY_LIST_UI_VARIANT',
      message: `uiVariant '${node.uiVariant}' is on the explicit deny-list (runtime / interaction primitives, form controls, or media players are never emittable).`,
      path: nodePath,
    });
  } else if (!ALLOWED_UI_VARIANTS.includes(node.uiVariant)) {
    ctx.errors.push({
      code: 'BAD_UI_VARIANT',
      message: `uiVariant '${node.uiVariant}' is not in the 22-string allow-list.`,
      path: nodePath,
    });
  }

  if (node.uiVariant === 'split-view') {
    // Open a new visual stripe; every slot in any track of this
    // SplitView (and any nested subtree) goes into it. Visually the
    // tracks are side-by-side, so rule 13 treats them as parallel.
    const stripe: SlotNode[] = [];
    ctx.stripes.push(stripe);
    if (node.children) {
      node.children.forEach((child, idx) => {
        walkNode(child, pathJoin(nodePath, pathJoin('children', idx)), ctx, stripe);
      });
    }
    return;
  }

  if (node.children) {
    node.children.forEach((child, idx) => {
      walkNode(child, pathJoin(nodePath, pathJoin('children', idx)), ctx, currentStripe);
    });
  }
}

/** Run all per-tree rule checks for a single LayoutTree. */
function validateTree(
  tree: LayoutTree,
  treePath: string,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  // Rule 4 — root must be a UI node.
  const rootPath = pathJoin(treePath, 'root');
  if (tree.root.type !== 'ui') {
    errors.push({
      code: 'ROOT_NOT_UI',
      message: `LayoutTree '${tree.id}' has root.type='${tree.root.type}'. Root must be a UI node.`,
      path: rootPath,
    });
    // Even if the root is a slot we still want to walk it so other
    // rules surface.
  }

  const ctx = {
    errors,
    warnings,
    slotNames: new Set<string>(),
    slotsInOrder: [] as SlotNode[],
    stripes: [] as SlotNode[][],
  };
  walkNode(tree.root, rootPath, ctx, null);

  // Rule 12 — every tree carries ≥1 content Slot.
  const hasContent = ctx.slotsInOrder.some(s => s.kind === 'content');
  if (!hasContent) {
    errors.push({
      code: 'MISSING_CONTENT_SLOT',
      message: `LayoutTree '${tree.id}' has no 'content' Slot. Each tree requires at least one anchor content Slot.`,
      path: treePath,
    });
  }

  // Rule 12b — every tree carries ≥1 anchor `feed` video (spec §5.1
  // Phase 1, §5.6 minimum). The feed video grounds the page; Phase 1 is
  // a fixed prerequisite chain, so the anchor is required regardless of
  // whether any linkout is present (rule 13 only governs *ordering* when
  // a linkout exists). Video Slots default to style='feed', so an
  // undefined style counts as the anchor.
  const hasFeedVideo = ctx.slotsInOrder.some(
    s => s.kind === 'video' && (s.style === 'feed' || s.style === undefined),
  );
  if (!hasFeedVideo) {
    errors.push({
      code: 'MISSING_ANCHOR_VIDEO',
      message: `LayoutTree '${tree.id}' has no anchor 'video' Slot with style='feed'. Each tree requires at least one feed video (spec §5.1 Phase 1 / §5.6 minimum).`,
      path: treePath,
    });
  }

  // Rule 13 — a feed video must precede any linkout in *visual* reading
  // order. SplitView tracks are visually parallel: a feed video in any
  // track satisfies rule 13 for linkouts in any other track of the same
  // SplitView. Outside a SplitView, source order is the reading order.
  //
  // Implementation: stripes are emitted in source order, but every slot
  // under a SplitView (any track, any depth) goes into the same stripe.
  // We compare *stripe indices* rather than slot indices, so equal
  // indices (same stripe = same SplitView) count as satisfied.
  // Video Slots default to style='feed', so undefined counts as feed.
  const firstFeedVideoStripe = ctx.stripes.findIndex(stripe =>
    stripe.some(s => s.kind === 'video' && (s.style === 'feed' || s.style === undefined)),
  );
  const firstLinkoutStripe = ctx.stripes.findIndex(stripe =>
    stripe.some(s => s.kind === 'linkout'),
  );
  if (firstLinkoutStripe !== -1) {
    if (firstFeedVideoStripe === -1 || firstLinkoutStripe < firstFeedVideoStripe) {
      const offending = ctx.stripes[firstLinkoutStripe]?.find(s => s.kind === 'linkout');
      errors.push({
        code: 'LINKOUT_BEFORE_FEED_VIDEO',
        message: `linkout Slot '${offending?.name ?? '<unknown>'}' appears in visual reading order before any video Slot with style='feed'. Phase 1 requires the anchor feed video first (SplitView tracks count as parallel — a feed video in any track satisfies the rule for linkouts in other tracks of the same SplitView).`,
        path: treePath,
      });
    }
  }

  // Rule 14 — per-breakpoint budget. Warning, not error.
  const band = pickBudgetBand(tree.minWidth);
  let contentCount = 0;
  let videoCount = 0;
  let linkoutCount = 0;
  for (const slot of ctx.slotsInOrder) {
    if (slot.kind === 'content') {
      contentCount += 1;
    } else if (slot.kind === 'video') {
      videoCount += 1;
    } else if (slot.kind === 'linkout') {
      linkoutCount += 1;
    }
  }
  const total = ctx.slotsInOrder.length;
  if (contentCount > band.maxContent) {
    warnings.push({
      code: 'SLOT_BUDGET_EXCEEDED',
      message: `content Slot count (${contentCount}) exceeds budget (${band.maxContent}) for minWidth=${band.minWidth} band.`,
      path: treePath,
    });
  }
  if (videoCount > band.maxVideo) {
    warnings.push({
      code: 'SLOT_BUDGET_EXCEEDED',
      message: `video Slot count (${videoCount}) exceeds budget (${band.maxVideo}) for minWidth=${band.minWidth} band.`,
      path: treePath,
    });
  }
  if (linkoutCount > band.maxLinkout) {
    warnings.push({
      code: 'SLOT_BUDGET_EXCEEDED',
      message: `linkout Slot count (${linkoutCount}) exceeds budget (${band.maxLinkout}) for minWidth=${band.minWidth} band.`,
      path: treePath,
    });
  }
  if (total > band.maxTotal) {
    warnings.push({
      code: 'SLOT_BUDGET_EXCEEDED',
      message: `total Slot count (${total}) exceeds budget (${band.maxTotal}) for minWidth=${band.minWidth} band.`,
      path: treePath,
    });
  }
}

/**
 * Validate a Page artifact against the SKILL.md "Hard rules" section.
 * Assumes the input has already passed `pageSchema.safeParse(...)` —
 * this function only checks rules the Zod schema cannot express.
 *
 * Accumulates every violation; never fast-fails.
 */
export function validatePageRules(page: Page): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Rule 16 — breakpoint id uniqueness.
  const seenIds = new Set<string>();
  page.breakpoints.forEach((tree, i) => {
    if (seenIds.has(tree.id)) {
      errors.push({
        code: 'DUPLICATE_BREAKPOINT_ID',
        message: `Breakpoint id '${tree.id}' is duplicated across LayoutTrees. Each tree id must be unique.`,
        path: pathJoin('breakpoints', i),
      });
    } else {
      seenIds.add(tree.id);
    }
  });

  // Rule 17 — smallest minWidth must be 0.
  const smallestMinWidth = page.breakpoints.reduce(
    (acc, tree) => Math.min(acc, tree.minWidth),
    Number.POSITIVE_INFINITY,
  );
  if (smallestMinWidth !== 0) {
    errors.push({
      code: 'MISSING_MIN_WIDTH_ZERO',
      message: `The smallest breakpoint minWidth is ${smallestMinWidth}; mobile-first requires the smallest entry to be 0.`,
      path: 'breakpoints',
    });
  }

  // Per-tree rules.
  page.breakpoints.forEach((tree, idx) => {
    const treePath = pathJoin('breakpoints', idx);
    validateTree(tree, treePath, errors, warnings);
  });

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Convenience: schema-parse + rule-check in one call. Returns parse
 * errors as `ValidationError`s with code `'SCHEMA'` so callers handle
 * one error shape.
 */
export function validatePage(input: unknown): ValidationResult & { page?: Page } {
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) {
    const errors: ValidationError[] = parsed.error.issues.map(issue => ({
      code: 'SCHEMA',
      message: issue.message,
      path: issue.path.length === 0 ? '' : issue.path.map(seg =>
        typeof seg === 'number' ? `[${seg}]` : seg,
      ).join('.'),
    }));
    return { ok: false, errors, warnings: [] };
  }
  const result = validatePageRules(parsed.data);
  return { ...result, page: parsed.data };
}
