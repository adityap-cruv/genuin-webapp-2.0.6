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
  | "notification";

type BuildPageUrlOptions = {
  type: PageType;
  slug?: string;
  searchParams?: Record<string, string | string[] | undefined>;
};

/**
 * Builds a URL for a specific page type with an optional slug and search parameters.
 * @param param0 - The options for building the page URL.
 * @param param0.type - The type of page (community, group, profile, brand).
 * @param param0.slug - The slug for the page.
 * @param param0.searchParams - Optional search parameters to include in the URL.
 * @returns The constructed URL for the specified page.
 */
export function buildPageUrl({
  type,
  slug,
  searchParams,
}: BuildPageUrlOptions): string {
  let basePath: string;

  switch (type) {
    case "community":
      basePath = `/community/${slug}`;
      break;
    case "group":
      basePath = `/group/${slug}`;
      break;
    case "profile":
      basePath = `/profile/${slug}`;
      break;
    case "brand":
      basePath = `/brand/${slug}`;
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
      basePath = `/video/${slug}`;
      break;
    case "terms":
      basePath = `/terms`;
      break;
    case "privacy":
      basePath = `/privacy`;
      break;
    case "notification":
      basePath = "/notification";
      break;
    default:
      // Optional: handle unknown type, though TypeScript should prevent this
      throw new Error(`Unknown page type: ${type}`);
  }

  if (searchParams) {
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
