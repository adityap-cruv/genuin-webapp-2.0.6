import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Link } from "./link";

const meta: Meta<typeof Link> = {
  title: "Static Page Atoms/Link",
  component: Link,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["default", "subtle", "inverted"],
    },
    weight: {
      control: "select",
      options: ["medium", "semibold", "bold"],
    },
    underline: {
      control: "select",
      options: ["always", "hover", "none"],
    },
    external: { control: "boolean" },
    asChild: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    href: "https://genuin.io",
    children: "Visit Genuin",
  },
};

export const AllTones: Story = {
  render: () => (
    <div className="gencl:flex gencl:flex-col gencl:gap-3">
      <Link href="https://genuin.io" tone="default">
        Default tone — brand action colour
      </Link>
      <Link href="https://genuin.io" tone="subtle">
        Subtle tone — muted gray
      </Link>
      <div className="gencl:bg-secondary-900 gencl:p-3 gencl:rounded">
        <Link href="https://genuin.io" tone="inverted">
          Inverted tone — for dark backgrounds
        </Link>
      </div>
    </div>
  ),
};

export const AllWeights: Story = {
  render: () => (
    <div className="gencl:flex gencl:flex-col gencl:gap-3">
      <Link href="#" weight="medium">
        Medium weight
      </Link>
      <Link href="#" weight="semibold">
        Semibold weight
      </Link>
      <Link href="#" weight="bold">
        Bold weight
      </Link>
    </div>
  ),
};

export const AllUnderlines: Story = {
  render: () => (
    <div className="gencl:flex gencl:flex-col gencl:gap-3">
      <Link href="#" underline="always">
        Always underlined
      </Link>
      <Link href="#" underline="hover">
        Underlined on hover (default)
      </Link>
      <Link href="#" underline="none">
        Never underlined
      </Link>
    </div>
  ),
};

export const ExternalLink: Story = {
  args: {
    href: "https://genuin.io",
    external: true,
    children: "Read the docs",
  },
};

/**
 * Demonstrates `asChild` composition with a fake `NextLink` component.
 * Stories don't have Next routing, so we wrap a plain `<a>` to simulate
 * the call-site pattern.
 */
const FakeNextLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }
>(function FakeNextLink({ children, ...props }, ref) {
  return (
    <a ref={ref} {...props}>
      {children}
    </a>
  );
});

export const AsChildNextLink: Story = {
  render: () => (
    <Link asChild>
      <FakeNextLink href="/somewhere">Wrap a NextLink with asChild for client-side routing</FakeNextLink>
    </Link>
  ),
};
