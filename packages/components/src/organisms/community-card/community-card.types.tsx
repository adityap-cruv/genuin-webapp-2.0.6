import type { ComponentProps } from "react";

export type CommunityInfoType = {
  name: string;
  dp: string;
  banner: string;
  description: string;
  stats: {
    members: number;
    groups: number;
    posts: number;
  };
};

export type CommunityCardProps = {
  community: CommunityInfoType;
} & ComponentProps<"div">;
