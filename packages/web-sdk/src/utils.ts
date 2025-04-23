import {
  API_BASE_URL,
  ENCRYPTION_IV,
  ENCRYPTION_KEY,
  ENCRYPTION_SALT,
  generateBrandURL,
  PROTECTED_ROUTES,
  UNIQUE_USER_ID_KEY,
} from '@/const'
import { AuthUser, CommunityJoinStatusType, FeedType, SDKConfig } from '@/type'
import CryptoJS from 'crypto-es'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useBaseContext } from './context/base'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a URL with specified parameters.
 * @param path - The path to append to the base URL.
 * @param params - The parameters to include in the URL.
 * @param subdomain - The ID of the brand.
 * @returns The generated URL.
 */
export function generateConfiguredUrl(
  path: string,
  params: Record<string, string | boolean | number>,
  subdomain: string,
): string {
  return buildQueryString(generateBrandURL(subdomain) + path, params)
}

/**
 * Generates a basic URL without additional parameters.
 * @param path - The path to append to the base URL.
 * @param brandId - The ID of the brand.
 * @returns The generated URL.
 */
export function generateBasicUrl(path: string, brandId: string): string {
  // Construct the basic URL without additional parameters
  const url = `${generateBrandURL(brandId)}${path}`

  return url
}

/**
 * Builds a query string by encoding and appending non-undefined parameters to the given path.
 * @param path - The path to append the query string to.
 * @param params - The parameters to include in the query string.
 * @returns The path with the encoded query string.
 */
function buildQueryString(
  path: string,
  params: Record<string, string | boolean | number>,
): string {
  // Filter out undefined values from the parameters
  const filteredParams = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&')

  // Check if the path already has a query string
  const separator = path.includes('?') ? '&' : '?'

  // Concatenate the path and the encoded query string
  const url = `${path}${separator}${filteredParams}`

  return url
}

/**
 * Extracts paths and query parameters from a URL.
 * @param url - The URL to extract paths and query parameters from.
 * @returns An object containing paths and query parameters, or null if invalid.
 */
