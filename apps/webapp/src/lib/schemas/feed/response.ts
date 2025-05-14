export type FeedResponseFromGoApi = {
  uuid: string
  ads_config?: AdsConfig
  type: string
  loop: FeedLoopInfo
  community: FeedCommunityInfo
  repost?: FeedRepostInfo
  video: VideoData
  owner: FeedOwnerInfo
}

type VideoData = {
  conversation_at: number
  description_data?: string
  description_text?: string
  media_url: string
  meta_data?: any
  share_url: string
  slug: string
  thumbnail_url: string
  thumbnail_url_l: string
  thumbnail_url_s: string
  thumbnail_url_m: string
  uuid: string
  attached_link?: string
  media_url_m3u8?: string
  no_of_views?: number
  no_of_sparks?: number
  no_of_comments?: number
  video_summary?: string
  sprite_image_url?: string
  no_of_shares?: number
  linkouts?: Linkout[]
  is_sparked?: boolean
  is_read?: boolean
  clickable_url?: string
  is_pinned?: boolean
  linkouts_id?: number
}

type AdsConfig = {
  ads_url: string
}

type Link = {
  image: string
  link: string
  position: number
  title: string
}

type Linkout = {
  cta_link: string
  cta_text: string
  links: Link[]
  style?: number
}

type FeedOwnerInfo = {
  uuid: string
  name?: string
  phone?: string // json.Number equivalent
  username: string
  bio?: string
  is_avatar: boolean
  profile_image: string
  profile_image_s?: string
  profile_image_m?: string
  profile_image_l?: string
  is_brand_system_user?: boolean
  brand?: BrandInfo
  share_url?: string
}

// type FeedLoggedInUserInfo = {
//   is_read: number
//   is_loop_subscriber?: number
//   is_loop_member?: number
//   loop_member_status?: number
//   member_role?: number
//   community_role?: number
//   is_video_sparked?: boolean
// }

type MemberInfo = {
  member_role?: number
  loop_member_status?: number
}

type FeedLoopInfo = {
  group_id: string
  group_name?: string
  group_description?: string
  dp: string
  dp_s: string
  dp_m: string
  dp_l: string
  color_code?: string
  text_color_code?: string
  uuid: string
  settings?: any // json.RawMessage equivalent
  slug?: string
  share_string?: string
  type?: number
  share_url?: string
  member_info?: MemberInfo
  is_loop_subscribe?: boolean
}

type FeedCommunityInfo = {
  uuid?: string
  handle?: string
  slug?: string
  name?: string
  description?: string
  color_code?: string
  text_color_code?: string
  dp: string
  dp_s: string
  dp_m: string
  dp_l: string
  share_string?: string
  brand_id?: number
  type?: number
  share_url?: string
  logged_in_user_role?: number
  brand?: {
    brand_id: number
    brand_slug: string
    brand_web_logo: string
    name: string
    brand_user_logo: number
  }
}

type BrandInfo = {
  brand_id: string
  brand_slug: string
  brand_user_logo: number
}

type FeedRepostInfo = {
  // Define the properties as needed.
}
