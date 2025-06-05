import { Button } from "@genuin/ui/button";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { GenericDetails } from "./generic-details";
import { GenericDetailsMetadata } from "./generic-details-metadata";

const meta: Meta<typeof GenericDetails> = {
  title: "Organisms/GenericDetails",
  component: GenericDetails,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    // Add argTypes here if the component has props
  },
};

export default meta;
type Story = StoryObj<typeof GenericDetails>;

// Default story
export const Default: Story = {
  args: {
    profileImageDetails: {
      alt: "Profile Image",
      imageUrl: "https://example.com/image.jpg",
      isAvatar: false,
    },
    title: "TED",
    description:
      "TED is a nonprofit devoted to spreading ideas, usually in the form of short, powerful talks (18 minutes or less). TED began in 1984 as a conference where Technology, Entertainment and Design converged, and today covers almost all topics — from science to business to global issues — in more than 100 languages.",
    links: {
      custom: "https://example.com",
      instagram: "https://instagram.com/ted",
      tiktok: "https://tiktok.com/@ted",
      x: "https://x.com/ted",
    },
    metadata: (
      <GenericDetailsMetadata
        handle={{
          userName: "john_doe",
          url: "https://example.com/john_doe",
        }}
        stats={{
          Communities: 1000,
          Groups: 500,
          Posts: 250,
        }}
        privacyInfo={{
          isPrivate: true,
        }}
      />
    ),
    ctas: (
      <>
        <Button theme="primary" size="md">
          Become a creator
        </Button>
      </>
    ),
    // Add default args here if the component has props
  },
};

export const List: Story = {
  args: {
    variant: "list",
    profileImageDetails: {
      alt: "Profile Image",
      imageUrl: "https://example.com/image.jpg",
      isAvatar: false,
    },
    title: "TED Talent hub",
    // description:
    //   "TED is a nonprofit devoted to spreading ideas, usually in the form of short, powerful talks (18 minutes or less). TED began in 1984 as a conference where Technology, Entertainment and Design converged, and today covers almost all topics — from science to business to global issues — in more than 100 languages.",
    // links: {
    //   custom: "https://example.com",
    //   instagram: "https://instagram.com/ted",
    //   tiktok: "https://tiktok.com/@ted",
    //   x: "https://x.com/ted",
    // },
    metadata: (
      <GenericDetailsMetadata
        handle={{
          userName: "john_doe",
          url: "https://example.com/john_doe",
        }}
        stats={{
          Communities: 1000,
          Groups: 500,
          Posts: 250,
        }}
        privacyInfo={{
          isPrivate: true,
        }}
      />
    ),
    ctas: (
      <>
        <Button theme="primary" size="md">
          Become a creator
        </Button>
      </>
    ),
    // Add default args here if the component has props
  },
};
