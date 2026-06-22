import { AccentBorder } from "@genuin/ui/accent-border";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@genuin/ui/accordion";
import { Avatar } from "@genuin/ui/avatar";
import { Button } from "@genuin/ui/button";
import { Chip } from "@genuin/ui/chip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@genuin/ui/collapsible";
import { DecorativeList } from "@genuin/ui/decorative-list";
import { Divider } from "@genuin/ui/divider";
import { Icon } from "@genuin/ui/icon";
import { Image } from "@genuin/ui/image";
import { Cluster, Column, Container, Grid, Row, SplitView, Stack } from "@genuin/ui/layout";
import { Link } from "@genuin/ui/link";
import { MetaList } from "@genuin/ui/meta-list";
import { Surface } from "@genuin/ui/surface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@genuin/ui/tabs";
import { Heading, Text } from "@genuin/ui/typography";
import * as React from "react";

import type { UiRenderer, UiRenderers } from "./types";

/**
 * Default UI renderer registry.
 *
 * Maps the 23 canonical `uiVariant` strings (spec §4.3, locked in
 * {@link HIERARCHICAL_LAYOUT_SKILL_PLAN.md}) to their `@genuin/ui`
 * implementations. Each entry is a tiny adapter that takes the
 * walker's `{ props, children }` envelope and forwards both to the
 * underlying component.
 *
 * - **Layout (7)**: row, column, stack, grid, container, cluster, split-view
 * - **Static-page atoms (13)**: button, avatar, chip, image, decorative-list,
 *   meta-list, heading, text, divider, link, icon, accent-border, surface
 * - **Authored-structure interactive (3)**: accordion, tabs, collapsible
 *
 * Composites (`page-header`, `meta-panel`, `linkout-stack`, …) are
 * host-extensible — pass them via `uiRenderers` on `PageRenderer`.
 *
 * The barrel imports from `@genuin/ui/components` (which re-exports
 * the layout / typography / icon / link / divider primitives) plus
 * the existing subpath exports for the rest.
 */

/**
 * Generic single-component adapter. Forwards `props` and `children`
 * verbatim. The double-cast (`as unknown as P`) acknowledges that
 * `props` is opaque to the walker — the schema validator is the gate
 * that authored props match the underlying primitive's prop surface.
 */
function makeAdapter<P>(
  Component: React.ComponentType<P>,
): UiRenderer {
  return function Adapter({ props, children }) {
    const componentProps = props as unknown as P & { children?: React.ReactNode };
    return <Component {...componentProps}>{children}</Component>;
  };
}

// ---------- Layout primitives (7) ----------

const RowRenderer = makeAdapter(Row);
const ColumnRenderer = makeAdapter(Column);
const StackRenderer = makeAdapter(Stack);
const ContainerRenderer = makeAdapter(Container);
const ClusterRenderer = makeAdapter(Cluster);
const SplitViewRenderer = makeAdapter(SplitView);

/**
 * `grid` accepts the same shape as a generic component — `cols` /
 * `rows` polymorphism is enforced inside the Grid primitive itself,
 * so a passthrough adapter is fine.
 */
const GridRenderer = makeAdapter(Grid);

// ---------- Typography primitives (2) ----------

/**
 * Pull a string text payload from either authored `props.text` or the
 * walker's recursive `children` — typography primitives accept a
 * string label as the most common case, but the walker can also wrap
 * children when they're real React elements (e.g. an inline
 * `<strong>` from markdown).
 *
 * The convention: prefer `props.text` (an authored string) over
 * `children`. This matches the AI generator's likely emission: heading
 * and text nodes carry their label as a `text` prop, not as a child
 * subtree.
 */
function pickTextPayload(
  props: Record<string, unknown>,
  children: React.ReactNode,
): React.ReactNode {
  if (typeof props.text === "string") return props.text;
  // Fall back to walker children — empty array means "no payload",
  // returning null lets the underlying primitive's required-children
  // check fire (or render nothing if optional).
  if (children !== undefined && children !== null) {
    if (Array.isArray(children) && children.length === 0) return null;
    return children;
  }
  return null;
}

/**
 * `heading` requires non-empty children — Heading throws if you hand
 * it `undefined`. The adapter prefers a `text` prop (the common AI-
 * generator emission) over recursive children.
 */
