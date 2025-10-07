import { fetchHtml } from "@genuin/components/react-query/api/fetch-html";

/**
 * Resolves canonical URL for brand_id 2790, returns original URL for others.
 */
export const getRedirectUrl = async (
  url: string,
  brandId: number
): Promise<string> => {
  if (brandId !== 2790) {
    return url;
  }

  try {
    const response = await fetchHtml({ url });

    if (response.html) {
      const canonicalMatch = response.html.match(
        /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i
      );

      if (!canonicalMatch) {
        const alternativeMatch = response.html.match(
          /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i
        );

        if (alternativeMatch?.[1]) {
          return alternativeMatch[1];
        }
      } else if (canonicalMatch?.[1]) {
        return canonicalMatch[1];
      }
    }

    return url;
  } catch (error) {
    console.log(
      "returning original url due to error in fetching canonical url",
      error
    );
    return url;
  }
};