export function extractPathsAndParams(
  url: string,
): { paths: string[]; queryParams: { key: string; value: string }[] } | null {
  try {
    // Use the URL constructor directly to avoid creating unnecessary objects.
    const urlObj = new URL(url)

    // Filter out empty path segments.
    const paths = urlObj.pathname.split('/').filter((path) => path !== '')

    // Check if the second last path is in the specified list.
    const validSecondLastPaths = [
      'community',
      'profile',
      'loop',
      'video',
      'embed',
    ]
    const lastTwoPaths = validSecondLastPaths.includes(paths[paths.length - 2])
      ? paths.slice(-2)
      : []

    // Use the map function to simplify the creation of queryParams array.
    const queryParams: { key: string; value: string }[] = Array.from(
      urlObj.searchParams.entries(),
    ).map(([key, value]) => ({ key, value }))

    return { paths: lastTwoPaths, queryParams }
    /* eslint-disable @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    console.error('Invalid URL format:', error.message)
    return null
  }
}

/**
 * Generates a path based on the provided SDK configuration and current path.
 *
 * Conditions are checked in the following sequence:
 * 1. If video_id is present and not an empty string, the path is set to `/video/${video_id}`.
 * 2. If loop_id is present and not an empty string, the path is set to `/loop/${loop_id}`.
 * 3. If community_id is present and not an empty string, the path is set to `/community/${community_id}`.
 * 4. If the current path is the root (`'/'`), the path is set to `'/home'`.
 *
 * If none of the above conditions are met, the current path remains unchanged.
 *
 * @param {SDKConfig} config - The SDK configuration object.
 * @param {string} currentPath - The current path that may be modified based on the SDK configuration.
 * @returns {string} The generated path.
 */
export function generatePathFromConfig(
  config: SDKConfig,
  currentPath: string,
): string {
  // Destructure the config object for cleaner code
  const { video, loop, community, style, embed_id } = config
  // Use a switch statement for better readability and maintainability
  switch (true) {
    case video && video !== '':
      return `/video/${video}`
    case loop && loop !== '':
      return `/loop/${loop}`
    case community && community !== '':
      if (style == 'feed') {
        return `/community/${community}?feed=1`
      }
      return `/community/${community}`
    case embed_id && embed_id !== '':
      return `/embed/${embed_id}`
    case currentPath === '/':
      return '/home'
    default:
      return currentPath
  }
}

/**
 * Returns the SVG link for the given name.
 * @param name - The name of the SVG.
 * @returns The SVG link.
 */
export function getIconLink(name: string, type: string = 'svg') {
  return `https://media.begenuin.com/web-sdk/v1/icons/${name}.${type}`
}

/**
 * Returns the GIF link for the given name.
 * @param name - The name of the GIF.
 * @returns The GIF link.
 */
export function getGifLink(name: string) {
  return `https://media.begenuin.com/web-sdk/v1/icons/${name}.gif`
}

export function parseColors(colors: any) {
  const parsedColors: Record<string, string> = {}
  for (const category in colors) {
    const categoryColors = colors[category]
    for (const shade in categoryColors) {
      const colorCode = categoryColors[shade]
      const parsedShade = shade.split('_')[1]
      if (parsedShade) {
        parsedColors[`--${category}-${parsedShade}`] = colorCode
      } else {
        parsedColors[`--${category}`] = colorCode
      }
    }
  }
  return parsedColors
}

export function formatNumber(num: number) {
  if (!num) return '0'
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  } else {
    return num.toString()
  }
}

export function getAvatarUrl(avatarUrl: any) {
  if (avatarUrl) {
    return isValidHTTPS(avatarUrl)
      ? avatarUrl
      : `https://media.qa.begenuin.com/webapp_assets/assets/avatar/${avatarUrl}.gif`
  }
  return null
}

export function isValidHTTPS(link: string) {
  return link.startsWith('http') || link.startsWith('https') ? link : null
}

export function checkAndAppendHttps(link: string): string {
  return link.includes('://') ? link : 'https://' + link
}

export function getTimeAgo(createdAt: any) {
  const currentDate: any = new Date()
  const createdAtDate: any = new Date(Number(createdAt))

  const timeDifference = currentDate - createdAtDate
  const minutes = Math.floor(timeDifference / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)

  if (weeks > 0) {
    return weeks + 'w'
  } else if (days > 0) {
    return days + 'd'
  } else if (hours > 0) {
    return hours + 'h'
  } else {
    return minutes + 'm'
  }
}

export function tryJsonParse(data: string) {
  try {
    return JSON.parse(data)
  } catch (e) {
    return data
  }
}

export function encodeVideoSourceUrl(videoSource: string) {
  try {
    // Create a URL object to easily access query parameters
    const url = new URL(videoSource)
    // If there are no query parameters, return the original URL
    if (!url.search) {
      return videoSource
    }

    // Get query parameters from the URL
    const params = new URLSearchParams(url.search)

    // Encode each parameter value
    for (const [key, value] of params.entries()) {
      params.set(key, encodeURIComponent(value))
    }

    // Return the complete encoded URL
    const paramString = params.toString()
    return `${url.origin}${url.pathname}${paramString ? '?' + paramString : ''}`
  } catch (error) {
    console.error('Invalid URL:', error)
    return videoSource
  }
}

/**
 * Returns the WebP URL for the given image URL, but only if it is an upload from the genuin-ecosystem.
 *
 * If the URL is null, undefined, or does not match the expected pattern, it returns an empty string.
 *
 * Example:
 * Input: "https://media.qa.begenuin.com/uploads/thumbnails/ee1edb6f-953f-4c9c-8907-0e3db0159872_1729682640952.png"
 * Output: "https://media.qa.begenuin.com/uploads/thumbnails/webp/ee1edb6f-953f-4c9c-8907-0e3db0159872_1729682640952.webp"
 *
 * @param {string | null | undefined} url - The image URL to be converted.
 * @returns {string} The corresponding WebP URL, or an empty string if the input URL is null or undefined or empty string.
 */

export function getWebpUrlForImage(url?: string | null): string {
  if (!url) return ''
  return url.includes('/uploads/')
    ? url.replace(/(\/)([^/]+)\.([^/.]+)$/, '$1webp/$2.webp')
    : url
}

export function encryptText(text: string, appendString: boolean): string {
  const textToEncrypt = appendString ? text + ENCRYPTION_SALT : text
  const encrypted = CryptoJS.AES.encrypt(
    textToEncrypt,
    CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY),
    {
      iv: CryptoJS.enc.Utf8.parse(ENCRYPTION_IV),
    },
  )
  return encrypted.toString()
}

