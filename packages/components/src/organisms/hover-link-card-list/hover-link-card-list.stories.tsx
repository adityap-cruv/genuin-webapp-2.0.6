import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { setDeviceMode } from "../../../.storybook/preview";

import { HoverLinkCardList, type HoverLinkCardListProps } from "./hover-link-card-list";

const PODCAST_IMAGE =
  "https://thefoil.com/media/xjPn5tb1VybfsEuZ4Y9J9RiSHePy3sFR2qDTv3tu7Ic/resize:fill-down:336:258/gravity:ce/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-1-1.png";

type HoverLinkCardItem = HoverLinkCardListProps["items"][number];

const PODCASTS: HoverLinkCardItem[] = [
  {
    link: "/podcasts/sailgp-vs-americas-cup",
    title: "Podcast: SailGP vs America's Cup: Can they coexist?",
    image: PODCAST_IMAGE,
    description:
      "Click here to listen on Spotify and other platforms. Sailing has never been healthier – and on this week's pod, that's exactly the problem.",
  },
  {
    link: "/podcasts/can-anyone-beat-new-zealand",
    title: "Podcast: Can anyone beat New Zealand?",
    image: PODCAST_IMAGE,
    description: "The teams, tactics and technology shaping the next America's Cup campaign.",
  },
  {
    link: "/podcasts/americas-cup-is-back",
    title: "Podcast: America's Cup is back! The new era begins",
    image: PODCAST_IMAGE,
    description: "A closer look at the contenders and the changes coming to the competition.",
  },
  {
    link: "/podcasts/jet-fighters-dance",
    title: "'Like watching jet fighters dance on water'",
    image: PODCAST_IMAGE,
    description: "Why modern foiling boats have transformed sailing into a high-speed spectacle.",
  },
  {
    link: "/podcasts/sailgp-season-preview",
    title: "Podcast: SailGP season preview and teams to watch",
    image: PODCAST_IMAGE,
    description: "The leading teams, venues and storylines to follow throughout the new SailGP season.",
  },
  {
    link: "/podcasts/future-of-foiling",
    title: "Podcast: The future of foiling and high-speed sailing",
    image: PODCAST_IMAGE,
    description: "How new designs and technology will shape the next generation of international sailing.",
  },
];

