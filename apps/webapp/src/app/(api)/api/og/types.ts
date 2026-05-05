export type BrandColors = {
  primary: string;
  primary_100: string;
  primary_200: string;
  primary_300: string;
  primary_400: string;
  primary_600: string;
  primary_700: string;
};

type CommunityLeader = {
  name: string;
  nickname: string;
  is_avatar: boolean;
  profile_image: string;
  bio: string;
};

export type CommunityItem = {
  uuid: string;
  slug: string;
  name: string;
  handle: string;
  description: string;
  brand_id: number;
  dp_s: string;
  dp_m: string;
  dp_l: string;
  dp: string;
  leader: CommunityLeader;
  colors: BrandColors;
  brand_name: string;
};

type ProfileImage = {
  is_avatar: boolean;
  profile_image: string;
};

export type GroupItem = {
  uuid: string;
  brand_id: number;
  slug: string;
  name: string;
  description: string;
  leader_image: ProfileImage;
  member_images: ProfileImage[];
  additional_members: string;
  video_thumbnails: string[];
  colors: BrandColors;
  brand_name: string;
};

export type VideoItem = {
  uuid: string;
  slug: string;
  description_text: string | null;
  brand_id: number;
  group_name: string;
  video_thumbnail_s: string;
  video_thumbnail_l: string;
  video_thumbnail: string;
  owner: {
    name: string;
    nickname: string;
    is_avatar: boolean;
    profile_image: string;
  };
  preview_image?: string | null;
  colors?: BrandColors;
};

export type ProfileItem = {
  uuid: string;
  name: string;
  nickname: string;
  profile_image: string;
  is_avatar: boolean;
  colors?: BrandColors;
  brand_id?: number;
  brand_name?: string;
};

export type Params = {
  slug: string;
  type: number;
  brandId: number;
  shareImageId?: string;
};