export function getSlidesPerView(element: Element, forFeed: boolean) {
  const elementHeight = element.clientHeight
  const elementWidth = element.clientWidth

  let ratio = 1
  // separate logic for feed and carousel
  if (forFeed) {
    // calculating video height based on elementWidth, because we have to control height for feed view.
    const videoHeight = (elementWidth - 32) * (16 / 9)
    ratio = elementHeight / videoHeight
    // if element's height is less then video height, then we have to set ratio to 1.
    if (elementHeight < videoHeight) ratio = 1
    // if ratio is less than 1, then we have to set it to 1.1.
    if (ratio < 1) ratio = 1.1
  } else {
    // calculating width based on height.
    let calculatedWidth = (9 / 16) * elementHeight
    // if calculated width is greater than element width, then we have to set it to element width.
    if (calculatedWidth > elementWidth) {
      calculatedWidth = elementWidth
    }
    // calculating ratio based on calculated width.
    ratio = elementWidth / calculatedWidth
  }
  return ratio
}

export function getApiUrl(
  pathName: string,
  searchParams: URLSearchParams = new URLSearchParams(),
) {
  const url = new URL(API_BASE_URL)
  url.pathname = pathName
  url.search = searchParams.toString()
  return url.toString()
}

export const communityRoleMapping: Record<number, CommunityJoinStatusType> = {
  1: 'leader',
  2: 'joined',
  3: 'requested',
}

export const reverseRoleMapping: Record<
  Exclude<CommunityJoinStatusType, 'unjoined' | 'requested'>,
  number
> = {
  leader: 1,
  joined: 2,
}
export function mapFeedTypeToNumber(feedType: FeedType) {
  switch (feedType) {
    case 'HOME':
      return 1
    case 'LATEST':
      return 2
    case 'POPULAR':
      return 3
  }
}

export function getBrandUrlForLogin(subdomain?: string | null) {
  if (!subdomain) return
  return `https://${subdomain}.begenuin.com/home?show_login=1`
}

/**
 * This will get us the updated version of number,
 * If number is 1000 than output will 1k.
 * @param value
 * @returns
 */
export const abbreviateNumber = (value: number) => {
  if (!value) return '0'

  let newValue = value.toString()

  if (value >= 1000) {
    const suffixes = ['', 'K', 'M', 'B', 'T']
    let suffixNum = 0

    while (value >= 1000 && suffixNum < suffixes.length - 1) {
      value /= 1000
      suffixNum++
    }

    // Ensure proper rounding to one decimal place if necessary
    if (value % 1 !== 0) {
      value = Number(value.toFixed(1))
    }

    newValue = value + suffixes[suffixNum]
  }

  return newValue
}

/**
 * This function will check if the url includes any of the protected routes.
 * @param url
 * @returns
 */
export function checkIfUrlIncludesProtectedRoute(url: string) {
  return PROTECTED_ROUTES.some((route) => url.includes(route))
}

export function getRandomAvatar() {
  const avatars = [
    'cow_face',
    'alien',
    'dog_face',
    'sloth',
    'frog',
    'hear_no_evil_monkey',
    'jack_o_lantern',
    'owl',
    'penguin',
    'rabbit_face',
    'pile_of_poo',
    'pig_face',
    'robot',
    'ghost',
    'teddy_bear',
    'smiling_face_with_horns',
    'smiling_face_with_sunglasses',
    'snowman',
  ]
  return avatars[Math.round(Math.random() * (avatars.length - 1))]
}

export function getEncryptedDeviceId() {
  try {
    const deviceId = localStorage.getItem(UNIQUE_USER_ID_KEY) ?? ''
    if (!deviceId) return undefined
    return encryptText(deviceId, true)
  } catch (e) {
    console.log('error in encryption::', e)
  }
}

export function parseUserData(
  userData: any,
  accessToken: string,
  refreshToken?: string,
): AuthUser {
  return {
    id: userData.user_id,
    isAvatar: userData.is_avatar,
    phoneNumber: userData.phone,
    nickname: userData.nickname,
    image: userData.profile_image,
    email: userData.email,
    bio: userData.bio,
    name: userData.name,
    ksCbRequestStatus: userData.ks_cb_request_status,
    isBrandSystemUser: userData.is_brand_system_user,
    brandId: userData.brand_id ?? userData.brand?.brand_id,
    accessToken,
    brandSlug: userData?.brand?.brand_slug ? userData?.brand?.brand_slug : null,
    hasTopics: userData.onboarding_topics,
    // brandGuidelines: userData.brand_guidelines,
    refreshToken,
    birth: userData.birthday,
    usernameSet: !userData.is_username_generated,
  }
}

