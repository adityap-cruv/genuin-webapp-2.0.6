export interface PaginatedPostsParams {
  limit?: number;
  page?: number;
  query_string?: string;
  status?: number;
  sort_dir?: "asc" | "desc";
}

export interface ApiResponse {
  code: number;
  message: string;
  data: {
    posts: Post[];
    no_of_data: number;
  };
}

export interface PaginatedPostsResponse {
  data: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Video {
  id: string;
  slug: string;
  isPinned: boolean;
  shareUrl: string;
  metaData: {
    size: string;
    duration: string;
    media_type?: string;
    resolution: string;
    aspect_ratio: string;
    contains_external_videos?: boolean;
  };
  source?: string;
  thumbnail: string;
  thumbnailS: string;
  thumbnailL: string;
  createdAt: string;
  descriptionText: string | null;
  descriptionData: string | null;
  language: string | null;
  location: string | null;
  linkouts: Array<{
    links: Array<{
      link: string;
      image: string | null;
      title: string | null;
      position: number;
    }>;
    style?: number;
    cta_link: string | null;
    cta_text: string | null;
  }>;
  noOfPlays?: number;
  noOfShares?: number;
  noOfLikes?: number;
  noOfReposts: number;
}

export interface Community {
  id: string;
  handle: string;
  slug: string;
  name: string;
  description: string;
  colorCode: string;
  textColorCode: string;
  groupsCount: number;
  postsCount: number;
  type: number;
  profileImage: string | null;
  profileImageS: string;
  profileImageM: string;
  profileImageL: string;
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  shareUrl: string;
}

export interface Post {
  video: Video;
  community: Community;
  group: Group;
}

export function validatePaginatedPostsResponse(
  apiResponse: any,
  requestParams: PaginatedPostsParams
): PaginatedPostsResponse {
  if (!apiResponse || typeof apiResponse !== "object") {
    throw new Error("Invalid response data");
  }

  if (apiResponse.code !== 200) {
    throw new Error(`API error: ${apiResponse.message || "Unknown error"}`);
  }

  if (!apiResponse.data || typeof apiResponse.data !== "object") {
    throw new Error("Invalid response data structure");
  }

  if (!Array.isArray(apiResponse.data.posts)) {
    throw new Error("Posts data must be an array");
  }

  const posts: Post[] = apiResponse.data.posts;
  const total = apiResponse.data.no_of_data || posts.length;
  const page = requestParams.page || 1;
  const limit = requestParams.limit || 10;
  const totalPages = Math.ceil(total / limit);

  return {
    data: posts,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export type Brand = {
  brand_id: number;
  logo: string;
  brand_url: string;
  website: string;
};

export interface PaginatedAllowedBrandsParams {
  platform: "web";
  page: number;
  limit: number;
  query_string: string;
  brand_id: number;
}

export interface PaginatedAllowedBrandsResponse {
  data: Brand[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