const HeadingRenderer: UiRenderer = function HeadingAdapter({ props, children }) {
  const { text: _text, ...rest } = props;
  const payload = pickTextPayload(props, children) ?? "";
  const headingProps = rest as unknown as Omit<React.ComponentProps<typeof Heading>, "children">;
  return <Heading {...headingProps}>{payload}</Heading>;
};

const TextRenderer: UiRenderer = function TextAdapter({ props, children }) {
  const { text: _text, ...rest } = props;
  const payload = pickTextPayload(props, children) ?? "";
  const textProps = rest as unknown as Omit<React.ComponentProps<typeof Text>, "children">;
  return <Text {...textProps}>{payload}</Text>;
};

// ---------- Static-page atoms (8 remaining) ----------

/**
 * `button` accepts either authored children (a recursive `text` /
 * `icon` subtree) or a `text` prop label. Mirrors the heading
 * convention.
 */
const ButtonRenderer: UiRenderer = function ButtonAdapter({ props, children }) {
  const { text: _text, ...rest } = props;
  const payload = pickTextPayload(props, children) ?? "";
  const buttonProps = rest as unknown as React.ComponentProps<typeof Button>;
  return <Button {...buttonProps}>{payload}</Button>;
};

/** `chip` follows the same string-or-subtree convention as `text`. */
const ChipRenderer: UiRenderer = function ChipAdapter({ props, children }) {
  const { text: _text, ...rest } = props;
  const payload = pickTextPayload(props, children) ?? "";
  const chipProps = rest as unknown as Omit<React.ComponentProps<typeof Chip>, "children">;
  return <Chip {...chipProps}>{payload}</Chip>;
};

const DividerRenderer = makeAdapter(Divider);

const LinkRenderer: UiRenderer = function LinkAdapter({ props, children }) {
  const linkProps = props as unknown as Omit<React.ComponentProps<typeof Link>, "children">;
  return <Link {...linkProps}>{children}</Link>;
};

/**
 * `avatar` has a closed prop surface (no children); the adapter ignores
 * `children` rather than wedging them into an `<img>`.
 */
const AvatarRenderer: UiRenderer = function AvatarAdapter({ props }) {
  const avatarProps = props as unknown as React.ComponentProps<typeof Avatar>;
  return <Avatar {...avatarProps} />;
};

/**
 * `image` is a leaf — like `avatar`, it has no children. The walker
 * supplies an empty children array for leaves so this adapter just
 * spreads props.
 */
const ImageRenderer: UiRenderer = function ImageAdapter({ props }) {
  const imageProps = props as unknown as React.ComponentProps<typeof Image>;
  return <Image {...imageProps} />;
};

/**
 * `icon` requires `aria-label` — the spec validator catches missing
 * labels; the adapter trusts upstream validation.
 */
const IconRenderer: UiRenderer = function IconAdapter({ props }) {
  const iconProps = props as unknown as React.ComponentProps<typeof Icon>;
  return <Icon {...iconProps} />;
};

const DecorativeListRenderer: UiRenderer = function DecorativeListAdapter({ props, children }) {
  const listProps = props as unknown as Omit<React.ComponentProps<typeof DecorativeList>, "children">;
  return <DecorativeList {...listProps}>{children}</DecorativeList>;
};

/**
 * `meta-list` is a closed prop-only primitive — no walker children.
 * The agent emits an `items: { label, value }[]` array and an optional
 * `leader` style on `props`; the adapter forwards them verbatim.
 */
const MetaListRenderer: UiRenderer = function MetaListAdapter({ props }) {
  const metaListProps = props as unknown as React.ComponentProps<typeof MetaList>;
  return <MetaList {...metaListProps} />;
};

/**
 * `accent-border` is a container primitive — wraps walker children
 * with a single brand-colored edge line. Distinct from
 * `heading.decoration='ribbon'` (heading-internal strap) — this is
 * the block-level variant for sponsored-content cards and similar
 * wrap-with-an-accent patterns.
 */
const AccentBorderRenderer: UiRenderer = function AccentBorderAdapter({ props, children }) {
  const accentBorderProps = props as unknown as Omit<
    React.ComponentProps<typeof AccentBorder>,
    "children"
  >;
  return <AccentBorder {...accentBorderProps}>{children}</AccentBorder>;
};

