import { version as SDK_VERSION } from '../package.json'

type EnvironmentType = 'prod' | 'qa'

// Environment variables from .env files
export const DOMAIN = process.env.DOMAIN as string
export const BASE_URL = process.env.BASE_URL as string
export const API_BASE_URL = process.env.API_BASE_URL as string
export const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL as string
export const RUDDERSTACK_URL = process.env.RUDDERSTACK_URL as string
export const RUDDERSTACK_API_KEY = process.env.RUDDERSTACK_API_KEY as string
export const UNIQUE_USER_ID_KEY = process.env.UNIQUE_USER_ID_KEY as string
export const ENCRYPTION_IV = process.env.ENCRYPTION_IV as string
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string
export const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT
export const ENVIRONMENT = process.env.ENVIRONMENT as EnvironmentType
export const BCC_URL = process.env.NEXT_PUBLIC_BCC_URL as string

// Storage keys
export const ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_KEY as string
export const BRAND_ID_KEY = process.env.BRAND_ID_KEY as string

// UI Constants
export const NAV_BAR_HEIGHT = 69
/**
 * The width of the sidebar when it is expanded.
 */
export const SIDE_BAR_WIDTH = 280
/**
 * The width of the sidebar when it is reduced.
 */
export const SIDE_BAR_WIDTH_REDUCED = 80
/**
 * The breakpoint for the sidebar to get reduced.
 */
export const SIDE_BAR_BREAKPOINT = 1010
/**
 * The breakpoints for the responsive design.
 */
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
}
/**
 * The maximum width of the content.
 * This is only for standard wall.
 */
export const MAX_WIDTH_OF_CONTENT = 1280

// Content type constants
export const RECENT_SEARCH_CONTENT_TYPE = {
  community: 3,
  loop: 4,
  text: 1,
  user: 2,
  video: 5,
}

// Login source constants
export const LOGIN_SOURCE = {
  web_sdk: 1,
  white_label: 2,
  web: 3,
  mobile_app: 4,
  mobile_sdk: 5,
  bcc: 6,
  adreels: 7,
}

// External URLs
export const URL_TO_APP_STORE =
  'https://apps.apple.com/US/app/id1511177838?mt=8'
export const URL_TO_PLAY_STORE =
  'https://play.google.com/store/apps/details?id=com.begenuin.begenuin'
export const PROTECTED_ROUTES = ['settings', 'wallet']

// URL Generation Functions
export function generateBrandURL(subdomain: string): string {
  return `https://${subdomain}.${DOMAIN}`
}

// Helper function to get base URL with environment consideration
export function getBaseUrl(subdomain?: string): string {
  const isQAEnv = ENVIRONMENT === 'qa'
  if (subdomain) {
    return `https://${subdomain}${isQAEnv ? '.qa.' : '.'}begenuin.com`
  }
  return `https://${isQAEnv ? 'app.qa.' : ''}begenuin.com`
}

export { SDK_VERSION }
