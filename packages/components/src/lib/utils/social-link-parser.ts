import { LinksType } from "@genuin/components/molecules/social-links";
import { CommunityDetailsType } from "@genuin/components/react-query/api/community/details/schema";

// Helper to build social links from a given object, or return empty links if not provided
export function buildSocialLinks(
  links?: CommunityDetailsType["social_links"]
): LinksType {
  if (!links) {
    return {
      custom: undefined,
      x: undefined,
      instagram: undefined,
      linkedin: undefined,
      reddit: undefined,
    };
  }
  return {
    custom: links.social_web_url ?? undefined,
    x: links.twitter?.id
      ? (links.twitter.url ?? "") + links.twitter.id
      : undefined,
    instagram: links.insta?.id
      ? (links.insta?.url ?? "") + links.insta?.id
      : undefined,
    linkedin: links.linkedin?.id ?? undefined,
    reddit: links.reddit_id?.id
      ? (links.reddit_id?.url ?? "") + links.reddit_id?.id
      : undefined,
  };
}
