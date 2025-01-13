// types.ts
export type Section = {
  sectionTitle?: string
  title: string
  caption?: string
}

export type Button = {
  text: string
  buttonColor?: string
}

export type HeroSectionType =
  | (Section & {
      button: Button[]
      heroImage: string
    })
  | undefined

export type FeaturesSectionType =
  | (Section & {
      options: string[]
      carousalImage: string
    })
  | undefined

export type TestimonialSectionType =
  | (Section & {
      caption: string
      carousalImage: string
    })
  | undefined

export type CommunitiesSectionType =
  | (Section & {
      carousalImage: string
    })
  | undefined

export type GetStartedSectionType =
  | (Section & {
      caption: string
      carousalImage: string
      button: Button[]
    })
  | undefined
