// filepath: /Users/himanshumendapara/Desktop/genuin/genuin-webapp-standalone/packages/components/@genuin/components/lib/utils/pages.ts

export type PageType =
  | "community"
  | "group"
  | "profile"
  | "brand"
  | "home"
  | "popular"
  | "latest"
  | "explore"
  | "settings"
  | "video"
  | "terms"
  | "privacy"
  | "notification"
  | "posts"
  | "post"
  | "posts-create"
  | "posts-draft";

type BuildPageUrlOptions = {
  type: PageType;
  slug?: string;
  searchParams?: Record<string, string | string[] | undefined>;
  asRoutePattern?: boolean; // Flag to generate wouter route patterns instead of actual URLs
};

/**
 * Builds a URL for a specific page type with an optional slug and search parameters.
 * @param param0 - The options for building the page URL.
 * @param param0.type - The type of page (community, group, profile, brand).
 * @param param0.slug - The slug for the page.
 * @param param0.searchParams - Optional search parameters to include in the URL.
 * @param param0.asRoutePattern - When true, returns wouter route patterns (e.g., "/profile/:id") instead of actual URLs.
 * @returns The constructed URL for the specified page or wouter route pattern.
 */
export function buildPageUrl({
  type,
  slug,
  searchParams,
  asRoutePattern = false,
}: BuildPageUrlOptions): string {
  let basePath: string;

  switch (type) {
    case "community":
      basePath = asRoutePattern ? "/community/:slug" : `/community/${slug}`;
      break;
    case "group":
      basePath = asRoutePattern ? "/group/:slug" : `/group/${slug}`;
      break;
    case "profile":
      basePath = asRoutePattern ? "/profile/:slug" : `/profile/${slug}`;
      break;
    case "brand":
      basePath = asRoutePattern ? "/brand/:slug" : `/brand/${slug}`;
      break;
    case "home":
      basePath = "/home";
      break;
    case "explore":
      basePath = "/explore";
      break;
    case "latest":
      basePath = "/latest";
      break;
    case "popular":
      basePath = "/popular";
      break;
    case "settings":
      basePath = "/settings";
      break;
    case "video":
      basePath = asRoutePattern ? "/video/:slug" : `/video/${slug}`;
      break;
    case "terms":
      basePath = "/terms";
      break;
    case "privacy":
      basePath = "/privacy";
      break;
    case "notification":
      basePath = "/notification";
      break;
    case "posts-create":
      basePath = "/posts/create";
      break;
    case "posts":
      basePath = `/posts`;
      break;
    case "post":
      basePath = `/posts/${slug}`;
      break;
    case "posts-draft":
      basePath = `/posts/drafts/${slug}`;
      break;
    case "post":
      basePath = `/posts/${slug}`;
      break;
    case "posts-draft":
      basePath = `/posts/drafts/${slug}`;
      break;
    default:
      // Optional: handle unknown type, though TypeScript should prevent this
      throw new Error(`Unknown page type: ${type}`);
  }

  if (searchParams && !asRoutePattern) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => query.append(key, v));
        } else {
          query.set(key, value);
        }
      }
    }
    const queryString = query.toString();
    if (queryString) {
      return `${basePath}?${queryString}`;
    }
  }

  return basePath;
}
