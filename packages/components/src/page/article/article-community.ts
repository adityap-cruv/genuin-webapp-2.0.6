// Optional community/group shapes returned by an article source.
// The 3938 iHeart import contained no relationship records, so the active
// catalog intentionally leaves these fields unset instead of carrying Foil IDs.

import type { GroupUserStatusType } from "@genuin/components/types/roles";
import type { CommunityInfoType } from "../../organisms/community-card/community-card.types";

export type ArticleCommunity = {
  id: string;
  name: string;
  slug: string;
  handle: string;
  profileImage: string;
  isPrivate: boolean;
  shareUrl: string;
  userRole: "UNJOINED" | "MEMBER" | "MODERATOR" | "LEADER" | "REQUESTED";
  membersCount: number;
  groupsCount: number;
  postsCount: number;
  description: string;
  banner: string;
};

export type ArticleGroup = {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSubscribed: boolean;
  isPrivate: boolean;
  role: GroupUserStatusType;
  shareUrl: string;
  stats: { members: number; posts: number; views: number };
};

export function toCommunityCardInfo(community: ArticleCommunity): CommunityInfoType {
  return {
    id: community.id,
    name: community.name,
    dp: community.profileImage,
    banner: community.banner,
    description: community.description,
    handle: community.handle,
    slug: community.slug,
    stats: {
      members: community.membersCount,
      groups: community.groupsCount,
      posts: community.postsCount,
    },
    type: community.isPrivate ? "PRIVATE" : "PUBLIC",
  };
}
