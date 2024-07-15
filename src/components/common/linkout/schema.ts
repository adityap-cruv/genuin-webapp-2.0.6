import { z } from 'zod'

const linkSchema = z.object({
  position: z.number(),
  link: z.string(),
  image: z.string().nullish(),
  title: z.string().nullish(),
})

const linkoutSchema = z.object({
  style: z.number(),
  cta_text: z.string().nullish(),
  cta_link: z.string().url().nullish(),
  links: z.array(linkSchema),
})

const linkoutListSchema = z.array(linkoutSchema)

export type LinkoutsType = z.infer<typeof linkoutListSchema>

export function validateLinkouts(data: any) {
  try {
    return linkoutListSchema.parse(data)
  } catch (e) {
    console.log('error in validation of linkouts::', e)
    throw new Error('Error while validating linkouts response.')
  }
}
