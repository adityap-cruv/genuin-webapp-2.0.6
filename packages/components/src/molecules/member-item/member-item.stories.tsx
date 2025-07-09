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
    variant: {
      control: "select",
      options: ["default", "suggestion", "recent", "profile"],
    },
    className: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof MemberItem>;

const baseMemberData = {
  memberId: "1",
  isOwner: false,
  name: "Elvis Duran",
  url: "#",
  profileImage: {
    isAvatar: false,
    url: "https://via.placeholder.com/150",
  },
  bio: "Navigating the Controversial Terrain of Gun Control Policies in the U.S. and globally",
  userName: "elvisduran",
  brand: {
    brand_id: 1,
    brand_slug: "elvis-brand",
    brand_user_logo: 1,
  },
  stats: {
    communities: 12,
    groups: 34,
    posts: 680,
  },
};

export const Default: Story = {
  args: {
    className: "gencl:max-w-100",
    variant: "default",
    memberData: baseMemberData,
  },
};

export const Suggestion: Story = {
  args: {
    className: "gencl:max-w-100",
    variant: "suggestion",
    memberData: baseMemberData,
  },
};

export const Recent: Story = {
  args: {
    className: "gencl:max-w-100",
    variant: "recent",
    memberData: baseMemberData,
  },
};

export const Profile: Story = {
  args: {
    className: "gencl:max-w-fit",
    variant: "profile",
    memberData: baseMemberData,
  },
};

export const ProfileOwner: Story = {
  args: {
    className: "gencl:max-w-fit",
    variant: "profile",
    memberData: {
      ...baseMemberData,
      // isOwner: true,
      name: "Jane Smith",
      userName: "janesmith",
      brand: {
        brand_id: 2,
        brand_slug: "jane-brand",
        brand_user_logo: 2,
      },
    },
  },
};

export const Owner: Story = {
  args: {
    memberData: {
      memberId: "2",
      // isOwner: true,
      name: "Jane Smith",
      url: "#",
      profileImage: {
        isAvatar: false,
        url: "https://via.placeholder.com/150",
      },
      bio: "Team Owner and lead developer.",
      userName: "janesmith",
      brand: {
        brand_id: 2,
        brand_slug: "jane-brand",
        brand_user_logo: 2,
      },
    },
  },
};

export const WithoutProfileImage: Story = {
  args: {
    memberData: {
      memberId: "3",
      // isOwner: false,
      name: "Alex Johnson",
      url: "#",
      profileImage: {
        isAvatar: false,
        url: "",
      },
      bio: "No profile picture here.",
      userName: "alexj",
      brand: {
        brand_id: 3,
        brand_slug: "alex-brand",
        brand_user_logo: 1,
      },
    },
  },
};

export const WithLongBio: Story = {
  args: {
    memberData: {
      memberId: "4",
      // isOwner: false,
      name: "Sam Brown",
      url: "#",
      profileImage: {
        isAvatar: false,
        url: "https://via.placeholder.com/150",
      },
      bio: "This is a very long bio that should be truncated by the line-clamp utility to ensure the layout remains consistent and does not break. It should show an ellipsis at the end.",
      userName: "samb",
      brand: {
        brand_id: 4,
        brand_slug: "sam-brand",
        brand_user_logo: 1,
      },
    },
  },
};

export const WithAvatarImage: Story = {
  args: {
    memberData: {
      memberId: "5",
      // isOwner: false,
      name: "Chris Lee",
      url: "#",
      profileImage: {
        isAvatar: true,
        url: "https://via.placeholder.com/150/0000FF/808080?Text=CL",
      },
      bio: "Using an avatar instead of a regular image.",
      userName: "chrisl",
      brand: {
        brand_id: 5,
        brand_slug: "chris-brand",
        brand_user_logo: 2,
      },
    },
  },
};

export const WithoutName: Story = {
  args: {
    memberData: {
      memberId: "6",
      // isOwner: false,
      name: "",
      url: "#",
      profileImage: {
        isAvatar: false,
        url: "https://via.placeholder.com/150",
      },
      bio: "This member has no display name shown due to empty string name.",
      userName: "nonameuser",
      brand: {
        brand_id: 6,
        brand_slug: "noname-brand",
        brand_user_logo: 1,
      },
    },
  },
};

export const WithoutBio: Story = {
  args: {
    memberData: {
      memberId: "7",
      // isOwner: false,
      name: "Pat Green",
      url: "#",
      profileImage: {
        isAvatar: false,
        url: "https://via.placeholder.com/150",
      },
      bio: "",
      userName: "patg",
      brand: {
        brand_id: 7,
        brand_slug: "pat-brand",
        brand_user_logo: 1,
      },
    },
  },
};

export const WithDifferentBrandLogos: Story = {
  args: {
    memberData: {
      memberId: "8",
      // isOwner: true,
      name: "Brand User",
      url: "#",
      profileImage: {
        isAvatar: false,
        url: "https://via.placeholder.com/150",
      },
      bio: "User with different brand logo type.",
      userName: "branduser",
      brand: {
        brand_id: 8,
        brand_slug: "premium-brand",
        brand_user_logo: 3,
      },
    },
  },
};

export const WithoutBrandInfo: Story = {
  args: {
    memberData: {
      memberId: "9",
      // isOwner: true,
      name: "No Brand User",
      url: "#",
      profileImage: {
        isAvatar: false,
        url: "https://via.placeholder.com/150",
      },
      bio: "Owner without brand information.",
      userName: "nobranduser",
      // No brand property to test undefined case
    },
  },
};

export const Skeleton: Story = {
  render: () => {
    return <MemberItemSkeleton />;
  },
};

export const SkeletonDefault: Story = {
  render: () => {
    return <MemberItemSkeleton variant="default" className="gencl:max-w-100" />;
  },
};

export const SkeletonSuggestion: Story = {
  render: () => {
    return (
      <MemberItemSkeleton variant="suggestion" className="gencl:max-w-100" />
    );
  },
};

export const SkeletonRecent: Story = {
  render: () => {
    return <MemberItemSkeleton variant="recent" className="gencl:max-w-100" />;
  },
};

export const SkeletonProfile: Story = {
  render: () => {
    return <MemberItemSkeleton variant="profile" className="gencl:max-w-fit" />;
  },
};

// Skeleton variants comparison
export const SkeletonVariants: Story = {
  render: () => {
    return (
      <div className="gencl:flex gencl:flex-col gencl:gap-8 gencl:p-4">
        <div>
          <h3 className="gencl:text-lg gencl:font-semibold gencl:mb-4">
            Default Skeleton
          </h3>
          <MemberItemSkeleton variant="default" className="gencl:max-w-100" />
        </div>
        <div>
          <h3 className="gencl:text-lg gencl:font-semibold gencl:mb-4">
            Suggestion Skeleton
          </h3>
          <MemberItemSkeleton
            variant="suggestion"
            className="gencl:max-w-100"
          />
        </div>
        <div>
          <h3 className="gencl:text-lg gencl:font-semibold gencl:mb-4">
            Recent Skeleton
          </h3>
          <MemberItemSkeleton variant="recent" className="gencl:max-w-100" />
        </div>
        <div>
          <h3 className="gencl:text-lg gencl:font-semibold gencl:mb-4">
            Profile Skeleton
          </h3>
          <div className="gencl:flex gencl:justify-center">
            <MemberItemSkeleton variant="profile" className="gencl:max-w-fit" />
          </div>
        </div>
      </div>
    );
  },
};
