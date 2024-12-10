type Community = {
  community_id: string
  handle: string
  name: string
  description: string | null
  color_code: string
  slug: string
  text_color_code: string
  dp: string | null
  dp_s: string | null
  dp_m: string | null
  dp_l: string | null
}

type User = {
  name: string
  nickname: string
  is_avatar: boolean
  bio: string | null
  is_brand_system_user?: boolean
  brand?: {
    brand_id: number
    brand_slug: string
  }
  member_id: string
  profile_image: string | null
  profile_image_s: string | null
  profile_image_m: string | null
  profile_image_l: string | null
}

export type CommentMention = {
  type: number
  community?: Community
  user?: User
  match_score: number
}

export type SelectedMention = {
  handle: string
  id: string | number
  type: 'member' | 'community' | 'url'
}
