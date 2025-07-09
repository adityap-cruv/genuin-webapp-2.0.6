type BrandUser = {
    brand_id: number;
    brand_slug: string;
    brand_user_logo?: number | null;
};

type Owner = {
    member_id: string;
    name: string | null;
    phone?: string | null;
    bio?: string | null;
    is_avatar: boolean;
    profile_image: string;
    username: string;
    profile_image_s?: string | null;
    profile_image_m?: string | null;
    profile_image_l?: string | null;
    brand?: BrandUser;
};

type MetaData = {
    size?: string | null;
    duration?: string | null;
    media_type?: string | null;
    resolution?: string | null;
    aspect_ratio?: string | null;
    contains_external_videos?: boolean | null;
};

export type LoopVideo = {
    is_sparked?: boolean | null;
    message_id: string;
    slug: string;
    description_text: string;
    description_data: string;
    no_of_views: number | null;
    no_of_comments: number | null;
    message_summary?: string | null;
    message_at: number | null;
    is_pinned?: boolean | null;
    share_url: string;
    questions: string[] | null;
    thumbnail_url?: string | null;
    thumbnail_url_s?: string | null;
    thumbnail_url_m?: string | null;
    thumbnail_url_l?: string | null;
    media_url: string;
    media_url_m3u8?: string | null;
    attached_link?: string | null;
    no_of_sparks: number | null;
    is_ai_generated?: boolean | null;
    is_read?: boolean | null;
    meta_data: MetaData;
    owner: Owner;
    linkouts_id?: number | null;
    clickable_url?: string | null;
};
