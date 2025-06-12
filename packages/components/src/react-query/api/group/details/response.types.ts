/**
 * Response types for group details API.
 */

import { z } from "zod";

const BrandUserSchema = z
  .object({
    brand_id: z.number().nullish(),
    brand_slug: z.string().nullish(),
    brand_user_logo: z.number().nullish().default(1),
  })
  .nullish();

const ownerSchema = z.object({
  member_id: z.string(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  username: z.string(),
  phone: z.string().nullish(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  profile_image_s: z.string().nullish(),
  profile_image_m: z.string().nullish(),
  profile_image_l: z.string().nullish(),
  brand: BrandUserSchema.optional(),
});

// Define group schema
const groupSchema = z.object({
  group_id: z.string(),
  group_name: z.string().nullish(),
  group_description: z.string().nullish(),
  color_code: z.string().nullish(),
  text_color_code: z.string().nullish(),
  dp: z.string().nullish(),
  dp_s: z.string().nullish(),
  dp_m: z.string().nullish(),
  dp_l: z.string().nullish(),
  no_of_views: z.number().nullish(),
  no_of_videos: z.number().nullish(),
  no_of_members: z.number().nullish(),
  no_of_subscribers: z.number().nullish(),
});

const Brand = z
  .object({
    brand_id: z.number(),
    name: z.string().nullish(),
    subdomain: z.string(),
    logo: z.string(),
    created_at: z.number(),
    brand_web_logo: z.string(),
    favicon: z.string(),
    brand_system_user_id: z.string(),
    brand_slug: z.string(),
  })
  .nullish();

// Define community schema
const communitySchema = z.object({
  community_id: z.string(),
  slug: z.string(),
  handle: z.string(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  color_code: z.string().nullish(),
  text_color_code: z.string().nullish(),
  dp: z.string().nullish(),
  dp_s: z.string().nullish(),
  dp_m: z.string().nullish(),
  dp_l: z.string().nullish(),
  share_url: z.string().nullish(),
  type: z.number().nullish(),
  brand: Brand.optional(),
});

// Define settings schema
const settingsSchema = z.object({
  discoverable: z.boolean(),
});

const actionsSchema = z.array(
  z.object({
    action_id: z.number(),
    access_type_id: z.number(),
  })
);

/**
 * Schema for response of group details API.
 */
const ResponseGroupDetailsSchema = z.object({
  actions: actionsSchema,
  chat_id: z.string(),
  is_welcome_loop: z.boolean(),
  type: z.number(),
  share_url: z.string(),
  settings: settingsSchema,
  slug: z.string(),
  is_ai_generated: z.boolean(),
  is_view_allowed: z.boolean(),
  group: groupSchema,
  owner: ownerSchema,
  is_post_allowed: z.boolean(),
  community: communitySchema,
  is_subscriber: z.boolean(),
  logged_in_user_status: z.number().nullish(),
});

/**
 * Api response type for group details.
 */
export type ResponseGroupDetailsType = z.infer<
  typeof ResponseGroupDetailsSchema
>;
