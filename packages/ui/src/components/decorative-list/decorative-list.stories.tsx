import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { DecorativeList } from "./decorative-list";

// Mock Link component for Storybook
interface LinkProps {
  href: string;
  title?: string;
  children: React.ReactNode;
  className?: string; // Added className to allow styling if needed by stories
}
const Link = ({ href, title, children, className }: LinkProps) => (
  <a
    href={href}
    title={title}
    className={className}
    style={{ textDecoration: "none" }}
  >
    {children}
  </a>
);

// Mock data for demonstration
const loop = { name: "Sample Loop Group", slug: "sample-loop" };
const PATH_NAME = { loop: (slug: string) => `/loops/${slug}` };

const meta: Meta<typeof DecorativeList> = {
  title: "Components/DecorativeList",
  component: DecorativeList,
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text", // Or 'object' if more complex ReactNode is needed for control
      description:
        "The content of the list, expected to be <li> elements or components rendering them.",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the list.",
    },
    // Add any other relevant HTML `ul` attributes you want to expose in Storybook
    // For example:
    // id: { control: 'text', description: 'The id of the list element.' },
  },
  parameters: {
    // Optional: Add layout or other parameters if needed
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </>
    ),
    className: "my-custom-list-class",
  },
};

export const WithCustomStyledChildren: Story = {
  args: {
    children: (
      <>
        <div className="gencl:h-2 gencl:w-full" />
        <Link
          href={PATH_NAME.loop(loop.slug)}
          title={loop.name ?? "Genuin Loop"}
        >
          <li className="gencl:relative gencl:flex gencl:h-full gencl:w-full gencl:items-center gencl:justify-between gencl:rounded-md gencl:border gencl:border-tertiary-200 gencl:bg-monochrome-white gencl:p-4 ">
            <p className="gencl:line-clamp-2 gencl:w-full gencl:break-words gencl:pr-2 gencl:text-body-1-demi">
              {loop?.name}
            </p>
            <p className="gencl:whitespace-nowrap gencl:text-cap-1-med gencl:text-primary gencl:hover:text-primary-600">
              View Group
            </p>
          </li>
        </Link>
        <Link href={PATH_NAME.loop("another-loop")} title="Another Loop Group">
          <li className="gencl:relative gencl:mt-2 gencl:flex gencl:h-full gencl:w-full gencl:items-center gencl:justify-between gencl:rounded-md gencl:border gencl:border-tertiary-200 gencl:bg-monochrome-white gencl:p-4 ">
            <p className="gencl:line-clamp-2 gencl:w-full gencl:break-words gencl:pr-2 gencl:text-body-1-demi">
              Another Item in the List
            </p>
            <p className="gencl:whitespace-nowrap gencl:text-cap-1-med gencl:text-primary gencl:hover:text-primary-600">
              View Details
            </p>
          </li>
        </Link>
      </>
    ),
    className: "custom-decorative-list",
  },
  // You can rename the story if "WithCustomChildren" is preferred
  // name: "With Custom Children"
};

// Original story, now adapted to StoryObj format
export const OriginalWithCustomChildren: Story = {
  name: "Complex Example with Links",
  args: {
    children: (
      <>
        <div className="gencl:h-2 gencl:w-full" />
        <Link
          href={PATH_NAME.loop(loop.slug)}
          title={loop.name ?? "Genuin Loop"}
        >
          <li className="gencl:relative gencl:flex gencl:h-full gencl:w-full gencl:items-center gencl:justify-between gencl:rounded-md gencl:border gencl:border-tertiary-200 gencl:bg-monochrome-white gencl:p-4 ">
            <p className="gencl:line-clamp-2 gencl:w-full gencl:break-words gencl:pr-2 gencl:text-body-1-demi">
              {loop?.name}
            </p>
            <p className="gencl:whitespace-nowrap gencl:text-cap-1-med gencl:text-primary gencl:hover:text-primary-600">
              View Group
            </p>
          </li>
        </Link>
      </>
    ),
  },
};
