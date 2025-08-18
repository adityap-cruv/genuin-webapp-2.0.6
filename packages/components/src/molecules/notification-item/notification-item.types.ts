export type Moderator = {
  nickname: string;
};

export type NotificationDataType = {
  notification_id: string;
  is_read: boolean;
  type: string;
  created_at: number;
  user: {
    user_id: string;
    nickname: string;
    name: string;
    is_avatar: boolean;
    brand: {
      brand_id: number;
      brand_slug: string;
    };
    profile_image: string;
    profile_image_m: string;
  };
  brand: {
    brand_id: number;
    name: string;
    subdomain: string;
    logo: string;
    created_at: number;
    brand_web_logo: string;
    favicon: string;
    brand_system_user_id: string;
    brand_slug: string;
  };
  conversation: {
    group: {
      slug: string;
      group_name: string;
    };
    owner: {
      member_id: string;
      username: string;
    };
  };
  conversation_video: {
    thumbnail_url: string;
    slug: string;
  };
  community: {
    name: string;
    dp: string;
    slug: string;
  };
  reposted_conversation: {
    group: {
      group_name: string;
      slug: string;
    };
  };
  moderators: Moderator[];
};
