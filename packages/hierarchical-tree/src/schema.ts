import { z } from "zod";

/**
 * Hierarchical Tree — Zod schema.
 *
 * Source of truth for the `Page` artifact contract emitted by the AI
 * layout generator. Mirrors {@link HIERARCHICAL_TREE_SPEC.md} §2.1–§2.3
 * and §3. Public types are inferred from these schemas in `./types.ts`.
 *
 * Consumers (validator CLI, runtime walker) import this module to
 * validate untrusted artifacts before rendering.
 */

/**
 * SlotKind — closed enum, spec §3. The AI generator may not emit any
 * other slot kind; new kinds require a spec amendment.
 */
export const slotKindSchema = z.enum(["content", "video", "linkout"]);
export type SlotKind = z.infer<typeof slotKindSchema>;

/**
 * SlotStyle — spec §3.2. `single` and `feed` are the bread-and-butter
 * one-item and infinite-list cases; `grid` and `carousel` are the
 * multi-item bounded cases that require `cols` (and `rows`, for grid).
 */
export const slotStyleSchema = z.enum(["single", "feed", "grid", "carousel"]);
export type SlotStyle = z.infer<typeof slotStyleSchema>;

/**
 * Recursive type definitions need a `z.lazy` boundary because the
 * `ui` node's `children` array references `LayoutNode` (= `UiNode |
 * SlotNode`). Zod requires us to declare the recursive type up-front
 * so we can lazy-wire the recursive reference.
 */
export type SlotNode = {
  /** Discriminator. Always `'slot'`. */
  type: "slot";
  /**
   * Stable cross-breakpoint slot name. The validator enforces that the
   * same `name` appears at most once per tree and is shared across
   * trees so resolved props are wirable by name.
   */
  name: string;
  /** Closed SlotKind enum (`content | video | linkout`). */
  kind: SlotKind;
  /** Visual style — single / feed / grid / carousel. Defaults to `feed`. */
  style?: SlotStyle;
  /**
   * Number of columns for `grid` / `carousel`. Required when
   * `style === 'grid'` or `style === 'carousel'`; ignored otherwise.
   */
  cols?: number;
  /**
   * Number of rows for `grid`. Required when `style === 'grid'`;
   * ignored otherwise.
   */
  rows?: number;
  /** Pin the slot to the top of the viewport while content scrolls past. */
  sticky?: boolean;
  /**
   * Optional density hint. `'compact'` renders smaller cards/cells
   * (half-height linkouts; v1 for video). `'default'` or omitted =
   * full-size. Effective on `linkout` (v0) and `video` (v1) slots
   * only — has no effect on `content` slots (validator emits a
   * `DENSITY_NO_EFFECT` warning if set on `content`).
   */
  density?: "compact" | "default";
  /**
   * Optional semantic height hint. Maps to a closed max-height (or
   * `height`, for video) scale in the renderer:
   *   `xs` ≤180px, `compact` ≤300px, `sm` ≤420px, `default` ≤500px,
   *   `lg` ≤600px, `hero` ≤700px, `screen` 100vh.
   * Effective on `video` and `linkout` slots; `content` slots ignore
   * it (markdown bodies size themselves). When {@link aspect} is also
   * set on a `video` slot, the aspect drives the slot's geometry and
   * `size` becomes a max-height cap on top.
   * Production hosts can read this and pass to SDK init configs.
   */
  size?: "xs" | "compact" | "sm" | "default" | "lg" | "hero" | "screen";
  /**
   * Optional aspect-ratio decorator. Closed enum. Maps to an inline
   * `aspectRatio` style on the slot's outer wrapper:
   *   `reel` 9/16, `square` 1/1, `video` 16/9, `portrait` 3/4,
   *   `landscape` 4/3, `banner` 21/9.
   * Effective on `video` and `linkout` slots; ignored on `content`
   * (validator emits `ASPECT_NO_EFFECT`). For `video` slots, `aspect`
   * overrides `size` for geometric height — `size` becomes a max cap.
   */
  aspect?: "reel" | "square" | "video" | "portrait" | "landscape" | "banner";
  /**
   * Optional minimum-height decorator. Closed enum. Prevents the slot
   * wrapper from collapsing when the SDK/data is still loading or the
   * resolved props are empty. Effective on all slot kinds.
   * Maps to inline `minHeight`: `none` 0, `sm` 180px, `md` 300px,
   * `lg` 420px, `hero` 600px.
   */
  minHeight?: "none" | "sm" | "md" | "lg" | "hero";
  /**
   * Authored Slot props. Host-supplied `resolveSlotProps` turns these
   * into renderer-ready props before the Slot renderer runs.
   */
  props?: Record<string, unknown>;
};

