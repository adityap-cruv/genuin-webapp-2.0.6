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
   * Api path to fetch user/brand details.
   */
  USER_DETAILS: "/goservices/profile/info",
} as const;
