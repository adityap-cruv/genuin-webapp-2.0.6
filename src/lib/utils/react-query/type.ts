export type FeedVideoType = {
  community: {
    brand_id: number
    color_code: string
    description: string
    handle: string
    name: string
    share_string: string
    share_url: string
    slug: string
    text_color_code: string
    type: number
    uuid: string
    dp: string
    dp_l?: string
    dp_m?: string
    dp_s?: string
    logged_in_user_role?: number
    is_join_requested?: boolean
    brand?: {
      brand_id: number
      brand_slug: string
      brand_user_logo: number
      brand_web_logo: string
      name: string
    }
  }
  loop: {
    color_code: string
    group_description: string
    group_id: string
    group_name: string
    settings: {
      discoverable: boolean
    }
    share_string: string
    share_url: string
    slug: string
    type: number
    uuid: string
  }
  owner: {
    bio: string
    brand?: {
      brand_id: number
      brand_slug: string
      brand_user_logo: number
    }
    is_avatar: boolean
    name: string
    profile_image: string
    profile_image_s?: string
    profile_image_m?: string
    profile_image_l?: string
    share_url: string
    username: string
    uuid: string
  }
  uuid: string
  video: {
    clickable_url?: string | null
    attached_link: string | null
    conversation_at: number
    description_data: string | null
    description_text: string | null
    linkouts: any
    linkouts_id: string
    linkouts_inappbrowser: boolean
    media_url: string
    media_url_m3u8: string
    meta_data: {
      aspect_ratio: string
      contains_external_videos: boolean
      duration: string
      media_type: string
      resolution: string
      size: string
    }
    no_of_comments: number
    no_of_shares: number
    no_of_sparks: number
    no_of_views: number
    share_url: string
    slug: string
    sprite_image_url: string | null
    thumbnail_url: string
    thumbnail_url_l: string
    thumbnail_url_s: string
    uuid: string
    video_summary: string | null
    is_sparked?: boolean
    is_read?: boolean
  }
}

export type User = {
  brand_id: number
  user_id: string
  name?: string | null
  nickname: string
  bio: string | null
  is_new_message: boolean
  is_avatar: boolean
  is_brand_system_user: boolean
  phone: string | null
  profile_image: string
  profile_image_s?: string | null
  profile_image_m?: string | null
  profile_image_l?: string | null
  is_username_generated: boolean
  email?: string | null
  is_email_verified: boolean
  platform_guidelines: boolean
  community_walkthrough: boolean
  onboarding_communities: boolean
  onboarding_subscription: boolean
  login_source: number
  device_type: string
  action_meta_data: string | null
  is_user_signedup: boolean
  ks_cb_request_status: number
  onboarding_topics: boolean
  brand_guidelines: boolean
  device_uuid: string
  accessToken: string
  autoLoginToken: string
}

export type AuthUser = {
  id: string
  accessToken: string
  bio?: string
  email?: string
  phoneNumber?: string
  isAvatar: boolean
  name: string
  nickname: string
  image: string
  /**
   * Token to refresh accessToken.
   */
  refreshToken?: string
  ksCbRequestStatus?: number
  /**
   * if user is brand user.
   */
  isBrandSystemUser?: boolean
  brandId?: string
  brandSlug?: string
  /**
   * Checks if use has already topics.
   */
  hasTopics?: boolean
  birth?: string
  usernameSet: boolean
  autoLoginToken?: string
  brandGuidelines?: boolean
}

export type CommunityJoinStatusType = 'unjoined' | 'joined' | 'requested' | 'leader'

export type ViewType = 'feed' | 'carousel' | 'standard_wall'

export type SizeBoxType = { height: number; width: number }

export type FeedType = 'HOME' | 'POPULAR' | 'LATEST'

/**
 * Return type for fetchFeed.
 */
export type FetchFeedReturnType = { videos: FeedVideoType[]; end: boolean }