export type UiNode = {
  /** Discriminator. Always `'ui'`. */
  type: "ui";
  /**
   * Variant key — looked up in the `UiRenderer` registry. Must be one
   * of the 20 emittable primitives at v0; composite keys are
   * host-extensible.
   */
  uiVariant: string;
  /** Props forwarded to the resolved component. Opaque to the walker. */
  props?: Record<string, unknown>;
  /** Recursive children. Each is itself a `UiNode` or `SlotNode`. */
  children?: LayoutNode[];
};

export type LayoutNode = UiNode | SlotNode;

/**
 * Mutually-recursive schema. Zod's `z.lazy` defers evaluation until
 * the runtime walks the schema, which is what lets us put `uiNode`
 * and `slotNode` in a union for `layoutNode`. The explicit
 * `ZodType<…>` annotations break the otherwise-circular type
 * inference.
 *
 * Using a plain `z.union` (rather than `z.discriminatedUnion`) keeps
 * the type plumbing simple — both variants still carry a `type`
 * literal, so authoring errors still surface clearly.
 */
export const slotNodeSchema: z.ZodType<SlotNode> = z.object({
  type: z.literal("slot"),
  name: z.string().min(1),
  kind: slotKindSchema,
  style: slotStyleSchema.optional(),
  cols: z.number().int().positive().optional(),
  rows: z.number().int().positive().optional(),
  sticky: z.boolean().optional(),
  /**
   * Optional density hint. `'compact'` shrinks the rendered card/cell;
   * omitted ≡ `'default'`. Effective on `linkout` (v0) and `video`
   * (v1); ignored on `content` (validator emits a warning).
   */
  density: z.enum(["compact", "default"]).optional(),
  /**
   * Optional semantic height hint. Maps to a closed max-height scale
   * in the renderer (see {@link SlotNode.size}). Effective on `video`
   * and `linkout` slots; `content` slots ignore it.
   */
  size: z.enum(["xs", "compact", "sm", "default", "lg", "hero", "screen"]).optional(),
  /**
   * Optional aspect-ratio decorator. Effective on `video` and `linkout`
   * slots; ignored on `content` (validator emits `ASPECT_NO_EFFECT`).
   */
  aspect: z.enum(["reel", "square", "video", "portrait", "landscape", "banner"]).optional(),
  /**
   * Optional minimum-height decorator. Closed enum that maps to an
   * inline `minHeight` value on the slot's outer wrapper. Effective on
   * all slot kinds.
   */
  minHeight: z.enum(["none", "sm", "md", "lg", "hero"]).optional(),
  props: z.record(z.unknown()).optional(),
});

export const uiNodeSchema: z.ZodType<UiNode> = z.lazy(() =>
  z.object({
    type: z.literal("ui"),
    uiVariant: z.string().min(1),
    props: z.record(z.unknown()).optional(),
    children: z.array(layoutNodeSchema).optional(),
  }),
);

export const layoutNodeSchema: z.ZodType<LayoutNode> = z.lazy(() =>
  z.union([uiNodeSchema, slotNodeSchema]),
);

/**
 * LayoutTree — one rendering per breakpoint. Spec §2.2.
 */
export const layoutTreeSchema = z.object({
  /** Stable per-tree id. Used by the walker's atomic-swap key. */
  id: z.string().min(1),
  /** Mobile-first `minWidth` boundary. The smallest entry should be `0`. */
  minWidth: z.number().int().nonnegative(),
  /** Root layout node. Spec requires this to be a `ui` node. */
  root: layoutNodeSchema,
});

export type LayoutTree = z.infer<typeof layoutTreeSchema>;

/**
 * Page — top-level artifact. Spec §2.1.
 */
export const pageSchema = z.object({
  /** Stable page id. Used for tracing and the host's `data-page-id`. */
  id: z.string().min(1),
  /** Optional artifact-format version, e.g. `'2025.05'`. */
  version: z.string().optional(),
  /**
   * One `LayoutTree` per breakpoint, sorted ascending by `minWidth`.
   * The validator enforces that the smallest is `minWidth: 0`.
   */
  breakpoints: z.array(layoutTreeSchema).min(1),
});

export type Page = z.infer<typeof pageSchema>;
