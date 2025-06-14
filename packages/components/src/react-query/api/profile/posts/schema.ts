import z from "zod";

import {
  mapCommunityUserRole,
  mapGroupJoinStatus,
} from "@genuin/components/lib/utils";
import type { CommunityUserRole } from "@genuin/components/types/post";
import type { GroupUserStatusType } from "@genuin/components/types/roles";

const messageSchema = z.object({
  media_url: z.string(),
  media_url_m3u8: z.string().nullish(),
  slug: z.string(),
  no_of_views: z.number(),
  thumbnail_url: z.string().nullish(),
  thumbnail_url_s: z.string().nullish(),
  thumbnail_url_m: z.string().nullish(),
  thumbnail_url_l: z.string().nullish(),
  message_id: z.string(),
  message_at: z.number().nullish(),
  no_of_comments: z.number().default(0).nullish(),
  no_of_shares: z.number().default(0).nullish(),
});

const actionsSchema = z.array(
  z.object({
    action_id: z.number(),
    access_type_id: z.number(),
  })
);

const loopSchema = z.object({
  chat_id: z.string(),
  is_view_allowed: z.boolean(),
  slug: z.string(),
  share_url: z.string().nullish(),
  group: z.object({
    group_id: z.string(),
    group_name: z.string().nullish(),
    group_description: z.string().nullish(),
    no_of_videos: z.number(),
    no_of_members: z.number().nullish().default(0),
    no_of_views: z.number().default(0).nullish(),
  }),
  is_subscriber: z.boolean().nullish(),
  logged_in_user_status: z.number().nullish(),
  messages: z.array(messageSchema),
  actions: actionsSchema,
});

const BrandSchema = z
  .object({
    brand_id: z.number(),
    name: z.string(),
    subdomain: z.string(),
    logo: z.string().url(),
    created_at: z.number(),
    brand_web_logo: z.string().url(),
    favicon: z.string().url(),
    brand_system_user_id: z.string(),
    brand_slug: z.string(),
  })
  .nullish();

const CommunitySchema = z.object({
  brand: BrandSchema.optional(),
  community_id: z.string(),
  type: z.number().nullish(),
  slug: z.string(),
  handle: z.string(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  color_code: z.string().nullish(),
  text_color_code: z.string().nullish(),
  no_of_members: z.number().default(0).nullish(),
  no_of_videos: z.number().default(0).nullish(),
  dp: z.string().url().nullish(),
  logged_in_user_role: z.number().nullish(),
  dp_s: z.string().url().nullish(),
  dp_m: z.string().url().nullish(),
  dp_l: z.string().url().nullish(),
  share_url: z.string().url().nullish(),
  role: z.number().nullish(),
  is_community_join_requested: z.boolean().nullish(),
  no_of_loops: z.number(),
  loops: z.array(loopSchema),
});

const CommunityListSchema = z.array(CommunitySchema);

/***
 * This type is used to define the structure of the video for tree structure component.
 */
export type VideoType = {
  id: string;
  thumbnail: string;
  sparkCount: number;
  noOfViews: number;
  noOfComments?: number;
  noOfShares?: number;
};

/***
 * This type is used to define the structure of the group for tree structure component.
 */
export type LoopType = {
  id: string;
  name: string;
  slug: string;
  videos: VideoType[];
  noOfVideos: number;
  noOfMembers: number;
  noOfViews: number;
  isPrivate: boolean;
  privacyInfo: Array<{ actionId: number; accessTypeId: number }>;
  role: GroupUserStatusType;
  isSubscriber?: boolean;
};

/***
 * This type is used to define the structure of the community for tree structure component.
 */
export type CommunityType = {
  id: string;
  name: string;
  profileImage: string;
  loops: LoopType[];
  isPrivate: boolean;
  noOfVideos: number;
  noOfMembers: number;
  noOfGroups: number;
  slug: string;
  role: CommunityUserRole;
  brand?: {
    logo: string;
    name: string;
    slug: string;
  };
  handle: string;
  shareUrl: string;
};

export function parseCommunityResponse(
  input: z.infer<typeof CommunityListSchema>
): CommunityType[] {
  return input.map<CommunityType>((community) => {
    return {
      id: community.community_id,
      isPrivate: community.type === 2,
      name: community.name ?? "",
      profileImage: community.dp_m ?? "",
      noOfGroups: community.no_of_loops,
      noOfVideos: community.no_of_videos ?? 0,
      noOfMembers: community.no_of_members ?? 0,
      slug: community.slug,
      brand: community.brand
        ? {
            name: community.brand.name,
            logo: community.brand.logo,
            slug: community.brand.brand_slug,
          }
        : undefined,
      role: mapCommunityUserRole(
        community.logged_in_user_role,
        community.is_community_join_requested
      ),
      loops: parseGroupResponse(community.loops),
      handle: community.handle,
      shareUrl: community.share_url ?? "",
    };
  });
}

export function parseGroupResponse(
  loops: Array<z.infer<typeof loopSchema>>
): LoopType[] {
  return loops.map((loop) => {
    return {
      id: loop.chat_id,
      name: loop.group.group_name ?? "",
      slug: loop.slug,
      noOfVideos: loop.group.no_of_videos,
      noOfMembers: loop.group.no_of_members ?? 0,
      noOfViews: loop.group.no_of_views ?? 0,
      videos: parseVideoResponse(loop.messages),
      isPrivate: !loop.is_view_allowed,
      privacyInfo: loop.actions.map((action) => ({
        actionId: action.action_id,
        accessTypeId: action.access_type_id,
      })),
      isSubscriber: loop.is_subscriber ?? false,
      role: mapGroupJoinStatus(loop.logged_in_user_status),
    };
  });
}

export function parseVideoResponse(
  messages: Array<z.infer<typeof messageSchema>>
): VideoType[] {
  return messages.map((message) => {
    return {
      id: message.message_id,
      sparkCount: message.no_of_views,
      thumbnail: message.thumbnail_url ?? "",
      noOfViews: message.no_of_views,
      noOfComments: message.no_of_comments ?? 0,
      noOfShares: message.no_of_shares ?? 0,
    };
  });
}
