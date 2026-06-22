/**
 * @fileoverview LinkCard render-branch catalogue.
 *
 * Renders `<LinkCard>` directly (not through `<DynamicLinkouts>`) one
 * story per render branch — every `sheetState` plus the new `pl-xs`
 * and `pl-sml` chips. Source content is the full TOEFL / ETS Figma
 * fixture so every field (description, prices, rating, likes,
 * downloads, phone, address) materialises in the states that consume
 * them.
 *
 * The dynamic-linkout-* story files exercise the component end-to-end
 * with the sheet harness (drag, autoplay, sheet states); this file is
 * a flat catalogue useful for visual review of the card layouts in
 * isolation.
 */

import type { Meta, StoryObj } from "@storybook/react";

import { LinkCard } from "@genuin/components/molecules/linkout-new/link-card";

import { LINKOUT_FIGMA_FULL } from "../../organisms/linkouts/linkouts.fixtures";

// Strip the LinkData-only fields (`position`) and add the LinkMetaData
// extras the LinkoutItem adapter would normally compute. Keeping it
// inline so the catalogue is self-contained.
const RICH_DATA = {
  link: LINKOUT_FIGMA_FULL.link,
  title: LINKOUT_FIGMA_FULL.title,
  image: LINKOUT_FIGMA_FULL.image,
  description: LINKOUT_FIGMA_FULL.description,
  brand: LINKOUT_FIGMA_FULL.brand,
  website: LINKOUT_FIGMA_FULL.website,
  originalPrice: LINKOUT_FIGMA_FULL.originalPrice,
  currentPrice: LINKOUT_FIGMA_FULL.currentPrice,
  rating: LINKOUT_FIGMA_FULL.rating,
  likes: LINKOUT_FIGMA_FULL.likes,
  downloads: LINKOUT_FIGMA_FULL.downloads,
  phone: LINKOUT_FIGMA_FULL.phone,
  address: LINKOUT_FIGMA_FULL.address,
};

// Width matches the smallest embed-180 case so the chip's `w-full`
// behaviour is visible (not boxed at 246 px).
function HostFrame({
  children,
  height = 360,
  background = "#1d1f20",
}: {
  children: React.ReactNode;
  height?: number;
  background?: string;
}) {
  return (
    <div
      style={{
        width: 320,
        height,
        background,
        padding: 8,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}>
      {children}
    </div>
  );
}

const meta: Meta<typeof LinkCard> = {
  title: "Molecules/LinkCard",
  component: LinkCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
\`<LinkCard>\` is the leaf renderer used by every linkout state. Each
story below sets a different \`sheetState\` so reviewers can compare the
seven render branches in one place.

The two new chip states (\`pl-xs\` and \`pl-sml\`) fill the host
container's width minus the 8 px insets — they are **not** fixed at
246 px. The host frame here is 320 × 360 to match the Figma reference's
smallest embed-180 case.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LinkCard>;

// ─── Chip states ─────────────────────────────────────────────────────────────

export const PlacementXS: Story = {
  name: "Placement XS",
  render: () => (
    <HostFrame height={120}>
      <LinkCard data={RICH_DATA} sheetState="pl-xs" theme="dark" />
    </HostFrame>
  ),
};

export const PlacementSML: Story = {
  name: "Placement SML",
  render: () => (
    <HostFrame height={120}>
      <LinkCard data={RICH_DATA} sheetState="pl-sml" theme="dark" />
    </HostFrame>
  ),
};

export const PlacementSMLLightTheme: Story = {
  name: "Placement SML (light theme)",
  render: () => (
    <HostFrame height={120} background="#f4f5f6">
      <LinkCard data={RICH_DATA} sheetState="pl-sml" theme="light" />
    </HostFrame>
  ),
};

// ─── Sheet states ─────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "Default",
  render: () => (
    <HostFrame height={120}>
      <LinkCard data={RICH_DATA} sheetState="default" theme="dark" />
    </HostFrame>
  ),
};

export const DefaultActive: Story = {
  name: "Default Active",
  render: () => (
    <HostFrame height={200}>
      <LinkCard data={RICH_DATA} sheetState="default-active" theme="dark" />
    </HostFrame>
  ),
};

export const ExpandView: Story = {
  name: "Expand View",
  render: () => (
    <HostFrame height={260}>
      <LinkCard data={RICH_DATA} sheetState="expand-view" theme="dark" />
    </HostFrame>
  ),
};

export const PanelView: Story = {
  name: "Panel View",
  render: () => (
    <HostFrame height={560} background="#f4f5f6">
      <LinkCard data={RICH_DATA} sheetState="panel-view" theme="light" />
    </HostFrame>
  ),
};

export const FullView: Story = {
  name: "Full View",
  render: () => (
    <HostFrame height={780} background="#f4f5f6">
      <LinkCard data={RICH_DATA} sheetState="full-view" theme="light" />
    </HostFrame>
  ),
};