/**
 * Determines if redirections are enabled for specific entities (loop, profile, community) based on customization settings.
 * This function should not be used outside of the context where `useBaseContext` is available, as it relies on context-specific data.
 *
 * @returns An object containing boolean flags indicating whether redirections are enabled for each entity.
 *
 * @warning This function relies on the `useBaseContext` hook and should not be used outside of a component or context where `useBaseContext` isn't available.
 */
export function getRedirectionStatusForPaths(): {
  loop?: boolean
  profile?: boolean
  community?: boolean
  brand?: boolean
} {
  const customizations = useBaseContext().customizations

  const isLoopRedirectEnabled =
    customizations?.is_enable_redirection &&
    customizations?.enable_redirection_tools?.group
  const isProfileRedirectEnabled =
    customizations?.is_enable_redirection &&
    customizations?.enable_redirection_tools?.user
  const isCommunityRedirectEnabled =
    customizations?.is_enable_redirection &&
    customizations?.enable_redirection_tools?.community
  const isBrandRedirectEnabled =
    customizations?.is_enable_redirection && customizations.enable_brand_click

  return {
    loop: isLoopRedirectEnabled,
    profile: isProfileRedirectEnabled,
    community: isCommunityRedirectEnabled,
    brand: isBrandRedirectEnabled,
  }
}

/**
 * This function maps the privacy type of the community.
 * @param privacyType - Privacy type of the community.
 */
export enum CommunityPrivacyEnum {
  PUBLIC = 1,
  PRIVATE = 2,
}

/**
 * This func returns the url for the reaction.
 * @param reaction type of reaction
 * @param isReacted if user have already reacted.
 * @returns
 */
export function getUrlForReaction(
  reaction: string,
  isReacted: boolean,
  forComment: boolean = false,
  theme: string = 'light',
) {
  return `https://media.begenuin.com/webapp_assets/reactions/${reaction}/${theme === 'dark' ? 'dark/' : ''}${forComment ? 'comment_' : 'feed_'}${
    isReacted ? 'selected' : 'unselected'
  }.svg`
}

/**
 * Modifies a reaction URL to use dark mode assets if dark theme is specified.
 * Takes a reaction URL and theme, and if theme is 'dark', inserts '/dark/' before the filename.
 * @param url - The original reaction URL to modify
 * @param theme - The theme to use ('light' or 'dark'), defaults to 'light'
 * @returns The modified URL with dark mode path if dark theme, otherwise returns original URL unchanged
 * @example
 * // Returns 'https://media.../dark/selected.svg'
 * modReactionUrlForTheme('https://media.../selected.svg', 'dark')
 */
export function modReactionUrlForTheme(url: string, theme: string = 'light') {
  if (theme != 'dark') return url
  const urlParts = url.split('/')
  const fileName = urlParts.pop()
  return urlParts.join('/') + '/dark/' + fileName
}

/**
 * This function will return titled case of the given string. Example, react => React.
 * @param str
 * @returns
 * */
export function toTitleCase(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/**
 * This function returns past tense of given word(should be verb).
 * @param word
 * @returns
 */
export function getPastTense(word: string) {
  if (/e$/.test(word)) {
    // If the word already ends in 'e', just add 'd'
    return word + 'd'
  } else if (/[^aeiou]y$/.test(word)) {
    // If the word ends in a consonant + 'y', replace 'y' with 'ied'
    return word.slice(0, -1) + 'ied'
  } else if (/([aeiou])([^aeiou])$/.test(word)) {
    // If the word ends in vowel + consonant, double the consonant and add 'ed'
    return word + word.slice(-1) + 'ed'
  } else {
    // For most cases, just add 'ed'
    return word + 'ed'
  }
}

/*
 * Find the last index in the array where the path doesn't contain "/settings"
 * @param {string[]} paths - Array of path strings
 * @returns {number} - Last index where path doesn't contain "/settings", or -1 if not found
 */
export function findLastNonSettingsIndex(paths: string[]): number {
  // Start from the last index
  for (let i = paths.length - 1; i >= 0; i--) {
    // Check if the current path doesn't include "/settings"
    if (!paths[i].includes('/settings')) {
      return i
    }
  }

  // Return -1 if all paths contain "/settings"
  return -1
}
