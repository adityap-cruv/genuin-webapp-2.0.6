export const API_PATHS = {
  /**
   * Api path to fetch feed.
   */
  FEED_HOME: "/goservices/feed/home",
  /**
   * Api to spark a video or comment.
   */
  FEED_SPARK: "/api/v3/spark",
  /**
   * Api path to fetch videos.
   */
  FEED_GET_COMMENTS: "/api/v3/comments",
  /**
   * Api path to fetch mention list.
   */
  FEED_GET_MENTIONS_COMMENTS: "/api/v3/mentions",
  /**
   * Api path to create a comment.
   */
  FEED_CREATE_COMMENT: "/api/v3/comment/create",
  /**
   * Api path to fetch group details.
   */
  GROUP_DETAILS: "/api/v3/conversation/details",
  /**
   * Api path to fetch group feed.
   */
  GROUP_FEED: "/goservices/feed/loop",
  /**
   * Api path to fetch trending groups.
   */
  TRENDING_GROUPS: "/api/v3/featured_loops",
  /**
   * Api path to fetch group members.
   */
  GROUP_MEMBERS: "/api/v3/conversation/members",
  /**
   * Api path to join a group.
   */
  GROUP_JOIN: "/api/v3/conversation/participation_request",
  /**
   * Api path to request to leave a group.
   */
  GROUP_LEAVE: "/api/v3/conversation/leave",
  /**
   * Api path to subscribe to a group.
   */
  GROUP_SUBSCRIBE: "/api/v3/conversation/subscription",
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
   * Api path to fetch trending communities.
   */
  TRENDING_COMMUNITIES: "/api/v3/featured_communities",
  /**
   * Api path to fetch community feed.
   */
  COMMUNITY_FEED: "/goservices/feed/community",
  /**
   * Api path to request to join a community.
   */
  COMMUNITY_JOIN_REQUEST: "/api/v3/community/join_request",
  /**
   * Api path to add users to a community.
   */
  COMMUNITY_ADD_USERS: "/api/v3/community/add_users",
  /**
   * Api path to leave a community.
   */
  COMMUNITY_LEAVE: "/api/v3/community/leave",
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
   *
   */
  AUTH_AUTO_LOGIN: "/api/v4/auth/signinup",
  /**
   * API path to validate username.
   */
  AUTH_VALIDATE_USERNAME: "/api/v3/users/validate_nickname",
  /**
   * API path to fetch linkouts.
   */
  LINKOUTS: "/api/v3/linkouts",
  /**
   * API path to get redirection URL for authentication.
   */
  AUTH_GET_REDIRECTION_URL: "/api/v4/auth/authorisationurl",
  /**
   * Api path to send download link for the app.
   */
  SEND_DOWNLOAD_APP_LINK: "/api/v3/send_download_link",
  /**
   * Api path to fetch repost destinations.
   */
  REPOST_DESTINATIONS: "/api/v3/repost_destinations",
  /**
   * Api path to repost a video.
   */
  REPOST_VIDEO: "/api/v3/repost/create",
  /*
   * API path to post a comment.
   */
  POST_COMMENT: "/api/v3/comment/create",
  /*
   * API path to create a deeplink.
   */
  GENERATE_DYNAMIC_LINK: "/goservices/links/dynamic_link",
  /**
   * Api path to fetch metadata for a video deep link.
   */
  VIDEO_META_DATA: "/api/v3/deep_link/meta_data",
  /**
   * Api path to fetch loop and video conversation
   */
  LOOP_VIDEO: "/api/v3/conversation/messages",

  /**
   * Api path to Checks the status of the become creator request.
   * */
  BECOME_CREATOR_REQUEST_STATUS: "/api/v3/brand/cb_request_status",

  /**
   * Api path to Submits a request to become a creator.
   * */
  BECOME_CREATOR_REQUEST: "api/v3/users/ks_cb_request",
  /**
   * Api path to fetch search suggestions.
   */
  SEARCH_SUGGESTIONS: "/api/v3/search/suggestions",
  /**
   * Api path to fetch top search.
   */
  SEARCH_TOP_RESULTS: "/api/v3/search/top",
  /**
   * Api path to for recent results.
   */
  SEARCH_RECENT: "/api/v3/global_search/recent",
} as const;
