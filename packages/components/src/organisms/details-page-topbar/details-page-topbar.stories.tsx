import type { Meta, StoryObj } from "@storybook/react";
import {
  DetailsPageTopbar,
  DetailsPageTopbarSkeleton,
} from "./details-page-topbar";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { BecomeCreatorButton } from "@genuin/components/molecules/become-creator-button";
import { JoinCommunityButton } from "@genuin/components/molecules/join-community-button";
import { JoinGroupButton } from "@genuin/components/molecules/join-group-button";

const meta: Meta<typeof DetailsPageTopbar> = {
  title: "Organisms/DetailsPageTopbar",
  component: DetailsPageTopbar,
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Topbar title",
      defaultValue: "TEDx Podcast",
    },
    profileImageDetails: {
      control: "object",
      description: "Profile image details",
      defaultValue: {
        imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
        isAvatar: false,
        alt: "TEDx Podcast",
      },
    },
    metadata: {
      control: { type: "radio" },
      options: ["PUBLIC", "PRIVATE"],
      description: "Type of page (public/private)",
      defaultValue: "PUBLIC",
      mapping: {
        PUBLIC: { type: "PUBLIC" },
        PRIVATE: { type: "PRIVATE" },
      },
    },
    ctas: {
      control: false,
      description: "Call-to-action buttons (ReactNode)",
    },
  },
  args: {
    title: "TED Talent Hub",
    profileImageDetails: {
      imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      isAvatar: false,
      alt: "TED Talent Hub",
    },
    metadata: { type: "PUBLIC" },
    ctas: (
      <div className="gencl:flex gencl:gap-2">
        <ShareButton />
        <BecomeCreatorButton />
      </div>
    ),
    defaultOpen: true,
    isOpen: true,
  },
};

export default meta;

type Story = StoryObj<typeof DetailsPageTopbar>;

export const Default: Story = {
  name: "Default (Public, With Avatar, With CTAs)",
  args: {
    title: "TED Talent Hub",
    profileImageDetails: {
      imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      isAvatar: false,
      alt: "TED Talent Hub",
    },
    metadata: { type: "PUBLIC" },
    ctas: (
      <div className="gencl:flex gencl:gap-2">
        <ShareButton />
        <BecomeCreatorButton />
      </div>
    ),
  },
};

export const PrivateGroup: Story = {
  name: "Private Group (With Avatar, With CTAs)",
  args: {
    title: "Genuin Group",
    profileImageDetails: {
      imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      isAvatar: true,
      alt: "Genuin Group",
    },
    metadata: { type: "PRIVATE" },
    ctas: (
      <div className="gencl:flex gencl:gap-2">
        <JoinGroupButton />
        <ShareButton />
      </div>
    ),
  },
};

export const ProfileNoCTAs: Story = {
  name: "Profile (With Avatar, No CTAs)",
  args: {
    title: "Jane Doe",
    profileImageDetails: {
      imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      isAvatar: true,
      alt: "Jane Doe",
    },
    metadata: { type: "PUBLIC" },
    ctas: undefined,
  },
};

export const NoAvatarWithCTAs: Story = {
  name: "Community (No Avatar, With CTAs)",
  args: {
    title: "No Avatar Community",
    profileImageDetails: undefined,
    metadata: { type: "PUBLIC" },
    ctas: (
      <div className="gencl:flex gencl:gap-2">
        <JoinCommunityButton />
        <ShareButton />
      </div>
    ),
  },
};

export const NoCTAs: Story = {
  name: "Community (With Avatar, No CTAs)",
  args: {
    title: "No Buttons Community",
    profileImageDetails: {
      imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      isAvatar: false,
      alt: "No Buttons Community",
    },
    metadata: { type: "PUBLIC" },
    ctas: undefined,
  },
};

export const WithIconBadge: Story = {
  name: "With Icon Badge (Public, No CTAs)",
  args: {
    title: "Live Community",
    profileImageDetails: {
      imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      isAvatar: false,
      alt: "Live Community",
    },
    metadata: { type: "PUBLIC" },
    ctas: undefined,
  },
};

export const SkeletonState: Story = {
  name: "Skeleton",
  render: () => <DetailsPageTopbarSkeleton />,
};
