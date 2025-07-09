import { LoopVideoType } from "./schema";
import { LoopVideo } from "./type";

export function parseVideo(data: LoopVideo): LoopVideoType {
  return {
    ...data,
    owner: {
      member_id: data.owner.member_id,
      brand: {
        slug: data.owner.brand?.brand_slug || "",
        id: data.owner.brand?.brand_id || 0,
        userLogo: Number(data.owner.brand?.brand_user_logo || ""),
      },
      is_avatar: data.owner.is_avatar,
      profile_image: data.owner.profile_image,
      username: data.owner.username,
      name: data.owner.name,
    },
  };
}
