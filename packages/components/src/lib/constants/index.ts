/**
 * Enum-like object representing different login sources.
 *
 *
 * Each key corresponds to a login source and its associated numeric identifier.
 */
export const LOGIN_SOURCE = {
  web_sdk: 1,
  white_label: 2,
  web: 3,
  mobile_app: 4,
  mobile_sdk: 5,
  bcc: 6,
  adreels: 7,
};

/**
 * URL to download mobile application.
 */
export const MOBILE_DOWNLOAD_APP_LINK = 'https://install.begenuin.com/86sn/cgs'

/**
 * Protected routes that require authentication.
 */
export const PROTECTED_ROUTES = ["settings", "wallet"];

/**
 * URL to the app store for downloading the app.
 */
export const URL_TO_APP_STORE =
  "https://apps.apple.com/US/app/id1511177838?mt=8";

/**
 * URL to the play store for downloading the app.
 */
export const URL_TO_PLAY_STORE =
  "https://play.google.com/store/apps/details?id=com.begenuin.begenuin";

/**
 * Key for storing recent communities in local storage.
 * This key is used to persist the list of recently accessed communities.
 **/
export const RECENT_COMMUNITIES_KEY = "recentCommunities";

/**
 * Height of the top bar in pixels.
 */
export const TOP_BAR_HEIGHT = 64;
