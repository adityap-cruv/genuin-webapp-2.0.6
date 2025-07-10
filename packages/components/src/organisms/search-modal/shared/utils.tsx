import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import {
  postRecents,
  RECENT_SEARCH_CONTENT_TYPE,
} from "@genuin/components/react-query/api/search/recents";
import type { CommunityInfoType } from "@genuin/components/organisms/community-card/community-card.types";
import type { MemberDataType } from "@genuin/components/molecules/member-item/member-item.types";

// Common transformation utilities
export const searchDataTransformers = {
  /**
   * Transform community data from API to component props
   */
  community: (community: any): CommunityInfoType => ({
    id: community.community_id || "",
    name: community.name || "",
    dp: community.dp || "",
    banner: community.dp || "",
    description: community.description || "",
    handle: community.handle || "",
    slug: community.slug || "",
    logged_in_user_role: community.logged_in_user_role || "",
    is_community_join_requested: community.is_community_join_requested || false,
    stats: {
      members: community.no_of_members,
      groups: community.no_of_loops,
      posts: community.no_of_videos,
    },
    type: community.type === 2 ? "PRIVATE" : "PUBLIC",
  }),

  /**
   * Transform user data from API to component props
   */
  user: (user: any): MemberDataType => ({
    memberId: user.user_id || "",
    url: user.brand
      ? buildPageUrl({
          type: "brand",
          slug: user.brand.brand_slug,
        })
      : buildPageUrl({
          type: "profile",
          slug: user.nickname,
        }),
    name: user.name || user.nickname || "",
    userName: user.nickname || "",
    profileImage: {
      isAvatar: user.is_avatar || false,
      url: user.profile_image_m || user.profile_image || "",
    },
    bio: user.bio || "",
    brand: user.brand ?? undefined,
    stats: {
      communities: user.no_of_communities,
      groups: user.no_of_loops,
      posts: user.no_of_videos,
    },
  }),

  /**
   * Transform group data from API to component props
   */
  group: (loop: any) => ({
    chat_id: loop.chat_id || "",
    owner: {
      userName: "",
      url: "",
    },
    group: {
      name: loop.group?.group_name || "",
      isPrivate: !loop.settings?.discoverable,
      url: buildPageUrl({
        type: "group",
        slug: loop.group?.slug || loop.slug || "",
      }),
      slug: loop.group?.slug || loop.slug || "",
      description: loop.group?.group_description || "",
      stats: {
        members: loop.no_of_members || 0,
        posts: loop.no_of_videos || 0,
        views: 0,
      },
    },
  }),
};

// URL generation utilities
export const urlGenerators = {
  community: (slug: string) => buildPageUrl({ type: "community", slug }),
  group: (slug: string) => buildPageUrl({ type: "group", slug }),
  video: (slug: string) => buildPageUrl({ type: "video", slug }),
  profile: (nickname: string, brand?: any) => {
    return brand
      ? buildPageUrl({ type: "brand", slug: brand.brand_slug })
      : buildPageUrl({ type: "profile", slug: nickname });
  },
};

// Analytics utilities
export const searchAnalytics = {
  trackRecentClick: async (
    type: "community" | "user" | "loop",
    id?: string
  ) => {
    if (!id) return;

    const contentType = {
      community: RECENT_SEARCH_CONTENT_TYPE.community,
      user: RECENT_SEARCH_CONTENT_TYPE.user,
      loop: RECENT_SEARCH_CONTENT_TYPE.loop,
    }[type];

    try {
      await postRecents(contentType, id);
    } catch (error) {
      console.error(`Failed to track ${type} click:`, error);
    }
  },
};

// Key generation utilities
export const keyGenerators = {
  suggestion: (suggestion: any, index: number): string => {
    switch (suggestion.type) {
      case "community":
        return `community-${suggestion.community?.community_id || index}`;
      case "loop":
        return `loop-${suggestion.loop?.chat_id || index}`;
      case "user":
        return `user-${suggestion.user?.user_id || index}`;
      case "video":
        return `video-${index}`;
      default:
        return `suggestion-${index}`;
    }
  },

  recent: (item: any): string => `${item.type}-${item.id}`,
};
