import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tag } from "./tag";

const meta: Meta<typeof Tag> = {
  title: "Molecules/Tag",
  component: Tag,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    profileImage: {
      control: "object",
      description: "Profile image properties",
    },
    alt: { control: "text", description: "Alt text for the profile image" },
    userName: { control: "text", description: "User name" },
    url: { control: "text", description: "URL for the tag link" },
    isVerified: {
      control: "boolean",
      description: "Whether the user is verified",
    },
    className: { control: "text", description: "Additional class names" },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: {
    profileImage: {
      isAvatar: false,
      url: "https://media.begenuin.com/uploads/profile_images/s/webp/a22df5ce-e010-479a-bea2-78d54e76b75d_dp.webp",
    },
    alt: "User Avatar",
    userName: "@JohnDoe",
    url: "#",
    isVerified: false,
  },
};

export const Verified: Story = {
  args: {
    profileImage: {
      isAvatar: false,
      url: "https://media.begenuin.com/uploads/profile_images/s/webp/a22df5ce-e010-479a-bea2-78d54e76b75d_dp.webp",
    },
    alt: "User Avatar",
    userName: "@johndoe",
    url: "#",
    isVerified: true,
  },
};

export const NoProfileImage: Story = {
  args: {
    profileImage: {
      isAvatar: false, // Assuming isAvatar should be false if no image
      url: "",
    },
    alt: "User Avatar",
    userName: "@AnonymousUser",
    url: "#",
    isVerified: false,
  },
};

export const LongUserName: Story = {
  args: {
    profileImage: {
      isAvatar: false,
      url: "https://media.begenuin.com/uploads/profile_images/s/webp/a22df5ce-e010-479a-bea2-78d54e76b75d_dp.webp",
    },
    alt: "User Avatar",
    userName: "@UserWithAVeryLongNameThatMightOverflow",
    url: "#",
    isVerified: false,
  },
};

export const CustomStyle: Story = {
  args: {
    profileImage: {
      isAvatar: false,
      url: "https://media.begenuin.com/uploads/profile_images/s/webp/a22df5ce-e010-479a-bea2-78d54e76b75d_dp.webp",
    },
    alt: "User Avatar",
    userName: "@StyledUser",
    url: "#",
    isVerified: false,
    className: "gencl:bg-primary-300 gencl:rounded-full",
  },
};
