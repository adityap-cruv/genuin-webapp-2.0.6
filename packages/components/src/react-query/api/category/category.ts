import { useQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import { useContext } from "react";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { BaseContext } from "@genuin/components/context/base";
import { getQueryKeyForCategories } from "@genuin/components/react-query/keys/authentication";
import { API_PATHS } from "@genuin/components/react-query/paths";

import { parseCategory } from "./index";
import type { CategoryListType } from "./index";

const IHEART_FALLBACK_CATEGORIES: CategoryListType = [
  {
    category: "iHeartRadio Music Festival 🎵",
    communities: [
      {
        community_id: "29bee151-fa36-47c5-9919-612291cc1531",
        community_handle: "iheartradio-music-6ed8ab",
        community_name: "iHeartRadio Music Festival",
        community_description:
          "The iHeartRadio Music Festival is a recurring event with specific dates and featured artists, indicating it as a durable content pillar.",
        color_code: "#8DC6E8",
        text_color_code: "#1B8DD1",
        dp: "https://media.qa.begenuin.com/uploads/profile_images/community/s/194bdd15-d169-4289-861f-1876a6b5f366_1790000469537.png",
        dpForSmallScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/s/194bdd15-d169-4289-861f-1876a6b5f366_1790000469537.png",
        dpForMediumScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/m/194bdd15-d169-4289-861f-1876a6b5f366_1790000469537.png",
        dpForLargeScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/l/194bdd15-d169-4289-861f-1876a6b5f366_1790000469537.png",
        slug: "iheartradio-music-festival",
      },
    ],
  },
  {
    category: "Sports Radio 🏈",
    communities: [
      {
        community_id: "2b552203-cb4e-4414-b3ab-0e0a1b7f0cbe",
        community_handle: "sports-radio-7e6f35",
        community_name: "Sports Radio",
        community_description:
          "Multiple radio stations are explicitly identified as 'Sports Radio' or 'FM Sports Radio', indicating a clear community around sports content.",
        color_code: "#8DC6E8",
        text_color_code: "#1B8DD1",
        dp: "https://media.qa.begenuin.com/uploads/profile_images/community/s/647e5676-0f52-4a9f-9428-c3c6154f14d1_1789997419187.png",
        dpForSmallScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/s/647e5676-0f52-4a9f-9428-c3c6154f14d1_1789997419187.png",
        dpForMediumScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/m/647e5676-0f52-4a9f-9428-c3c6154f14d1_1789997419187.png",
        dpForLargeScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/l/647e5676-0f52-4a9f-9428-c3c6154f14d1_1789997419187.png",
        slug: "sports-radio",
      },
    ],
  },
  {
    category: "Artist Radio Stations 📻",
    communities: [
      {
        community_id: "5db6106b-f6f3-4f4d-a2f9-b0ef369fda61",
        community_handle: "artist-radio-stat-66061c",
        community_name: "Artist Radio Stations",
        community_description:
          "The feature 'Artist Radio' allows users to create custom stations from artists, songs, or albums, establishing a community around personalized artist-centric music.",
        color_code: "#A576A6",
        text_color_code: "#4B004D",
        dp: "https://media.qa.begenuin.com/uploads/profile_images/community/s/b490cfc4-2f72-458d-a436-d8636ce67bca_1789997406886.png",
        dpForSmallScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/s/b490cfc4-2f72-458d-a436-d8636ce67bca_1789997406886.png",
        dpForMediumScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/m/b490cfc4-2f72-458d-a436-d8636ce67bca_1789997406886.png",
        dpForLargeScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/l/b490cfc4-2f72-458d-a436-d8636ce67bca_1789997406886.png",
        slug: "artist-radio-stations",
      },
    ],
  },
  {
    category: "NFL 🏆",
    communities: [
      {
        community_id: "c810f318-483c-4fec-bd97-379f901c2ad2",
        community_handle: "nfl-e16a48",
        community_name: "NFL",
        community_description:
          "The NFL is consistently mentioned across multiple podcasts and radio stations as a primary topic, indicating it is a durable content pillar.",
        color_code: "#A482C6",
        text_color_code: "#49058D",
        dp: "https://media.qa.begenuin.com/uploads/profile_images/community/s/a843dd98-d9f6-40b8-98d9-1a5e06166e8f_1789997416942.png",
        dpForSmallScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/s/a843dd98-d9f6-40b8-98d9-1a5e06166e8f_1789997416942.png",
        dpForMediumScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/m/a843dd98-d9f6-40b8-98d9-1a5e06166e8f_1789997416942.png",
        dpForLargeScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/l/a843dd98-d9f6-40b8-98d9-1a5e06166e8f_1789997416942.png",
        slug: "nfl",
      },
    ],
  },
  {
    category: "Artist Radio 🎶",
    communities: [
      {
        community_id: "0b32c042-a27e-4c77-b36a-7c0f5064b551",
        community_handle: "artist-radio-0fa98a",
        community_name: "Artist Radio",
        community_description:
          "The concept of 'Artist Radio Stations' and 'Artist Radio' is presented as a feature for creating custom stations, indicating a community around artist-specific music.",
        color_code: "#D6EAFC",
        text_color_code: "#ADD5F9",
        dp: "https://media.qa.begenuin.com/uploads/profile_images/community/s/958aedc0-ef89-4af8-abf8-1998865d4ba0_1789997401054.png",
        dpForSmallScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/s/958aedc0-ef89-4af8-abf8-1998865d4ba0_1789997401054.png",
        dpForMediumScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/m/958aedc0-ef89-4af8-abf8-1998865d4ba0_1789997401054.png",
        dpForLargeScreen:
          "https://media.qa.begenuin.com/uploads/profile_images/community/l/958aedc0-ef89-4af8-abf8-1998865d4ba0_1789997401054.png",
        slug: "artist-radio",
      },
    ],
  },
];

function getCategoryEmoji(nameOrSlug: string): string {
  const lower = nameOrSlug.toLowerCase();
  if (lower.includes("festival") || lower.includes("music") || lower.includes("perform")) return "🎵";
  if (lower.includes("sports") || lower.includes("sport")) return "🏈";
  if (lower.includes("station")) return "📻";
  if (lower.includes("nfl") || lower.includes("cup") || lower.includes("trophy")) return "🏆";
  if (lower.includes("radio")) return "🎶";
  if (lower.includes("podcast")) return "🎙️";
  if (lower.includes("event")) return "🎫";
  if (lower.includes("sail") || lower.includes("marine")) return "⛵";
  if (lower.includes("race") || lower.includes("miler")) return "🏁";
  if (lower.includes("olympic")) return "🏅";
  return "🌟";
}

function mapCommunityToCategoryItem(comm: Record<string, any>) {
  const name = String(comm.name || comm.community_name || "");
  const emoji = getCategoryEmoji(name || comm.slug || "");
  const categoryTitle = `${name} ${emoji}`.trim();
  const dp = (comm.dp_s || comm.dp || "") as string;

  return {
    category: categoryTitle,
    communities: [
      {
        community_id: String(comm.community_id || comm.id || ""),
        community_handle: String(comm.handle || comm.community_handle || ""),
        community_name: name,
        community_description: String(comm.description || comm.community_description || ""),
        color_code: String(comm.color_code || "#8DC6E8"),
        text_color_code: String(comm.text_color_code || "#1B8DD1"),
        dp: dp || null,
        dpForSmallScreen: String(comm.dp_s || dp || ""),
        dpForMediumScreen: String(comm.dp_m || dp || ""),
        dpForLargeScreen: String(comm.dp_l || dp || ""),
        slug: String(comm.slug || ""),
      },
    ],
  };
}

async function fetchCategories(axiosInstance: AxiosInstance, brandId?: number) {
  try {
    const res = await axiosInstance.get("/api/v3/trending/categories_communities");
    const resData = res.data;
    if (Array.isArray(resData?.data) && resData.data.length > 0) {
      return {
        categories: parseCategory(resData.data),
        end: resData.endOfResult,
      };
    }
  } catch {
    // API endpoint failed or returned empty; continue to communities fallback
  }

  try {
    const collectedCommunities: Record<string, any>[] = [];
    const seenIds = new Set<string>();

    if (brandId) {
      try {
        const brandCommRes = await axiosInstance.get(
          `${API_PATHS.USER_COMMUNITIES}?brand_id=${brandId}`
        );
        const list = brandCommRes.data?.data;
        if (Array.isArray(list)) {
          for (const item of list) {
            const id = (item.community_id || item.id || item.slug) as string | undefined;
            if (id && !seenIds.has(id)) {
              seenIds.add(id);
              collectedCommunities.push(item);
            }
          }
        }
      } catch {
        // Continue to trending communities
      }
    }

    try {
      const featRes = await axiosInstance.get(API_PATHS.TRENDING_COMMUNITIES);
      const list = featRes.data?.data?.communities;
      if (Array.isArray(list)) {
        for (const item of list) {
          const id = (item.community_id || item.id || item.slug) as string | undefined;
          if (id && !seenIds.has(id)) {
            seenIds.add(id);
            collectedCommunities.push(item);
          }
        }
      }
    } catch {
      // Ignore
    }

    if (collectedCommunities.length > 0) {
      return {
        categories: collectedCommunities.map(mapCommunityToCategoryItem),
        end: true,
      };
    }
  } catch {
    // Continue to fallback
  }

  return {
    categories: IHEART_FALLBACK_CATEGORIES,
    end: true,
  };
}

export function useCategory(brandIdProp?: number) {
  const axiosInstance = useAxiosInstance();
  let baseBrandId: number | undefined;
  try {
    const baseContext = useContext(BaseContext);
    baseBrandId = baseContext?.brandDetails?.brand_id;
  } catch {
    // Outside BaseContextProvider
  }
  const brandId = brandIdProp ?? baseBrandId;

  return useQuery({
    queryKey: getQueryKeyForCategories(brandId),
    queryFn: () => fetchCategories(axiosInstance, brandId),
  });
}

