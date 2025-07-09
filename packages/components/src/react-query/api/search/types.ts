// Unified types for all search functionality
import { z } from "zod";
import { no } from "zod/v4/locales";

// ===============================
// COMMON SCHEMAS
// ===============================

// Brand Schema - reused across different search types
export const BrandSchema = z.object({
  brand_id: z.number(),
  name: z.string().nullish(),
  subdomain: z.string().nullish(),
  logo: z.string().nullish(),
  created_at: z.number(),
  brand_web_logo: z.string().nullish(),
  favicon: z.string(),
  brand_system_user_id: z.string().nullish(),
  brand_slug: z.string(),
  brand_user_logo: z.number().default(1),
});

// Brand User Schema - simplified version for user associations
export const BrandUserSchema = z
  .object({
    brand_id: z.number(),
    brand_slug: z.string(),
    brand_user_logo: z.number().default(1), // Default to 1 for brand user logo type
  })
  .nullish();

// ===============================
// SUGGESTIONS & RECENTS SCHEMAS
// ===============================

// Loop Schema for suggestions/recents
export const LoopSchema = z.object({
  chat_id: z.string(),
  group: z.object({
    group_id: z.string(),
    group_name: z.string().nullish(),
    group_description: z.string().nullish(),
    color_code: z.string().nullish(),
    text_color_code: z.string().nullish(),
    dp: z.string().nullish(),
    dp_s: z.string().nullish(),
    dp_m: z.string().nullish(),
    dp_l: z.string().nullish(),
    slug: z.string().nullish(),
    no_of_members: z.number().default(0),
    no_of_videos: z.number().default(0),
    no_of_views: z.number().default(0), // Added views count
  }),
  settings: z
    .object({
      discoverable: z.boolean().default(false),
    })
    .nullish(),
  share_url: z.string(),
  slug: z.string().nullish(),
  no_of_members: z.number().default(0),
  no_of_videos: z.number().default(0),
});

// User Schema for suggestions/recents
export const UserSchema = z.object({
  name: z.string().nullish(),
  nickname: z.string(),
  is_avatar: z.boolean(),
  bio: z.string().nullish(),
  user_id: z.string(),
  profile_image: z.string().nullish(),
  profile_image_s: z.string().nullish(),
  profile_image_m: z.string().nullish(),
  profile_image_l: z.string().nullish(),
  brand: BrandUserSchema.optional(),
  no_of_communities: z.number().default(0),
  no_of_loops: z.number().default(0),
  no_of_videos: z.number().default(0),
});

