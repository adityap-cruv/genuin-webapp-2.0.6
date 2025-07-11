import { z } from "zod";

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
  createdAt: z.number().default(-1).nullish(),
  commentCount: z.number(),
  viewCount : z.number(),
  shareUrl: z.string(),
  attachedLink: z.string().nullish(),
  source: z.string(),
  isSparked: z.boolean().nullish(),
  sparkCount: z.number(),
  thumbnail: z.string(),
  thumbnailM: z.string().nullish(),
  description: description.nullish(),
  slug: z.string(),
  linkoutId: z.number().nullish(),
  clickableUrl: z.string().nullable(),
  linkouts: z.any(),
  isPinned: z.boolean(),
  thumbnailSprite: z.string().nullish(),
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
});

// Define the PlayerVideoModal schema
const PostDetailsSchema = z.object({
  video: videoSchema,
  group: GroupSchema,
  community: communitySchema,
  owner: ownerSchema,
});

type PostDetailsType = z.infer<typeof PostDetailsSchema>;

export { PostDetailsSchema };
export type { PostDetailsType };
