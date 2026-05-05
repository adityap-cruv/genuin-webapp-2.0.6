import { z } from "zod";

import { VideoTypes } from "@genuin/components/context";
import { CommunityUserRoleSchema } from "@genuin/components/types/post";
import { GroupUserStatusSchema } from "@genuin/components/types/roles";

const description = z.array(
  z
    .object({ member_id: z.string(), text: z.string() })
    .or(z.object({ community_id: z.string(), text: z.string() }))
    .or(z.string())
);

// Define the video schema
export const videoSchema = z.object({
  id: z.string(),
  videoType: z.nativeEnum(VideoTypes).optional(),
  createdAt: z.number().default(-1).nullish(),
  commentCount: z.number(),
  viewCount: z.number(),
  shareUrl: z.string(),
  attachedLink: z.string().nullish(),
  source: z.string(),
  isSparked: z.boolean().nullish(),
  isWatched: z.boolean().nullish(),
  type: z.enum(["video", "overlay", "complete"]).default("video"),
  sparkCount: z.number(),
  thumbnail: z.string(),
  thumbnailM: z.string().nullish(),
  description: description.nullish(),
  descritptionText: z.string().nullish(),
  slug: z.string(),
  linkoutId: z.number().nullish(),
  clickableUrl: z.string().nullable(),
  linkouts: z.any(),
  isPinned: z.boolean(),
  thumbnailSprite: z.string().nullish(),
  adUrl: z.string().nullish(),
  adsPlatform: z.string().nullish(),
  cardLayoutId: z.number().nullish(),
  videoLayoutId: z.number().nullish(),
  duration: z.number().nullish().optional(),
  attributes: z
    .object({
      clip_type: z.string().nullish(),
      description: z.string().nullish(),
      image_url: z.string().nullish(),
      timestamp: z.number().nullish(),
      title: z.string().nullish(),
      bucket_name: z.string().nullish(),
      offer_text: z.string().nullish(),
      slug: z.string().nullish(),
      episode_id: z.string().nullish(),
      podcast_id: z.string().nullish(),
      station_id: z.string().nullish(),
      type: z.enum(["station", "podcast"]),
    })
    .nullish()
    .optional(),
  placement_card_layout_id: z.number().nullish().optional(),
  placement_video_layout_id: z.number().nullish().optional(),
  placement_card_section_layout_id: z.number().nullish().optional(),
});

// Define the loop schema
export const GroupSchema = z.object({
  slug: z.string(),
  name: z.string().nullish(),
  id: z.string(),
  isSubscribed: z.boolean().optional(),
  description: z.string(),
  shareUrl: z.string().optional(),
  isPrivate: z.boolean(),
  role: GroupUserStatusSchema,
});

export const BrandSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string().nullish(),
  webLogo: z.string().nullish(),
  slug: z.string(),
  userLogo: z.number().nullish(),
  handle: z.string().optional(),
});

// Define the community schema
export const communitySchema = z.object({
  profileImage: z.string().nullish(),
  name: z.string().nullish(),
  slug: z.string(),
  handle: z.string(),
  id: z.string(),
  isPrivate: z.number().transform((value) => value === 1),
  shareUrl: z.string(),
  userRole: CommunityUserRoleSchema,
  brand: BrandSchema.nullish(),
  membersCount: z.number().nullish().default(0),
  groupsCount: z.number().nullish().default(0),
  postsCount: z.number().nullish().default(0),
  type: z.number().nullish(),
});

export const BrandUserSchema = z.object({
  id: z.number(),
  slug: z.string(),
  userLogo: z.number().nullish().default(1),
});

// Define the owner schema
export const ownerSchema = z.object({
  isAvatar: z.boolean(),
  profileImage: z.string(),
  userName: z.string(),
  name: z.string().nullish(),
  brand: BrandUserSchema.nullish(),
  bio: z.string().nullish().optional(),
  shareUrl: z.string().nullish(),
});

const SectionSchema = z
  .object({
    id: z.string().nullish(),
    title: z.string().nullish(),
    description: z.string().nullish(),
    position: z.number().nullish(),
    thumbnail_url: z.string().nullish(),
    cover_url: z.string().nullish(),
    no_of_clips: z.number().nullish(),
    sub_title: z.string().nullish(),
  })
  .nullish()
  .optional();

export const sponsoredSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    cpm: z.number(),
  })
  .nullish();

const PostDetailsSchema = z.object({
  type: z.string().optional().nullish(),
  video: videoSchema,
  group: GroupSchema,
  community: communitySchema,
  owner: ownerSchema,
  section: SectionSchema,
  sponsored: sponsoredSchema,
});

const videoAdItemSchema = z.object({
  ads_url: z.string(),
  url: z.string(),
  cpm: z.number(),
  platform: z.string().optional(),
  advertiserDetails: z
    .object({
      logo: z.string(),
      primaryColor: z.string(),
    })
    .nullish(),
  contentVideo: z
    .object({
      url: z.string(),
      autoplay: z.boolean(),
      loop: z.boolean(),
      muted: z.boolean(),
      objectFit: z.string(),
    })
    .nullish(),
});

export const adTagObjectSchema = z.object({
  display_ad: z
    .union([
      z.object({ platform: z.string(), tag_id: z.string() }),
      z.array(z.object({ platform: z.string(), tag_id: z.string() })),
    ])
    .nullish(),
  native_ad: z
    .union([
      z.object({ platform: z.string(), tag_id: z.string() }),
      z.array(z.object({ platform: z.string(), tag_id: z.string() })),
    ])
    .nullish(),
  video_ad: z.union([videoAdItemSchema, z.array(videoAdItemSchema)]).nullish(),
  order: z.array(z.string()).nullish(),
});

export type AdTagObjectType = z.infer<typeof adTagObjectSchema>;

export const AdsPostDetailsSchema = z.object({
  type: z.literal("ads"),
  adTagObject: adTagObjectSchema,
  video: videoSchema.optional(),
  group: GroupSchema.optional(),
  community: communitySchema.optional(),
  owner: ownerSchema.optional(),
  section: SectionSchema,
  sponsored: sponsoredSchema,
});

export type AdsPostDetailsType = z.infer<typeof AdsPostDetailsSchema>;
// export type AdsPostDetailsType = z.infer<typeof AdsPostDetailsSchema>;
type PostDetailsType = z.infer<typeof PostDetailsSchema | typeof AdsPostDetailsSchema>;
export type VideoType = z.infer<typeof videoSchema>;
export { PostDetailsSchema };
export type { PostDetailsType };
