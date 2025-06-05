import { z } from "zod";

const BrandUserSchema = z
  .object({
    id: z.number().nullish(),
    slug: z.string().nullish(),
    brandUserLogo: z.number().nullish().default(1),
  })
  .nullish();

const ownerSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  userName: z.string(),
  phone: z.string().nullish(),
  isAvatar: z.boolean(),
  profileImage: z.string(),
  profileImageM: z.string().nullish(),
  brand: BrandUserSchema.optional(),
});

const Brand = z
  .object({
    id: z.number(),
    name: z.string().nullish(),
    subdomain: z.string(),
    logo: z.string(),
    createdAt: z.number(),
    webLogo: z.string(),
    favicon: z.string(),
    brandSystemUserId: z.string(),
    slug: z.string(),
  })
  .nullish();

// Define community schema
const communitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  handle: z.string(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  dp: z.string().nullish(),
  dpM: z.string().nullish(),
  shareUrl: z.string().nullish(),
  type: z.number().nullish(),
  brand: Brand,
});

// Define settings schema
const settingsSchema = z.object({
  discoverable: z.boolean(),
});

const actionsSchema = z.array(
  z.object({
    actionId: z.number(),
    accessTypeId: z.number(),
  })
);

/**
 * Schema for response of group details API.
 */
export const GroupDetailsSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  dp: z.string().nullish(),
  dpM: z.string().nullish(),
  noOfViews: z.number().default(0),
  noOfVideos: z.number().default(0),
  noOfMembers: z.number().default(0),
  noOfSubscribers: z.number().default(0),
  noOfComments: z.number().default(0),
  noOfSparks: z.number().default(0),
  isWelcomeLoop: z.boolean().default(false),
  isPrivate: z.boolean(),
  shareUrl: z.string(),
  slug: z.string(),
  createdAt: z.string(),
  isAiGenerated: z.boolean(),
  isSubscriber: z.boolean(),
  isPostAllowed: z.boolean(),
  isViewAllowed: z.boolean(),
  actions: actionsSchema,
  settings: settingsSchema,
  owner: ownerSchema,
  community: communitySchema,
});
