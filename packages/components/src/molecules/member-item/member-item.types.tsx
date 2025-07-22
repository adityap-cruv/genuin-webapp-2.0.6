import type { ComponentProps } from "react";
import type { MemberItemVariant } from "./member-item.cva";

export type MemberDataType = {
  isOwner?: boolean;
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
    brandId: number;
    brandSlug: string;
    brandUserLogo: number;
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
