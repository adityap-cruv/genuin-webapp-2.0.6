import { z } from "zod";

const communitySchema = z.object({
  community_id: z.string(),
  community_handle: z.string(),
  community_name: z.string(),
  community_description: z.string(),
  color_code: z.string(),
  text_color_code: z.string(),
  dp: z.string().nullable(),
  dpForSmallScreen: z.string(),
  dpForMediumScreen: z.string(),
  dpForLargeScreen: z.string(),
  slug: z.string(),
});

const categoryWithCommunitiesSchema = z.object({
  category: z.string(),
  communities: z.array(communitySchema),
});

const categoryListSchema = z.array(categoryWithCommunitiesSchema);
export type CategoryListType = z.infer<typeof categoryListSchema>;
