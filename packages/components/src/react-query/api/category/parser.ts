import { CategoryListResponseType } from "./index";
import { CategoryListType } from "./index";

export function parseCategory(
  data: CategoryListResponseType
): CategoryListType {
  return data.map((category) => ({
    category: category.category,
    communities: category.communities.map((community) => ({
      community_id: community.community_id,
      community_handle: community.handle,
      community_name: community.name,
      community_description: community.description,
      color_code: community.color_code,
      text_color_code: community.text_color_code,
      dp: community.dp_s ?? community.dp,
      dpForSmallScreen: community.dp_s,
      dpForMediumScreen: community.dp_m,
      dpForLargeScreen: community.dp_l,
      slug: community.slug,
    })),
  }));
}