/**
 * `surface` is a container primitive — wraps walker children with a
 * tinted background, rounded corners, and internal padding. Parallels
 * `accent-border` (which paints a side line); the two compose for
 * blocks needing both fill and edge decoration.
 */
const SurfaceRenderer: UiRenderer = function SurfaceAdapter({ props, children }) {
  const surfaceProps = props as unknown as Omit<
    React.ComponentProps<typeof Surface>,
    "children"
  >;
  return <Surface {...surfaceProps}>{children}</Surface>;
};

// ---------- Authored-structure interactive (3) ----------

/**
 * `accordion` is a composite with `items: { id, trigger, content }[]`
 * authored in `props`. The adapter expands them into the
 * `Accordion → AccordionItem → AccordionTrigger / AccordionContent`
 * Radix surface.
 *
 * The walker's recursive `children` slot isn't used here — accordion
 * items are authored as a flat `items` array because nesting a
 * trigger/content pair as two adjacent UI nodes is awkward in the
 * Page artifact. This is the only place the v0 walker peeks inside
 * `props`.
 */
interface AccordionItemConfig {
  id: string;
  trigger: string;
  content: string;
}
interface AccordionRendererProps {
  items?: AccordionItemConfig[];
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
}
const AccordionRenderer: UiRenderer = function AccordionAdapter({ props }) {
  const config = (props as AccordionRendererProps) ?? {};
  const items = config.items ?? [];
  // Radix's Accordion requires a `type` prop to distinguish single vs
  // multi-select. Default to single for the most common case.
  return (
    <Accordion
      type={config.type ?? "single"}
      collapsible={config.collapsible ?? true}
      defaultValue={config.defaultValue as never}>
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger>{item.trigger}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

/**
 * `tabs` is the same shape as accordion — authored as `items` with
 * `id / label / content`. The walker doesn't expose nested children
 * because the trigger/panel pairing is awkward to express positionally.
 */
interface TabItemConfig {
  id: string;
  label: string;
  content: string;
}
interface TabsRendererProps {
  items?: TabItemConfig[];
  defaultValue?: string;
}
const TabsRenderer: UiRenderer = function TabsAdapter({ props }) {
  const { items = [], defaultValue } = (props as TabsRendererProps) ?? {};
  const firstId = items[0]?.id;
  return (
    <Tabs defaultValue={defaultValue ?? firstId}>
      <TabsList>
        {items.map((item) => (
          <TabsTrigger key={item.id} value={item.id}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.id} value={item.id}>
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

/**
 * `collapsible` takes a `trigger` string and renders the walker
 * children as the collapsible body.
 */
interface CollapsibleRendererProps {
  trigger?: string;
  defaultOpen?: boolean;
}
const CollapsibleRenderer: UiRenderer = function CollapsibleAdapter({ props, children }) {
  const { trigger, defaultOpen } = (props as CollapsibleRendererProps) ?? {};
  return (
    <Collapsible defaultOpen={defaultOpen}>
      {trigger !== undefined ? <CollapsibleTrigger>{trigger}</CollapsibleTrigger> : null}
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
};

/**
 * The default registry. Hosts can spread on top to register
 * composites: `{ ...defaultUiRenderers, 'page-header': PageHeader }`.
 */
export const defaultUiRenderers: UiRenderers = {
  // Layout
  row: RowRenderer,
  column: ColumnRenderer,
  stack: StackRenderer,
  grid: GridRenderer,
  container: ContainerRenderer,
  cluster: ClusterRenderer,
  "split-view": SplitViewRenderer,
  // Typography
  heading: HeadingRenderer,
  text: TextRenderer,
  // Static-page atoms
  button: ButtonRenderer,
  avatar: AvatarRenderer,
  chip: ChipRenderer,
  image: ImageRenderer,
  "decorative-list": DecorativeListRenderer,
  "meta-list": MetaListRenderer,
  divider: DividerRenderer,
  link: LinkRenderer,
  icon: IconRenderer,
  "accent-border": AccentBorderRenderer,
  surface: SurfaceRenderer,
  // Authored-structure interactive
  accordion: AccordionRenderer,
  tabs: TabsRenderer,
  collapsible: CollapsibleRenderer,
};

/**
 * The closed v0 set of `uiVariant` strings the default registry
 * resolves. Exported for the validator and dev tooling.
 */
export const DEFAULT_UI_VARIANTS = Object.keys(defaultUiRenderers) as readonly string[];
