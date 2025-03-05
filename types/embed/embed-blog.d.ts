export type BlogSectionType =
  | {
      image: string
      blogContent: Array<{
        title: string
        description: string
      }>
      popularBlogs: Array<{
        blog: string
        videos: string
      }>
    }
  | undefined
