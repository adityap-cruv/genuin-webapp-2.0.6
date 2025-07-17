import { LoopVideoType } from "./schema";
import { LoopVideo } from "./type";

export function parseVideo(data: LoopVideo): LoopVideoType {
  const { owner } = data;
  return {
    ...data,
    owner: {
      member_id: owner.member_id,
      is_avatar: owner.is_avatar,
      profile_image: owner.profile_image,
      username: owner.username,
      name: owner.name,
      ...(owner.brand && {
        brand: {
          slug: owner.brand.brand_slug ?? "",
          id: owner.brand.brand_id ?? 0,
          userLogo: Number(owner.brand.brand_user_logo ?? 0),
        },
      }),
    },
  };
}
