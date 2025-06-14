import type { Meta, StoryObj } from "@storybook/react";
import { LinkOutContentRenderer } from "./linkouts-details";
import { LinkoutsType } from "@genuin/components/react-query/api/linkouts/schema";

const meta: Meta<typeof LinkOutContentRenderer> = {
  title: "Organisms/LinkOut",
  component: LinkOutContentRenderer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LinkOutContentRenderer>;

const mockSingleLink: LinkoutsType = [
  {
    links: [
      {
        link: "https://example.com",
        title: "Example Website",
        image: "https://picsum.photos/200",
        position: 0,
      },
    ],
    cta_text: "Visit Website",
    cta_link: "https://example.com",
  },
];

const mockMultiLinks: LinkoutsType = [
  {
    links: [
      {
        link: "https://example1.com",
        title: "Example 1",
        image: "https://picsum.photos/200",
        position: 0,
      },
      {
        link: "https://example2.com",
        title: "Example 2",
        image: "https://picsum.photos/201",
        position: 1,
      },
      {
        link: "https://example3.com",
        title: "Example 3",
        image: "https://picsum.photos/202",
        position: 2,
      },
      {
        link: "https://example4.com",
        title: "Example 4",
        image: "https://picsum.photos/203",
        position: 3,
      },
    ],
  },
];

const mockSingleLinkWithoutImage: LinkoutsType = [
  {
    links: [
      {
        link: "https://example.com",
        title: "Example Website Without Image",
        position: 0,
      },
    ],
  },
];

export const SingleLinkWithCTA: Story = {
  args: {
    linkouts: mockSingleLink,
    linkoutId: 1,
    isActive: true,
  },
};

export const MultipleLinks: Story = {
  args: {
    linkouts: mockMultiLinks,
    linkoutId: 1,
    isActive: true,
  },
};

export const SingleLinkWithoutImage: Story = {
  args: {
    linkouts: mockSingleLinkWithoutImage,
    linkoutId: 123,
  },
};

export const Loading: Story = {
  args: {
    linkouts: [],
    linkoutId: 123,
  },
};

export const Empty: Story = {
  args: {
    linkouts: [],
    linkoutId: null,
  },
};
