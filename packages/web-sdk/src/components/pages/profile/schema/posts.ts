import { z } from 'zod'
import { mapCommunityUserRole } from '@/components/tree-structure/utils'
import type {
  CommunityType,
  LoopType,
  VideoType,
} from '@/components/tree-structure'

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
})

const actionsSchema = z.array(
  z.object({
    action_id: z.number(),
    access_type_id: z.number(),
  }),
)

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
  }),
  messages: z.array(messageSchema),
  actions: actionsSchema,
})

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
  .nullish()

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
})

export const CommunityListSchema = z.array(CommunitySchema)

export function parseCommunityResponse(
  input: z.infer<typeof CommunityListSchema>,
): CommunityType[] {
  return input.map<CommunityType>((community) => {
    return {
      id: community.community_id,
      isPrivate: community.type === 2,
      name: community.name ?? '',
      profileImage: community.dp_m ?? '',
      shareUrl: community.share_url ?? '',
      totalLoops: community.no_of_loops,
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
        community.is_community_join_requested,
      ),
      loops: parseGroupResponse(community.loops),
    }
  })
}

export function parseGroupResponse(
  loops: z.infer<typeof loopSchema>[],
): LoopType[] {
  return loops.map((loop) => {
    return {
      id: loop.chat_id,
      name: loop.group.group_name ?? '',
      totalVideoCount: loop.group.no_of_videos,
      videos: parseVideoResponse(loop.messages),
      isPrivate: !loop.is_view_allowed,
      slug: loop.slug,
      privacyInfo: loop.actions.map((action) => ({
        actionId: action.action_id,
        accessTypeId: action.access_type_id,
      })),
    }
  })
}

export function parseVideoResponse(
  messages: z.infer<typeof messageSchema>[],
): VideoType[] {
  return messages.map((message) => {
    return {
      id: message.message_id,
      sparkCount: message.no_of_views,
      thumbnail: message.thumbnail_url_l ?? message.thumbnail_url ?? '',
    }
  })
}

export default {}
