import { AuthUser } from "@genuin/components/types/auth";

/**
 * This function parses the user data returned from the API.
 * It extracts relevant fields and formats them into a user object.
 * @param data - The user data returned from the API.
 * @param accessToken - The access token for the user.
 * @param refreshToken - The refresh token for the user.
 * @returns The parsed user object.
 */
export function parseUserData(
  data: any,
  accessToken: string,
  refreshToken: string
): AuthUser {
  return {
    id: data.user_id,
    image: data.profile_image,
    isAvatar: data.is_avatar,
    // userId: data.user_id,
    phoneNumber: data.phone,
    nickname: data.nickname,
    // profileImage: data.profile_image,
    email: data.email,
    bio: data.bio,
    name: data.name,
    accessToken,
    ksCbRequestStatus: data.ks_cb_request_status,
    isBrandSystemUser: data.is_brand_system_user,
    brandId: data.brand_id,
    brandSlug: data?.brand?.brand_slug ? data?.brand?.brand_slug : null,
    hasTopics: data.onboarding_topics,
    brandGuidelines: data.brand_guidelines,
    refreshToken,
    birth: data.birthday,
    usernameSet: !data.is_username_generated,
  };
}
