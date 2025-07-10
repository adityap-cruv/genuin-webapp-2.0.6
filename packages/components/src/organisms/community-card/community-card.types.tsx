import type { ComponentProps } from "react";

export type CommunityInfoType = {
  id: string;
  name: string;
  dp: string;
  banner: string;
  description: string;
  handle?: string;
  slug?: string;
  logged_in_user_status?: number;
  is_community_join_requested?: boolean;
  stats: {
    members: number;
    groups: number;
    posts: number;
  };
  type: "PUBLIC" | "PRIVATE";
};

export type CommunityCardProps = {
  community: CommunityInfoType;
  variant?: "explore" | "search" | "suggestion" | "recent";
  url?: string;
} & ComponentProps<"div">;
