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
    // Backend may return `nickname` as null; product hasn't decided a fallback, so keeping it as nullish for now
    nickname: z.string().nullish(),
    is_avatar: z.boolean(),
    profile_image: z.string(),
    profile_image_s: z.string().nullish(),
    profile_image_m: z.string().nullish(),
    profile_image_l: z.string().nullish(),
    role: z.number(),
    phone: z.string().nullish(),
    brand: BrandUserSchema.optional(),
  })
);

export type MembersSchemaType = z.infer<typeof MembersSchema>;

export function validateCommunityMembers(data: unknown) {
  return MembersSchema.parse(data);
}
