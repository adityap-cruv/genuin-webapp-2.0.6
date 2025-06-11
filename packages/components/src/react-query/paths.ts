export const API_PATHS = {
  /**
   * Api path to fetch group details.
   */
  GROUP_DETAILS: "/api/v3/conversation/details",
  /**
   * Api path to fetch group feed.
   */
  GROUP_FEED: "/goservices/feed/loop",
  /**
   * Api path to fetch group members.
   */
  GROUP_MEMBERS: "/api/v3/conversation/members",
  /**
   * Api path to fetch community details.
   */
  COMMUNITY_DETAILS: "/api/v3/community",
  /**
   * Api path to fetch community groups.
   */
  COMMUNITY_GROUPS: "/api/v3/community/loops",
  /**
   * Api path to fetch community members.
   */
  COMMUNITY_MEMBERS: "/api/v3/community/members",
  /**
   * Api path to fetch community feed.
   */
  COMMUNITY_FEED: "/goservices/feed/community",
  /**
   * Api path to fetch user/brand details.
   */
  USER_DETAILS: "/goservices/profile/info",
  /**
   * Api path to fetch user/brand communities.
   */
  USER_COMMUNITIES: "goservices/profile/brand/communities",
  /**
   * Api path to fetch user/brand groups.
   */
  USER_GROUPS: "goservices/profile/brand/loops",
  /**
   * Api path to fetch user/brand videos.
   */
  USER_VIDEOS: "goservices/profile/brand/videos",
  /**
   * Api path to send OTP for authentication.
   */
  AUTH_SEND_OTP: "/api/v4/auth/signinup/code",
  /**
   * Api path to consume OTP for authentication.
   */
  AUTH_CONSUME_OTP: "/api/v4/auth/signinup/code/consume",
  /**
   * Api path to update email or phone number.
   */
  AUTH_UPDATE_EMAIL_OF_PHONE: "/api/v4/update_email_phone",
  /**
   * Api path to update user.
   */
  AUTH_UPDATE_USER: "/api/v3/users/update_user_profile",
  /**
   * Api path to fetch guidelines.
   */
  AUTH_GET_GUIDELINES: "/api/v3/brand/guidelines",
  /**
   * Api path to accept brand guidelines.
   */
  AUTH_ACCEPT_GUIDELINES: "/api/v4/accept_brand_guidelines",
  /**
   * API path to fetch categories.
   */
  AUTH_GET_CATEGORIES: "/api/v3/category/list",
  /**
   * API path to add topics.
   */
  AUTH_ADD_TOPICS: "/api/v3/users/topics",
  /**
   * API path to validate username.
   */
  AUTH_VALIDATE_USERNAME: "/api/v3/users/validate_nickname",
} as const;