// Community Schema for suggestions/recents
export const CommunitySchema = z.object({
  brand: BrandSchema.optional(),
  community_id: z.string(),
  handle: z.string(),
  slug: z.string(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  color_code: z.string().nullish(),
  text_color_code: z.string().nullish(),
  dp: z.string().nullish(),
  dp_s: z.string().nullish(),
  dp_m: z.string().nullish(),
  dp_l: z.string().nullish(),
  type: z.number().nullish(),
  no_of_members: z.number().default(0),
  no_of_videos: z.number().default(0),
  no_of_loops: z.number().default(0),
});

// Suggestion Item Schema
export const SuggestionItemSchema = z.object({
  type: z.number().transform((val) => {
    if (val === 1) return "video";
    if (val === 2) return "user";
    if (val === 3) return "community";
    if (val === 4) return "loop";
    return undefined as never; // Remove "unknown" to match expected type
  }),
  loop: LoopSchema.nullish(),
  community: CommunitySchema.nullish(),
  user: UserSchema.nullish(),
  match_score: z.number(),
});

// Suggestions Response Schema
export const SuggestionsResponseSchema = z.array(SuggestionItemSchema);

// Recent Search Item Schema
export const RecentSearchItemSchema = z.object({
  id: z.string(),
  type: z.number().transform((item) => {
    if (item === 1) return "text";
    if (item === 2) return "user";
    if (item === 3) return "community";
    if (item === 4) return "loop";
    if (item === 5) return "video";
    return undefined as never; // Remove "unknown" to match expected type
  }),
  brand_id: z.number().nullish(),
  text: z.string().nullish(),
  timestamp: z.number(),
  loop: LoopSchema.nullish(),
  community: CommunitySchema.nullish(),
  user: UserSchema.nullish(),
});

// Recents Response Schema
export const RecentsResponseSchema = z.array(RecentSearchItemSchema);

// ===============================
// TOP RESULTS SCHEMAS
// ===============================

// Community Schema for Top Results
export const CommunityTopResultSchema = z.object({
  community_id: z.string(),
  handle: z.string(),
  slug: z.string(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  dp: z.string().nullish(),
  dp_m: z.string().nullish(),
  no_of_members: z.number().default(0),
  no_of_loops: z.number().default(0),
  no_of_videos: z.number().default(0),
  type: z.number().nullish(),
  brand: BrandSchema.nullish(),
});

// User/People Schema for Top Results
export const PeopleTopResultSchema = z.object({
  user_id: z.string(),
  nickname: z.string(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  profile_image: z.string().nullish(),
  profile_image_m: z.string().nullish(),
  is_avatar: z.boolean().default(false),
  no_of_communities: z.number().default(0),
  no_of_loops: z.number().default(0),
  no_of_videos: z.number().default(0),
  brand: BrandUserSchema,
});

// Loop Schema for Top Results
export const LoopTopResultSchema = z.object({
  chat_id: z.string(),
  slug: z.string().nullish(),
  group: z.object({
    group_id: z.string(),
    group_name: z.string().nullish(),
    group_description: z.string().nullish(),
    dp: z.string().nullish(),
    dp_m: z.string().nullish(),
    slug: z.string().nullish(),
    no_of_members: z.number().default(0),
    no_of_videos: z.number().default(0),
    no_of_views: z.number().default(0), // Added views count
  }),
  logged_in_user_status: z.number().optional(),
  is_view_allowed: z.boolean().default(true),
  settings: z
    .object({
      discoverable: z.boolean().default(false),
    })
    .nullish(),
});

// Video Schema for Top Results
export const VideoTopResultSchema = z.object({
  chat_id: z.string(),
  description: z.string().nullish(),
  message_id: z.string(),
  thumbnail_url: z.string().nullish(),
  thumbnail_url_s: z.string().nullish(),
  thumbnail_url_l: z.string().nullish(),
  attached_link: z.string(),
  media_url_m3u8: z.string(),
  message_at: z.number(),
  media_url: z.string(),
  no_of_views: z.number().default(0),
  no_of_comments: z.number().default(0),
  no_of_reactions: z.number().default(0),
  slug: z.string(),
  linkouts_id: z.number().nullish(),
  message_summary: z.string(),
  meta_data: z.object({
    contains_external_videos: z.boolean(),
    aspect_ratio: z.string(),
    resolution: z.string(),
    duration: z.string(),
    size: z.string(),
  }),
  is_ai_generated: z.boolean(),
  owner: z
    .object({
      member_id: z.string(),
      username: z.string(),
      name: z.string().nullish(),
      bio: z.string().nullish(),
      phone: z.string().nullish(),
      is_avatar: z.boolean().default(false),
      is_brand_system_user: z.boolean().default(false),
      brand: BrandUserSchema.optional(),
      profile_image: z.string().nullish(),
      profile_image_s: z.string().nullish(),
      profile_image_m: z.string().nullish(),
      profile_image_l: z.string().nullish(),
    })
    .nullish(),
  share_url: z.string(),
});

// Rankings Schema
export const RankingSchema = z.array(
  z.enum(["loops", "people", "videos", "communities"])
);

// Top Results Response Schema
export const TopResultsResponseSchema = z.object({
  communities: z.array(CommunityTopResultSchema).default([]),
  loops: z.array(LoopTopResultSchema).default([]),
  people: z.array(PeopleTopResultSchema).default([]),
  videos: z.array(VideoTopResultSchema).default([]),
  ranking: RankingSchema.optional(),
});

// ===============================
// VALIDATION FUNCTIONS
// ===============================

export function validateSuggestionsResponse(data: any) {
  try {
    return SuggestionsResponseSchema.parse(data);
  } catch (e) {
    console.log("Suggestions validation error:", e);
    throw new Error("Something went wrong with suggestions validation.");
  }
}

export function validateRecentsResponse(data: any) {
  try {
    return RecentsResponseSchema.parse(data);
  } catch (e) {
    console.log("Recents validation error:", e);
    throw new Error("Something went wrong with recents validation.");
  }
}

export function validateTopResultsResponse(data: any) {
  try {
    return TopResultsResponseSchema.parse(data);
  } catch (e) {
    console.log("Top results validation error:", e);
    throw new Error("Something went wrong with top results validation.");
  }
}

// ===============================
// TYPE EXPORTS
// ===============================

// Raw API Response Types
export type SuggestionsResponseType = z.infer<typeof SuggestionsResponseSchema>;
export type SuggestionItemType = z.infer<typeof SuggestionItemSchema>;
export type RecentsResponseType = z.infer<typeof RecentsResponseSchema>;
export type RecentSearchItemType = z.infer<typeof RecentSearchItemSchema>;
export type TopResultsResponseType = z.infer<typeof TopResultsResponseSchema>;
export type CommunityTopResultType = z.infer<typeof CommunityTopResultSchema>;
export type PeopleTopResultType = z.infer<typeof PeopleTopResultSchema>;
export type LoopTopResultType = z.infer<typeof LoopTopResultSchema>;
export type VideoTopResultType = z.infer<typeof VideoTopResultSchema>;
export type RankingType = z.infer<typeof RankingSchema>;
