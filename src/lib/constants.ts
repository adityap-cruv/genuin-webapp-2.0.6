/**
 * This is mobile app download which will redirect to app store if it is iphone or else android.
 */
export const MOBILE_DOWNLOAD_APP_LINK = 'https://install.begenuin.com/86sn/cgs'
export const BCC_LOGIN_LINK = 'https://brands.begenuin.com/login'
/**
 * This is hiring link hiring page is hosted on {@link https://careers.begenuin.com | Careers}
 */
export const HIRING_LINK = 'https://careers.begenuin.com'
export const URL_TO_APP_STORE = 'https://apps.apple.com/US/app/id1511177838?mt=8'
export const URL_TO_PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.begenuin.begenuin'

export const HEIGHT_OF_HEADER = 76

export const LOGIN_SOURCE = {
  web_sdk: 1,
  white_label: 2,
  web: 3,
  mobile_app: 4,
  mobile_sdk: 5,
  bcc: 6,
  adreels: 7,
}

export const VERIFICATION_TYPE = {
  sms: 1,
  call: 2,
}

export const RECENT_SEARCH_CONTENT_TYPE: Record<'text' | 'community' | 'loop' | 'user' | 'video', number> = {
  community: 3,
  loop: 4,
  text: 1,
  user: 2,
  video: 5,
}

export const PROTECTED_ROUTES = ['settings', 'wallet']

export const NOT_FOUND_ERROR_CODES = {
  user: '5025',
  brand: '5235',
  community: '5218',
  group: '5168',
  video: '5209',
}

export const NOT_FOUND_ERROR_MESSAGES = {
  user: {
    title: 'User not found',
    description: "We're sorry, but the user you are looking for no longer exists.",
    showButton: true,
  },
  brand: {
    title: 'User not found',
    description: "We're sorry, but the user you are looking for no longer exists.",
    showButton: true,
  },
  community: {
    title: 'Community not found',
    description: "We're sorry, but the community you are looking for no longer exists.",
    showButton: true,
  },
  group: {
    title: 'Group not found',
    description: "We're sorry, but the group you are looking for no longer exists.",
    showButton: true,
  },
  video: {
    title: 'Video not found',
    description: "We're sorry, but this video no longer exists.",
    showButton: true,
  },
}

export const IHEART_BRAND_URL = [1429, 1729, 1775, 2236, 2249]
