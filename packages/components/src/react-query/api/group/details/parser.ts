import type { ResponseGroupDetailsType } from "./response.types";
import type { GroupDetailsType } from "./types";

export function parseGroupDetails(
  data: ResponseGroupDetailsType
): GroupDetailsType {
  return {
    id: data.group.group_id,
    name: data.group.group_name,
    description: data.group.group_description,
    dp: data.group.dp,
    dpM: data.group.dp_m,
    noOfViews: data.group.no_of_views ?? 0,
    noOfVideos: data.group.no_of_videos ?? 0,
    noOfMembers: data.group.no_of_members ?? 0,
    noOfSubscribers: data.group.no_of_subscribers ?? 0,
    isWelcomeLoop: data.is_welcome_loop ?? false,
    isPrivate: data.type === 2, //type 2 means private
    shareUrl: data.share_url,
    slug: data.slug,
    createdAt: "", // Placeholder, as createdAt is not in ResponseGroupDetailsType
    isAiGenerated: data.is_ai_generated,
    isSubscriber: data.is_subscriber,
    isPostAllowed: data.is_post_allowed,
    isViewAllowed: data.is_view_allowed,
    actions: data.actions.map((action) => ({
      actionId: action.action_id,
      accessTypeId: action.access_type_id,
    })),
    settings: {
      discoverable: data.settings.discoverable,
    },
    owner: {
      id: data.owner.member_id,
      name: data.owner.name,
      bio: data.owner.bio,
      userName: data.owner.username,
      phone: data.owner.phone,
      isAvatar: data.owner.is_avatar,
      profileImage: data.owner.profile_image,
      profileImageM: data.owner.profile_image_m,
      brand: data.owner.brand
        ? {
            id: data.owner.brand.brand_id,
            slug: data.owner.brand.brand_slug,
            brandUserLogo: data.owner.brand.brand_user_logo,
          }
        : undefined,
    },
    community: {
      id: data.community.community_id,
      slug: data.community.slug,
      handle: data.community.handle,
      name: data.community.name,
      description: data.community.description,
      dp: data.community.dp,
      dpM: data.community.dp_m,
      shareUrl: data.community.share_url,
      type: data.community.type,
      brand: data.community.brand
        ? {
            id: data.community.brand.brand_id,
            name: data.community.brand.name,
            subdomain: data.community.brand.subdomain,
            logo: data.community.brand.logo,
            createdAt: data.community.brand.created_at,
            webLogo: data.community.brand.brand_web_logo,
            favicon: data.community.brand.favicon,
            brandSystemUserId: data.community.brand.brand_system_user_id,
            slug: data.community.brand.brand_slug,
          }
        : undefined,
    },
  };
}
