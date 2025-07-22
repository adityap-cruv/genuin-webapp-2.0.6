import { buildPageUrl } from "@genuin/components/lib/utils/pages";

// Helper function to map member details
export function mapMemberDetails(
  member: {
    bio?: string | null;
    member_id: string;
    is_avatar: boolean;
    profile_image_m?: string | null;
    profile_image?: string | null;
    name?: string | null;
    nickname: string;
    brand?: {
      brand_user_logo?: number | null;
      brand_id?: number | null;
      brand_slug?: string | null;
    };
  },
  leaderId: string
) {
  return {
    bio: member.bio ?? "",
    isOwner: member.member_id === leaderId,
    memberId: member.member_id,
    profileImage: {
      isAvatar: member.is_avatar,
      url: member.profile_image_m ?? member.profile_image ?? "",
    },
    name: member.name ?? "",
    url: buildPageUrl({
      type: !!member.brand ? "brand" : "profile",
      slug: !!member.brand
        ? (member.brand.brand_slug ?? undefined)
        : (member.nickname ?? undefined),
    }),
    userName: member.nickname,
    brand: {
      brandUserLogo: member.brand?.brand_user_logo ?? -1,
      brandId: member.brand?.brand_id ?? -1,
      brandSlug: member.brand?.brand_slug ?? "",
    },
  };
}
