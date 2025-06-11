/**
 * Authenticated user object.
 */
export type AuthUser = {
  id: string;
  bio?: string;
  email?: string;
  phoneNumber?: string;
  isAvatar: boolean;
  name: string;
  nickname: string;
  image: string;
  /**
   * Token to refresh accessToken.
   */
  refreshToken?: string;
  accessToken: string;
  /**
   * The status can be:
   * - 1: Pending to request.
   * - 2: Requested. -> If request is rejected or approved then the status will be updated to 3 (in case of appr.) or 1 (in case of rejected).
   * - 3: Accepted.
   */
  ksCbRequestStatus: number;
  /**
   * if user is brand user.
   */
  isBrandSystemUser?: boolean;
  brandId?: number;
  brandSlug?: string;
  /**
   * Checks if use has already topics.
   */
  hasTopics?: boolean;
  birth?: string;
  usernameSet: boolean;
  /**
   * Checks if user has accepted brand guidelines.
   */
  brandGuidelines?: boolean;
};
