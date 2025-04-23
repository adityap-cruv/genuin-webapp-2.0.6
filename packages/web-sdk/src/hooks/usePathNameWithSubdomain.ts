import { getBaseUrl } from '@/const'
import { useBrandDetails } from '@/context/brand-details'

export type SettingsPageType =
  | 'edit'
  | 'personalization'
  | 'contact'
  | 'account'

/**
 * A collection of functions to generate URLs for various application routes.
 * Each function accepts an optional `subdomain` parameter to dynamically build the URL.
 * If the function is used inside a component, the subdomain will be automatically derived from the base context.
 */
export const PATH_NAME = {
  /**
   * Generates the URL for the loop route.
   * @param {string | undefined} id - The unique identifier for the group.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  loop: (id?: string, subdomain?: string): string => {
    return `${getBaseUrl(subdomain)}/group/${id}`
  },

  /**
   * Generates the URL for the video route.
   * @param {string | undefined} id - The unique identifier for the video.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  video: (id?: string, subdomain?: string): string =>
    `${getBaseUrl(subdomain)}/video/${id}`,

  /**
   * Generates the URL for the profile route.
   * @param {string | undefined} id - The unique identifier for the profile.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  profile: (id?: string, subdomain?: string): string =>
    `${getBaseUrl(subdomain)}/profile/${id}`,

  /**
   * Generates the URL for the community route.
   * @param {string | undefined} id - The unique identifier for the community.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  community: (id?: string, subdomain?: string): string =>
    `${getBaseUrl(subdomain)}/community/${id}`,

  /**
   * Generates the URL for the settings route.
   * @param {SettingsPageType | undefined} page - The specific settings page.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  settings: (page?: SettingsPageType, subdomain?: string): string =>
    `${getBaseUrl(subdomain)}/settings/${page}`,

  /**
   * Generates the URL for the brand route.
   * @param {string | undefined} id - The unique identifier for the brand.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  brand: (id?: string, subdomain?: string): string =>
    `${getBaseUrl(subdomain)}/brand/${id}`,

  /**
   * Generates the URL for the home route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  home: (subdomain?: string): string => `${getBaseUrl(subdomain)}/home`,

  /**
   * Generates the URL for the popular route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  popular: (subdomain?: string): string => `${getBaseUrl(subdomain)}/popular`,

  /**
   * Generates the URL for the latest route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  latest: (subdomain?: string): string => `${getBaseUrl(subdomain)}/latest`,

  /**
   * Generates the URL for the search route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  search: (subdomain?: string): string => `${getBaseUrl(subdomain)}/search`,

  /**
   * Generates the URL for the build route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  build: (subdomain?: string): string => `${getBaseUrl(subdomain)}/build`,

  /**
   * Generates the URL for the about route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  about: (subdomain?: string): string => `${getBaseUrl(subdomain)}/about`,

  /**
   * Generates the URL for the index (root) route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  index: (subdomain?: string): string => `${getBaseUrl(subdomain)}/`,

  /**
   * Generates the URL for the notification route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  notification: (subdomain?: string): string =>
    `${getBaseUrl(subdomain)}/notification`,

  /**
   * Generates the URL for the manage route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  manage: (subdomain?: string): string => `${getBaseUrl(subdomain)}/manage`,

  /**
   * Generates the URL for the market route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  market: (subdomain?: string): string => `${getBaseUrl(subdomain)}/market`,

  /**
   * Generates the URL for the pricing route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  pricing: (subdomain?: string): string => `${getBaseUrl(subdomain)}/pricing`,

  /**
   * Generates the URL for the discover route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  discover: (subdomain?: string): string => `${getBaseUrl(subdomain)}/discover`,

  /**
   * Generates the URL for the explore route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  explore: (subdomain?: string): string => `${getBaseUrl(subdomain)}/explore`,

  /**
   * Generates the URL for the creators route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  creators: (subdomain?: string): string => `${getBaseUrl(subdomain)}/creators`,

  /**
   * Generates the URL for the brands route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  brands: (subdomain?: string): string => `${getBaseUrl(subdomain)}/brands`,

  /**
   * Generates the URL for the wallet route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  wallet: (subdomain?: string): string => `${getBaseUrl(subdomain)}/wallet`,

  /**
   * Generates the URL for the careers route.
   * @returns {string} The generated URL.
   */
  careers: (): string => 'https://careers.begenuin.com',

  /**
   * Generates the URL for the AdReels route.
   * @returns {string} The generated URL.
   */
  adreels: (): string => 'https://creatives.begenuin.com/',

  /**
   * Generates the URL for the Yahoo article.
   * @returns {string} The generated URL.
   */
  yahoo: (): string =>
    'https://finance.yahoo.com/news/genuin-unveils-social-paradigm-empowering-140027873.html',

  /**
   * Generates the URL for the Business Insider article.
   * @returns {string} The generated URL.
   */
  businessinsider: (): string =>
    'https://markets.businessinsider.com/news/stocks/genuin-is-reinventing-social-connections-with-a-communityfirst-approach-1032839987',

  /**
   * Generates the URL for the terms and conditions page.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  terms: (subdomain?: string): string => `${getBaseUrl(subdomain)}/terms`,

  /**
   * Generates the URL for the privacy policy page.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  privacy: (subdomain?: string): string => `${getBaseUrl(subdomain)}/privacy`,

  /**
   * Generates the URL for the media network route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  mediaNetwork: (subdomain?: string): string =>
    `${getBaseUrl(subdomain)}/media-network`,

  /**
   * Generates the URL for the notFound route.
   * @param {string | undefined} subdomain - The subdomain to prepend to the base URL.
   * @returns {string} The generated URL.
   */
  notFound: (subdomain?: string): string =>
    `${getBaseUrl(subdomain)}/not-found`,
}

/**
 * Custom hook that provides PATH_NAME functions that automatically use
 * the subdomain from the brand-details context.
 *
 * @returns An object with the same structure as PATH_NAME but with functions
 * that automatically use the subdomain from context
 */
export function usePathNameWithSubdomain() {
  const { brandDetails } = useBrandDetails()
  const { subdomain } = brandDetails

  // Create a version of PATH_NAME that automatically uses the subdomain from context
  return {
    // Override specific functions to automatically use the subdomain
    community: (id?: string) => PATH_NAME.community(id, subdomain),
    loop: (id?: string) => PATH_NAME.loop(id, subdomain),
    video: (id?: string) => PATH_NAME.video(id, subdomain),
    profile: (id?: string) => PATH_NAME.profile(id, subdomain),
    brand: (id?: string) => PATH_NAME.brand(id, subdomain),
    settings: (page?: SettingsPageType) => PATH_NAME.settings(page, subdomain),
    home: () => PATH_NAME.home(subdomain),
    popular: () => PATH_NAME.popular(subdomain),
    explore: () => PATH_NAME.explore(subdomain),
    latest: () => PATH_NAME.latest(subdomain),
    search: () => PATH_NAME.search(),
    terms: () => PATH_NAME.terms(),
    privacy: () => PATH_NAME.privacy(),
    about: () => PATH_NAME.about(),
    mediaNetwork: () => PATH_NAME.mediaNetwork(),
    wallet: () => PATH_NAME.wallet(subdomain),
    careers: () => PATH_NAME.careers(),
    adreels: () => PATH_NAME.adreels(),
    yahoo: () => PATH_NAME.yahoo(),
    businessinsider: () => PATH_NAME.businessinsider(),
    notification: () => PATH_NAME.notification(),
    notFound: () => PATH_NAME.notFound(subdomain),
  }
}
