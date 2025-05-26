import { z } from "zod";

const communitySchema = z.object({
  community_id: z.string(),
  handle: z.string(),
  name: z.string(),
  description: z.string(),
  color_code: z.string(),
  text_color_code: z.string(),
  dp: z.string().nullable(),
  dp_s: z.string(),
  dp_m: z.string(),
  dp_l: z.string(),
  slug: z.string(),
});

const categoryWithCommunitiesSchema = z.object({
  category: z.string(),
  communities: z.array(communitySchema),
});

const categoryListType = z.array(categoryWithCommunitiesSchema);
export type CategoryListResponseType = z.infer<typeof categoryListType>;