const meta = {
  title: "Organisms/HoverLinkCardList",
  component: HoverLinkCardList,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    deviceMode: "desktop",
  },
  decorators: [
    (Story, context) => {
      setDeviceMode(context.parameters.deviceMode === "mobile" ? "mobile" : "desktop");
      return <Story />;
    },
  ],
  args: {
    items: PODCASTS,
    width: 332,
    height: 387,
    gap: 8,
    ctaText: "Read More",
    initialExpandedIndex: 0,
    autoRotate: true,
    pauseOnHover: true,
    rotationIntervalMs: 3000,
    animationDurationMs: 500,
    ariaLabel: "Sailing podcasts",
    onLinkClick: fn(),
  },
  argTypes: {
    autoRotate: { control: "boolean" },
    pauseOnHover: { control: "boolean" },
    rotationIntervalMs: { control: { type: "number", min: 500, step: 100 } },
    animationDurationMs: { control: { type: "number", min: 0, step: 50 } },
  },
} satisfies Meta<typeof HoverLinkCardList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector<HTMLElement>('section[aria-label="Sailing podcasts"]');
    const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="hover-link-card-item"]');

    await expect(list).not.toBeNull();
    await expect(list!.getBoundingClientRect().width).toBe(332);
    await expect(list!.getBoundingClientRect().height).toBe(387);
    await expect(items).toHaveLength(6);
    await expect(items[0]).toHaveAttribute("data-expanded", "true");
    await expect(canvasElement.querySelectorAll('[data-expanded="true"]')).toHaveLength(1);
    await expect(within(canvasElement).getByText(PODCASTS[0].description!)).toBeInTheDocument();

    const expandedTitle = within(items[0]).getByText(PODCASTS[0].title!);
    const expandedImage = items[0].querySelector<HTMLImageElement>("img")!;
    const expandedDescription = within(items[0]).getByText(PODCASTS[0].description!);
    const expandedCta = within(items[0]).getByRole("link", { name: "Read More" });
    const expandedCtaLabel = within(expandedCta).getByText("Read More");
    const expandedCtaIcon = expandedCta.querySelector<SVGElement>("svg")!;
    const compactTitle = within(items[1]).getByText(PODCASTS[1].title!);
    const compactImage = items[1].querySelector<HTMLImageElement>("img")!;

    await expect(getComputedStyle(expandedTitle).fontSize).toBe("14px");
    await expect(getComputedStyle(expandedTitle).fontWeight).toBe("600");
    await expect(getComputedStyle(expandedTitle).whiteSpace).toBe("normal");
    await expect(expandedImage.getBoundingClientRect().width).toBe(90);
    await expect(expandedImage.getBoundingClientRect().height).toBe(90);
    await expect(getComputedStyle(expandedDescription).fontSize).toBe("10px");
    await expect(getComputedStyle(expandedDescription).fontWeight).toBe("500");
    await expect(expandedCta.getBoundingClientRect().height).toBe(40);
    await expect(getComputedStyle(expandedCtaLabel).fontSize).toBe("14px");
    await expect(getComputedStyle(expandedCtaLabel).fontWeight).toBe("600");
    await expect(expandedCtaIcon.getBoundingClientRect().width).toBe(24);
    await expect(expandedCtaIcon.getBoundingClientRect().height).toBe(24);
    await expect(getComputedStyle(compactTitle).fontSize).toBe("14px");
    await expect(getComputedStyle(compactTitle).fontWeight).toBe("600");
    await expect(compactImage.getBoundingClientRect().width).toBe(64);
    await expect(compactImage.getBoundingClientRect().height).toBe(64);
  },
};

export const HoverToExpand: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="hover-link-card-item"]');

    await expect(items).toHaveLength(6);
    await expect(items[0]).toHaveAttribute("data-expanded", "true");
    await expect(canvas.getByText(PODCASTS[0].description!)).toBeInTheDocument();

    await userEvent.hover(items[1]);
    await expect(items[0]).toHaveAttribute("data-expanded", "false");
    await expect(items[1]).toHaveAttribute("data-expanded", "true");
    await expect(canvasElement.querySelectorAll('[data-expanded="true"]')).toHaveLength(1);
    await expect(canvas.getByText(PODCASTS[1].description!)).toBeInTheDocument();

    await userEvent.unhover(items[1]);
    await expect(items[0]).toHaveAttribute("data-expanded", "true");
    await expect(items[1]).toHaveAttribute("data-expanded", "false");
    await expect(canvasElement.querySelectorAll('[data-expanded="true"]')).toHaveLength(1);

    // Leave the visual story in its representative hovered state.
    await userEvent.hover(items[1]);
    await expect(items[1]).toHaveAttribute("data-expanded", "true");
  },
};

export const AutomaticClockRotation: Story = {
  args: {
    pauseOnHover: false,
    rotationIntervalMs: 3000,
    animationDurationMs: 500,
  },
};

export const MobileAllExpanded: Story = {
  args: {
    width: "100%",
    autoRotate: false,
  },
  parameters: {
    deviceMode: "mobile",
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="hover-link-card-item"]');

    await expect(items).toHaveLength(PODCASTS.length);
    await expect(canvasElement.querySelectorAll('[data-expanded="true"]')).toHaveLength(PODCASTS.length);

    const cardHeights = Array.from(items, (item) =>
      Math.round(within(item).getByRole("button").getBoundingClientRect().height)
    );
    await expect(new Set(cardHeights).size).toBe(1);

    PODCASTS.forEach((podcast, index) => {
      expect(within(items[index]!).getByText(podcast.description!)).toBeInTheDocument();
    });
  },
};
