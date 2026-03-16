import { z } from "zod";

import { CommunityUserRoleSchema } from "@genuin/components/types/post";
import { GroupUserStatusSchema } from "@genuin/components/types/roles";
import { VideoTypes } from "@genuin/components/context";

const description = z.array(
  z
    .object({ member_id: z.string(), text: z.string() })
    .or(z.object({ community_id: z.string(), text: z.string() }))
    .or(z.string())
);

// Define the video schema
export const videoSchema = z.object({
  id: z.string(),
  video_type: z.nativeEnum(VideoTypes).optional(),
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

const PostDetailsSchema = z.object({
  type: z.string().optional().nullish(),
  video: videoSchema,
  group: GroupSchema,
  community: communitySchema,
  owner: ownerSchema,
  section: SectionSchema,
});

type PostDetailsType = z.infer<typeof PostDetailsSchema>;

export { PostDetailsSchema };
export type { PostDetailsType };
