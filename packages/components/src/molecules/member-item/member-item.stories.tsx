import type { Meta, StoryObj } from "@storybook/react-vite";

import { MemberItem, MemberItemSkeleton } from "./member-item";

const meta: Meta<typeof MemberItem> = {
  title: "Molecules/MemberItem",
  component: MemberItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    memberData: { control: "object" },
    className: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof MemberItem>;

export const Default: Story = {
  args: {
    className: "gencl:max-w-100",
    memberData: {
      memberId: "1",
      isOwner: false,
      name: "John Doe",
      url: "#",
      profileImage: {
        isAvatar: false,
        url: "https://via.placeholder.com/150",
      },
      bio: "This is a short bio.This is a short bio.This is a short bio.This is a short bio.This is a short bio.This is a short bio.This is a short bio.",
      userName: "johndoe",
    },
  },
};

export const Owner: Story = {
  args: {
    memberData: {
      memberId: "2",
      isOwner: true,
      name: "Jane Smith",
      url: "#",
      profileImage: {
        isAvatar: false,
        url: "https://via.placeholder.com/150",
      },
      bio: "Team Owner and lead developer.",
      userName: "janesmith",
    },
  },
};

export const WithoutProfileImage: Story = {
  args: {
    memberData: {
      memberId: "3",
      isOwner: false,
      name: "Alex Johnson",
      url: "#",
      profileImage: {
        isAvatar: false,
        url: "",
      },
      bio: "No profile picture here.",
      userName: "alexj",
    },
  },
};

export const WithLongBio: Story = {
  args: {
    memberData: {
      memberId: "4",
      isOwner: false,
      name: "Sam Brown",
      url: "#",
      profileImage: {
        isAvatar: false,
        url: "https://via.placeholder.com/150",
      },
      bio: "This is a very long bio that should be truncated by the line-clamp utility to ensure the layout remains consistent and does not break. It should show an ellipsis at the end.",
      userName: "samb",
    },
  },
};

export const WithAvatarImage: Story = {
  args: {
    memberData: {
      memberId: "5",
      isOwner: false,
      name: "Chris Lee",
      url: "#",
      profileImage: {
        isAvatar: true,
        url: "https://via.placeholder.com/150/0000FF/808080?Text=CL",
      },
      bio: "Using an avatar instead of a regular image.",
      userName: "chrisl",
    },
  },
};

export const WithoutName: Story = {
  args: {
    memberData: {
      memberId: "6",
      isOwner: false,
      name: "",
      url: "#",
      profileImage: {
        isAvatar: false,
        url: "https://via.placeholder.com/150",
      },
      bio: "This member has no display name shown due to empty string name.",
      userName: "nonameuser",
    },
  },
};

export const WithoutBio: Story = {
  args: {
    memberData: {
      memberId: "7",
      isOwner: false,
      name: "Pat Green",
      url: "#",
      profileImage: {
        isAvatar: false,
        url: "https://via.placeholder.com/150",
      },
      bio: "",
      userName: "patg",
    },
  },
};

export const Skeleton: Story = {
  render: () => {
    return <MemberItemSkeleton />;
  },
};
