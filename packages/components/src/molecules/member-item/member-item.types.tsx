import type { ComponentProps } from "react";

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
  isOwner: boolean;
};

export type MemberItemProps = {
  memberData: MemberDataType;
} & ComponentProps<"div">;
