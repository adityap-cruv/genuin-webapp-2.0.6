import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";

import { EventCarousel } from "./event-carousel";
import type { EventCarouselItem } from "./event-carousel.types";

const BASE_EVENT: EventCarouselItem = {
  id: "germany-sail-gp-2026",
  heading: "Rockwool Germany Sail Grand Prix | Sassnitz",
  image: {
    src: "https://thefoil.com/media/xjPn5tb1VybfsEuZ4Y9J9RiSHePy3sFR2qDTv3tu7Ic/resize:fill-down:336:258/gravity:ce/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-1-1.png",
  },
  start_date: "2026-08-22",
  end_date: "2026-08-23",
  location: "Sassnitz, Rügen Island, Germany",
  cta: {
    label: "Read More",
    href: "/events/germany-sail-grand-prix-2026",
  },
};

const REPEATED_EVENTS = Array.from(
  { length: 6 },
  (_, index): EventCarouselItem => ({
    ...BASE_EVENT,
    id: `${BASE_EVENT.id}-${index + 1}`,
  })
);

const meta = {
  title: "Organisms/EventCarousel",
  component: EventCarousel,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", padding: "12px 0", background: "white" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    events: REPEATED_EVENTS,
    cardWidth: 332,
    cardHeight: 120,
    imageWidth: 76,
    imageHeight: 76,
    gap: 8,
    ariaLabel: "Upcoming Sail Grand Prix events",
    onCtaClick: fn(),
  },
  argTypes: {
    events: { control: "object" },
    cardWidth: { control: { type: "number", min: 280, max: 640, step: 1 } },
    cardHeight: { control: { type: "number", min: 100, max: 300, step: 1 } },
    imageWidth: { control: { type: "number", min: 60, max: 180, step: 1 } },
    imageHeight: { control: { type: "number", min: 60, max: 180, step: 1 } },
    gap: { control: { type: "number", min: 0, max: 40, step: 1 } },
  },
} satisfies Meta<typeof EventCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RepeatedCards: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cards = canvasElement.querySelectorAll('[data-slot="event-card"]');
    const track = canvasElement.querySelector<HTMLElement>('[data-slot="event-carousel-track"]');
    const firstCard = cards[0] as HTMLElement;
    const heading = within(firstCard).getByText(BASE_EVENT.heading);
    const image = firstCard.querySelector<HTMLImageElement>("img")!;
    const subheading = within(firstCard).getByText("22 – 23 Aug 2026 | Sassnitz, Rügen Island, Germany");
    const cta = within(firstCard).getByRole("link", { name: "Read More" });
    const ctaText = within(cta).getByText("Read More");
    const ctaIcon = cta.querySelector<SVGElement>("svg")!;

    await expect(cards).toHaveLength(6);
    await expect(track).not.toBeNull();
    await expect(getComputedStyle(track!).overflowX).toBe("auto");
    await expect(canvas.getAllByRole("link", { name: "Read More" })).toHaveLength(6);
    await expect(canvas.getAllByText("22 – 23 Aug 2026 | Sassnitz, Rügen Island, Germany")).toHaveLength(6);
    await expect(firstCard.getBoundingClientRect().width).toBe(332);
    await expect(firstCard.getBoundingClientRect().height).toBe(120);
    await expect(heading.getBoundingClientRect().width).toBe(316);
    await expect(heading.getBoundingClientRect().height).toBe(20);
    await expect(getComputedStyle(heading).fontSize).toBe("14px");
    await expect(getComputedStyle(heading).fontWeight).toBe("600");
    await expect(image.getBoundingClientRect().width).toBe(76);
    await expect(image.getBoundingClientRect().height).toBe(76);
    await expect(subheading.getBoundingClientRect().width).toBe(232);
    await expect(subheading.getBoundingClientRect().height).toBe(28);
    await expect(getComputedStyle(subheading).fontSize).toBe("10px");
    await expect(getComputedStyle(subheading).fontWeight).toBe("500");
    await expect(cta.getBoundingClientRect().width).toBe(232);
    await expect(cta.getBoundingClientRect().height).toBe(40);
    await expect(ctaText.getBoundingClientRect().width).toBe(180);
    await expect(ctaText.getBoundingClientRect().height).toBe(20);
    await expect(getComputedStyle(ctaText).fontWeight).toBe("600");
    await expect(ctaIcon.getBoundingClientRect().width).toBe(24);
    await expect(ctaIcon.getBoundingClientRect().height).toBe(24);
  },
};

export const Empty: Story = {
  args: {
    events: [],
  },
};
