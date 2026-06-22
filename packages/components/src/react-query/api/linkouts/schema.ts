import { z } from "zod";

const linkSchema = z.object({
  position: z.number(),
  link: z.string(),
  image: z.string().nullish(),
  title: z.string().nullish(),
  // Extended fields surfaced by the Figma design — populated when the
  // backend returns them, dropped silently otherwise. The `<LinkCard>`
  // expand/panel/full-view layouts render each field individually.
  description: z.string().nullish(),
  brand: z.string().nullish(),
  website: z.string().nullish(),
  originalPrice: z.string().nullish(),
  currentPrice: z.string().nullish(),
  rating: z.string().nullish(),
  likes: z.string().nullish(),
  downloads: z.string().nullish(),
  phone: z.string().nullish(),
  address: z.string().nullish(),
});

const linkoutSchema = z.object({
  style: z.number().optional(),
  cta_text: z.string().nullish(),
  cta_link: z.string().nullish(),
  links: z.array(linkSchema),
});

const linkoutListSchema = z.array(linkoutSchema);

export type LinkData = z.infer<typeof linkSchema>;
export type LinkoutsType = z.infer<typeof linkoutListSchema>;

export function validateLinkouts(data: any) {
  try {
    return linkoutListSchema.parse(data);
  } catch (e) {
    console.log("error in validation of linkouts::", e);
    throw new Error("Error while validating linkouts response.");
  }
}
