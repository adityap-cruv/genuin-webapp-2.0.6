import { z } from "zod";
import { mapCommunityUserRole } from "@genuin/components/lib/utils";

const BrandUserSchema = z.object({
  brand_id: z.number(),
  brand_slug: z.string(),
  brand_user_logo: z.number().nullish().default(1),
});

const socialLinksSchema = z.object({
  social_web_url: z.string().nullish(),
  twitter: z
    .object({
      id: z.string().nullish(),
      url: z.string().nullish(),
    })
    .nullish(),
  linkedin: z
    .object({
      id: z.string().nullish(),
      url: z.string().nullish(),
    })
    .nullish(),
  insta: z
    .object({
      id: z.string().nullish(),
      url: z.string().nullish(),
    })
    .nullish(),
  discord_url: z.string().nullish(),
  reddit_id: z
    .object({
      id: z.string().nullish(),
      url: z.string().nullish(),
    })
    .nullish(),
});

const brandGuidelineSchema = z
  .object({
    id: z.number(),
    position: z.number(),
    title: z.string(),
    guideline_id: z.number().nullable(),
    description: z.string(),
  })
  .optional();

const moderatorSchema = z.object({
  member_id: z.string(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  nickname: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  profile_image_s: z.string().nullish(),
  profile_image_m: z.string().nullish(),
  profile_image_l: z.string().nullish(),
  role: z.number().nullish(),
  brand: BrandUserSchema.optional(),
});

const leaderSchema = z.object({
  member_id: z.string(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  nickname: z.string(),
  is_avatar: z.boolean(),
  profile_image: z.string(),
  role: z.number().optional(),
  is_brand_system_user: z.boolean().optional(),
  brand: BrandUserSchema.optional(),
});

const guidelineSchema = z.object({
  id: z.number(),
  position: z.number(),
  title: z.string(),
  guideline_id: z.number().nullish(),
  description: z.string(),
});

const BrandSchema = z
  .object({
    brand_id: z.number(),
    name: z.string(),
    subdomain: z.string(),
    logo: z.string().url().nullish(),
    created_at: z.number(),
    brand_web_logo: z.string().url().nullish(),
    favicon: z.string().url().nullish(),
    brand_system_user_id: z.string(),
    brand_slug: z.string(),
    brand_user_logo: z.number().nullish().default(1),
    brand_handle: z.string().optional(),
  })
  .nullish();

const CommunityDetailsSchema = z
  .object({
    brand: BrandSchema.optional(),
    banner: z.string().nullish(),
    community_id: z.string(),
    handle: z.string(),
    slug: z.string(),
    name: z.string().nullish(),
    type: z.preprocess(
      (val) => {
        if (val === 1) return "PUBLIC";
        if (val === 2) return "PRIVATE";
        return val; // Pass through other values for further validation by z.enum
      },
      z.enum(["PUBLIC", "PRIVATE"])
    ),
    description: z.string().nullish(),
    is_community_join_requested: z.boolean(),
    is_loop_creation_allowed: z.boolean().nullish(),
    logged_in_user_role: z.number().nullish(),
    color_code: z.string().nullish(),
    text_color_code: z.string().nullish(),
    welcome_loop_id: z.number().nullish(),
    dp: z.string().nullish(),
    dp_s: z.string().nullish(),
    dp_m: z.string().nullish(),
    dp_l: z.string().nullish(),
    share_url: z.string(),
    no_of_members: z.number(),
    no_of_loops: z.number(),
    no_of_videos: z.number(),
    categories: z
      .array(
        z.object({
          category_id: z.number(),
          title: z.string(),
        })
      )
      .optional(),
    social_links: socialLinksSchema,
    moderators: z.array(moderatorSchema),
    is_ai_generated: z.boolean(),
    leader: leaderSchema,
    guidelines: z.array(guidelineSchema),
    brand_guidelines: z.array(brandGuidelineSchema),
    preview_image: z.string().optional(),
    created_at: z.string().nullish(),
    no_of_views: z.number().nullish().default(0),
    no_of_comments: z.number().nullish().default(0),
    no_of_reactions: z.number().nullish().default(0),
  })
  .transform((data) => ({
    ...data,
    logged_in_user_role: mapCommunityUserRole(
      data.logged_in_user_role,
      data.is_community_join_requested
    ),
  }));

export type CommunityDetailsType = z.infer<typeof CommunityDetailsSchema>;

/**
 * This function validates the community details using Zod schema.
 * @param communityDetails
 * @returns
 */
export function validateCommunityDetails(
  communityDetails: CommunityDetailsType
) {
  try {
    return CommunityDetailsSchema.parse(communityDetails);
  } catch (e) {
    console.log("error in parsing community details:", e);
    throw new Error("parsing not done right!!!");
  }
}
