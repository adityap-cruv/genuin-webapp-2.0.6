import type { Meta, StoryObj } from "@storybook/react";
import { EmbedTile } from "./embed-tile";

const meta: Meta<typeof EmbedTile> = {
  title: "Organisms/Web-SDK/EmbedTile",
  component: EmbedTile,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof EmbedTile>;

const DefaultPostDetails = {
  video: {
    id: "75baab35-91ee-4def-a92d-9959b16d95c3",
    createdAt: 1744890203000,
    commentCount: 0,
    shareUrl:
      "https://vkleowon.qa.begenuin.com/video/1f27928d0580141c?community=1d8385bff5800d85&loop=1f24814ba68014ae",
    attachedLink: null,
    source:
      "https://media.qa.begenuin.com/temp_video/672ddff928f9c049f2cbac47_1744890200852.mp4",
    isSparked: false,
    sparkCount: 0,
    thumbnail:
      "https://media.qa.begenuin.com/uploads/thumbnails/672ddff928f9c049f2cbac47_1744890200852.png",
    thumbnailM: null,
    description: [
      "Exploring the intersection of eco-friendly design and automotive aesthetics.",
    ],
    slug: "1f27928d0580141c",
    linkoutId: 3320,
    clickableUrl: null,
    linkouts: [
      {
        cta_link: "",
        cta_text: "",
        links: [
          {
            image: "",
            link: "https://amazon.com",
            position: 1,
            title: "Amazon.com",
          },
        ],
      },
    ],
    isPinned: false,
    thumbnailSprite: null,
  },
  group: {
    id: "f3088d1f-9603-4018-bf1a-0bf5d239a451",
    slug: "eco-aesthetics",
    description:
      "Focusing on sustainable design principles in modern vehicles.",
    shareUrl:
      "https://vkleowon.qa.begenuin.com/loop/eco-aesthetics?community=1d8385bff5800d85",
    name: "Eco Aesthetics",
    isSubscribed: false,
    role: "UNJOINED",
    isPrivate: false,
  },
  community: {
    id: "98c089c1-f59f-48cc-bba9-21687723d691",
    shareUrl: "https://vkleowon.qa.begenuin.com/community/koda-lovers",
    slug: "koda-lovers",
    handle: "skodalovers",
    isPrivate: false,
    userRole: "UNJOINED",
    // type: 1,
    name: "Skoda VRS",
    profileImage:
      "https://media.qa.begenuin.com/uploads/profile_images/community/m/communityProfile_1747830305301.png",
    membersCount: 0,
    groupsCount: 0,
    postsCount: 0,
    brand: {
      id: 2260,
      name: "Skoda",
      slug: "skoda",
      webLogo:
        "https://media.qa.begenuin.com/uploads/brands/web_logo/brandWebLogo_1730789229185.png",
      userLogo: 2,
    },
  },
  owner: {
    profileImage:
      "https://media.qa.begenuin.com/uploads/profile_images/brandProfileLogo_1751452436279.png",
    isAvatar: false,
    userName: "skoda",
    name: "Skoda",
    brand: {
      id: 2260,
      slug: "skoda",
      userLogo: 2,
    },
  },
} as const;

export const Default: Story = {
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "compact", "minimal"],
      defaultValue: "default",
      description: "Visual variant of the EmbedTile.",
    },
    embedType: {
      control: { type: "number" },
      defaultValue: 1,
      description: "Type of embed (1: standard, 2: carousel, 3: feed, etc.)",
    },
  },
  args: {
    variant: "default",
    embedType: 1,
  },
  render: ({ variant, embedType }) => (
    <EmbedTile
      postDetails={DefaultPostDetails}
      className="gencl:w-50 gencl:aspect-reel"
      variant={variant}
      embedType={embedType}
    />
  ),
};
