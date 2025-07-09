import type { ComponentProps } from "react";
import type { MemberItemVariant } from "./member-item.cva";

export type MemberDataType = {
  memberId: string;
  url: string;
  name: string;
  userName: string;
  profileImage: {
    isAvatar: boolean;
    url: string;
  };
  bio: string;
  // isOwner: boolean;
  brand?: {
    brand_id: number;
    brand_slug: string;
    brand_user_logo: number;
  };
  stats?: {
    communities: number;
    groups: number;
    posts: number;
  };
};

export type MemberItemProps = {
  memberData: MemberDataType;
  variant?: MemberItemVariant;
} & ComponentProps<"div">;

export type MemberItemSkeletonProps = {
  variant?: MemberItemVariant;
  className?: string;
};
