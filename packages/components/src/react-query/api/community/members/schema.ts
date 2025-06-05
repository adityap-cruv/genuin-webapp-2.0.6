import z from "zod";

const BrandUserSchema = z.object({
  brand_id: z.number(),
  brand_slug: z.string(),
  brand_user_logo: z.number().nullish().default(1),
});

const MembersSchema = z.array(
  z.object({
    member_id: z.string(),
    status: z.number(),
    name: z.string().nullish(),
    bio: z.string().nullish(),
    nickname: z.string(),
    is_avatar: z.boolean(),
    profile_image: z.string(),
    role: z.number(),
    phone: z.string().nullish(),
    brand: BrandUserSchema.optional(),
  })
);

export function validateCommunityMembers(data: unknown) {
  return MembersSchema.parse(data);
}
