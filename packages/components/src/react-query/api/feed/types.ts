type ScoreInfo = {
  pop_score?: number;
  rec_score?: number;
  context_score?: number;
  user_interest_score?: number;
  final_score?: number;
};

type SectionInfo = {
  _id?: string | null | undefined;
  title?: string | null | undefined;
  description?: string | null | undefined;
  position?: number | null | undefined;
  thumbnail_url?: string | null | undefined;
  cover_url?: string | null | undefined;
  no_of_clips?: number | null | undefined;
  sub_title?: string | null | undefined;
} | null;

type SponsoredInfo = {
  id: string;
  title: string;
  cpm: number;
} | null;

export type VideoFeedItem = {
  uuid: string;
  type: string;
  loop: FeedLoopInfo;
  community: FeedCommunityInfo;
  repost?: FeedRepostInfo;
  video: VideoData;
  owner: FeedOwnerInfo;
  score?: ScoreInfo;
  section?: SectionInfo;
  sponsored?: SponsoredInfo;
};

type DisplayAdConfig = { platform: string; tag_id: string };
type NativeAdConfig = { platform: string; tag_id: string };
type VideoAdConfig = {
  ads_url: string;
  url: string;
  cpm: number;
  platform?: string;
  advertiserDetails?: { logo: string; primaryColor: string } | null;
  contentVideo?: { url: string; autoplay: boolean; loop: boolean; muted: boolean; objectFit: string } | null;
};
type HouseAd = { video: VideoFeedItem };

export type AdTagObject = {
  display_ad?: DisplayAdConfig | DisplayAdConfig[] | null;
  native_ad?: NativeAdConfig | NativeAdConfig[] | null;
  video_ad?: VideoAdConfig | VideoAdConfig[] | null;
  order?: string[] | null;
};

export type AdsFeedItem = {
  type: "ads";
  display_ad?: DisplayAdConfig | DisplayAdConfig[] | null;
  native_ad?: NativeAdConfig | NativeAdConfig[] | null;
  video_ad?: VideoAdConfig | VideoAdConfig[] | null;
  order?: string[] | null;
  house_ad?: HouseAd;
};

export type FeedResponseFromGoApi = Array<VideoFeedItem | AdsFeedItem>;

type VideoData = {
  conversation_at: number;
  description_data?: string;
  description_text?: string;
  description?: string;
  media_url: string;
  meta_data?: {
    video_source?: string;
    size?: string;
    aspect_ratio?: string;
    contains_external_videos?: boolean;
    duration?: string;
    media_type?: string;
    resolution?: string;
    [key: string]: unknown;
  };
  share_url: string;
  slug: string;
  thumbnail_url: string;
  thumbnail_url_l: string;
  thumbnail_url_s: string;
  thumbnail_url_m: string;
  uuid: string;
  attached_link?: string | null;
  media_url_m3u8?: string | null;
  no_of_views?: number;
  no_of_sparks?: number;
  no_of_comments?: number;
  video_summary?: string | null;
  sprite_image_url?: string | null;
  no_of_shares?: number;
  linkouts?: Linkout[] | null;
  is_sparked?: boolean;
  is_watched?: boolean;
  is_read?: boolean;
  clickable_url?: string | null;
  is_pinned?: boolean;
  linkouts_id?: number | null;
  ads_config?: AdsConfig;
  card_layout_id?: number;
  video_layout_id?: number;
  duration?: number;
  is_transcribed?: boolean;
  linkouts_inappbrowser?: boolean;
  owner?: FeedOwnerInfo;

  // Placement layout fields from the JSON response
  placement_card_layout_id?: number;
  placement_video_layout_id?: number;
  placement_card_section_layout_id?: number;

  attributes?: {
    clip_type?: string;
    description?: string;
    image_url?: string;
    timestamp?: number;
    title?: string;
    subtitle?: string;
    bucket_name?: string;
    offer_text?: string;
    slug?: string;
    episode_id?: string | null;
    podcast_id?: string;
    station_id?: string;
    type?: string;
    [key: string]: unknown;
  };
};

type AdsConfig = {
  ads_url: string;
  platform: string;
};

type Link = {
  image: string;
  link: string;
  position: number;
  title: string;
};

type Linkout = {
  cta_link: string;
  cta_text: string;
  links: Link[];
  style?: number;
};

type FeedOwnerInfo = {
  uuid: string;
  name?: string;
  phone?: string; // json.Number equivalent
  username: string;
  bio?: string;
  is_avatar: boolean;
  profile_image: string;
  profile_image_s?: string;
  profile_image_m?: string;
  profile_image_l?: string;
  is_brand_system_user?: boolean;
  brand?: BrandInfo;
  share_url?: string;
};

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
  member_role?: number;
  loop_member_status?: number;
};

type FeedLoopInfo = {
  group_id?: string;
  group_name?: string;
  group_description?: string;
  dp?: string;
  dp_s?: string;
  dp_m?: string;
  dp_l?: string;
  color_code?: string;
  text_color_code?: string;
  uuid?: string;
  settings?: unknown; // json.RawMessage equivalent
  slug?: string;
  share_string?: string;
  type?: number;
  share_url?: string;
  member_info?: MemberInfo;
  is_subscriber?: boolean;
  is_loop_subscriber?: boolean;
  logged_in_user_status?: number;
  is_view_allowed?: boolean;
  request_status?: number | null;
  actions?: any;
  no_of_views?: number;
  no_of_members?: number;
  no_of_videos?: number;
  no_of_sparks?: number;
};

type FeedCommunityInfo = {
  uuid?: string;
  handle?: string;
  slug?: string;
  name?: string;
  description?: string;
  color_code?: string;
  text_color_code?: string;
  dp?: string;
  dp_s?: string;
  dp_m?: string;
  dp_l?: string;
  share_string?: string;
  brand_id?: number;
  type?: number;
  share_url?: string;
  logged_in_user_role?: number;
  no_of_members?: number | null;
  no_of_groups?: number | null;
  no_of_videos?: number | null;
  no_of_views?: number;
  no_of_sparks?: number;
  brand?: {
    brand_id: number;
    brand_slug: string;
    brand_web_logo: string;
    name: string;
    brand_user_logo: number;
    brand_handle?: string;
  };
};

type BrandInfo = {
  brand_id: number;
  brand_slug: string;
  brand_user_logo: number;
};

type FeedRepostInfo = {
  id?: number;
  is_deleted?: boolean;
  owner?: FeedOwnerInfo;
};
