import type { Meta, StoryObj } from "@storybook/react";
import { CommunityHoverCard } from "./community-hover-card";

/**
 * CommunityHoverCard displays detailed information about a community in a hover card format,
 * including avatar, name, privacy status, membership stats, and action buttons.
 */
const meta: Meta<typeof CommunityHoverCard> = {
  title: "Molecules/CommunityPillCard",
  component: CommunityHoverCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A hover card component that shows community details with join and share actions.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="gencl:max-w-md! gencl:min-w-80 gencl:bg-white gencl:data-[state=open]:animate-in data-[state=closed]:animate-out gencl:data-[state=closed]:fade-out-0 gencl:data-[state=open]:fade-in-0 gencl:data-[state=closed]:zoom-out-95 gencl:data-[state=open]:zoom-in-95 gencl:data-[side=bottom]:slide-in-from-top-2 gencl:data-[side=left]:slide-in-from-right-2 gencl:data-[side=right]:slide-in-from-left-2 gencl:data-[side=top]:slide-in-from-bottom-2 gencl:z-50 gencl:w-80 gencl:origin-(--radix-hover-card-content-transform-origin) gencl:rounded-2xl gencl:border gencl:border-secondary-150 gencl:p-4 gencl:shadow-md gencl:outline-hidden">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CommunityHoverCard>;

export const Default: Story = {
  args: {
    communityDetails: {
      id: "123",
      name: "Design Community",
      handle: "design_community",
      profileImage: "https://via.placeholder.com/150",
      isPrivate: false,
      slug: "design-community",
      membersCount: 1234,
      groupsCount: 12,
      postsCount: 567,
      userRole: "MEMBER",
      shareUrl : "URL",
      brand: {
        id: 456,
        name: "Creative Brand",
        slug: "creative-brand",
        logo: "https://via.placeholder.com/50",
        userLogo: 25,
      },
    },
    onCommunityJoinStatusChange: (status) => {
      console.log("Community join status changed:", status);
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Shows a community hover card with all available information and interactive elements.",
      },
    },
  },
};