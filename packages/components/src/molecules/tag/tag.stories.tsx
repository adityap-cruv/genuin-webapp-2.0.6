import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tag, TagSkeleton } from "./tag";

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
    userLogoType: {
      control: "number",
      description: "Brand logo type for verified badge",
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
    userLogoType: 1,
  },
};

export const NoProfileImage: Story = {
  args: {
    profileImage: {
      isAvatar: false,
      url: "",
    },
    alt: "User Avatar",
    userName: "@AnonymousUser",
    url: "#",
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
    className: "gencl:bg-primary-300 gencl:rounded-full",
  },
};

export const Skeleton: Story = {
  render: () => {
    return (
      <div className="gencl:w-50">
        <TagSkeleton />
      </div>
    );
  },
};
