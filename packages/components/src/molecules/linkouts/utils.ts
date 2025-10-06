/**
 * Extracts the canonical URL from HTML content
 * @param html - The HTML string to parse
 * @returns The canonical URL if found, null otherwise
 */
const extractCanonicalFromHtml = (html: string): string | null => {
  // Try to extract canonical URL using regex patterns
  const match = 
    html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i) ||
    html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
  
  return match?.[1] || null;
};

/**
 * Fetches canonical URL directly from the target URL (client-side approach)
 * Used when Next.js API route is not available (e.g., in genuin-sdk embedded contexts)
 * @param url - The URL to fetch canonical from
 * @returns The canonical URL if found, null otherwise
 */
const fetchCanonicalDirectly = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; Genuin/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    return extractCanonicalFromHtml(html);
  } catch (error) {
    console.warn("[LinkCard] Direct fetch failed (expected in CORS-restricted environments):", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
};

/**
 * Fetches canonical URL via Next.js API route (server-side proxy approach)
 * Used in webapp context where Next.js API routes are available
 * @param url - The URL to fetch canonical from
 * @returns The canonical URL if found, null otherwise
 */
const fetchCanonicalViaApi = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `/api/fetch-canonical?url=${encodeURIComponent(url)}`
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.canonicalUrl || null;
    }
    
    return null;
  } catch (error) {
    console.warn("[LinkCard] API route fetch failed:", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
};

/**
 * Detects if we're running in a Next.js environment with API routes available
 * @returns true if Next.js API routes are available, false otherwise
 */
const isNextJsEnvironment = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if the current page is served from a Next.js app
  // This is a heuristic - if __NEXT_DATA__ exists, we're likely in Next.js
  return typeof (window as any).__NEXT_DATA__ !== 'undefined';
};

/**
 * Fetches the canonical URL for a given URL, specifically for brand_id 2790.
 * For other brands, returns the original URL unchanged.
 * 
 * This function works in both webapp (Next.js with API routes) and genuin-sdk 
 * (embedded in external sites) contexts:
 * - In Next.js: Uses the /api/fetch-canonical API route to bypass CORS
 * - In SDK/external sites: Attempts direct fetch (may fail due to CORS) and falls back to original URL
 * 
 * @param url - The original URL to resolve
 * @param brandId - The brand ID to check against
 * @returns The canonical URL if available and brandId is 2790, otherwise the original URL
 */
export const getRedirectUrl = async (
  url: string,
  brandId: number
): Promise<string> => {
  // Only fetch canonical URL for brand_id 2790
  if (brandId !== 2790) {
    return url;
  }

  try {
    let canonicalUrl: string | null = null;

    // Determine which fetching strategy to use based on environment
    if (isNextJsEnvironment()) {
      // We're in Next.js webapp - use API route for reliable CORS bypass
      canonicalUrl = await fetchCanonicalViaApi(url);
      
      console.log("[LinkCard] Canonical URL resolved via API route:", {
        originalUrl: url,
        canonicalUrl: canonicalUrl || url,
        brandId,
        timestamp: new Date().toISOString(),
      });
    } else {
      // We're in genuin-sdk or external context - try direct fetch
      // This may fail due to CORS, which is expected behavior
      canonicalUrl = await fetchCanonicalDirectly(url);
      
      console.log("[LinkCard] Canonical URL resolved via direct fetch:", {
        originalUrl: url,
        canonicalUrl: canonicalUrl || url,
        brandId,
        corsLimited: canonicalUrl === null,
        timestamp: new Date().toISOString(),
      });
    }

    // Return canonical URL if found, otherwise return original URL
    return canonicalUrl || url;
  } catch (error) {
    console.error("[LinkCard] Failed to fetch canonical URL - Exception:", {
      error:
        error instanceof Error
          ? {
              message: error.message,
              name: error.name,
              stack: error.stack,
            }
          : String(error),
      url,
      brandId,
      timestamp: new Date().toISOString(),
    });
    
    // Always return the original URL as fallback
    return url;
  }
};
