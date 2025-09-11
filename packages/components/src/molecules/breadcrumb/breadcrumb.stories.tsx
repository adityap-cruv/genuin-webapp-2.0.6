import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb, BreadcrumbProps } from "./breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "Molecules/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

const exampleItems: BreadcrumbProps["items"] = [
  { label: "Home", href: "/" },
  { label: "Library", href: "/library" },
  { label: "Data", href: "/library/data" },
  { label: "Current Page" },
];

export const Default: Story = {
  args: {
    items: exampleItems,
  },
};

export const SingleItem: Story = {
  args: {
    items: [{ label: "Only One Page" }],
  },
};

export const WithTwoLevels: Story = {
  args: {
    items: [{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }],
  },
};
