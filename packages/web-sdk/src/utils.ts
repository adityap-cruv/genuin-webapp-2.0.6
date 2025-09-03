import { AuthUser } from '@genuin/components/types/auth'
import {
  EmbedDataType,
  PlacementDataResponse,
} from '@genuin/components/context/embed/embed.types'

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
 * Converts PlacementDataResponse to EmbedDataType format.
 *
 * This function maps all available data from PlacementDataResponse to EmbedDataType,
 * ensuring comprehensive data transfer while handling missing fields gracefully.
 *
 * Mappings include:
 * - Basic placement info (_id, name, type, brand_id, etc.)
 * - Web environment configuration (dimensions, engagement tools, redirection tools)
 * - Video and media settings (autoplay, carousel style, aspect ratio)
 * - UI visibility settings (username, social interactions, navigation)
 * - Community and layout configurations
 * - Adaptive video and style fallback settings
 *
 * @param data - PlacementDataResponse containing placement configuration
 * @returns EmbedDataType with all available data mapped
 */
export function parsePlacementToEmbedData(
  data: PlacementDataResponse,
  styleId: string,
): EmbedDataType {
  const webConfig = data.environments?.web
  const configureView = webConfig?.configure_view
  const expandView = webConfig?.expand_view

  return {
    // Direct mapping from PlacementDataResponse
    _id: data._id,
    name: data.name,
    style: data.type ?? 'grid',
    type: (data.feed_type as EmbedDataType['type']) ?? 'loop_feed',
    brand_id: data.brand_id,
    __v: data.__v,
    is_live: data.is_live,

    // Map brand_ids from placement_brand_ids
    brand_ids: data.placement_brand_ids,

    // Map aspect ratio from configure_view
    aspect_ratio: configureView?.aspect_ratio,

    // Map adaptive video setting
    enable_adaptive_video: configureView?.enable_adaptive_video,

    // Map layout IDs properly
    card_layout_id: configureView?.card_layout_id ?? 1,
    video_layout_id: configureView?.video_layout_id ?? 1,

    placement_card_layout_id: configureView?.placement_card_layout_id,
    placement_video_layout_id: configureView?.placement_video_layout_id,
    placement_card_section_layout_id:
      configureView?.placement_card_section_layout_id,

    customization: {
      // Dimensions mapping
      dimensions: {
        auto_fit_height: configureView?.dimensions.auto_fit_height,
        width: configureView?.dimensions?.width ?? 0,
        height: configureView?.dimensions?.height ?? 0,
      },

      // CTA button (not present in PlacementDataResponse, keeping as null)
      cta_button: null,

      // Engagement tools mapping from expand_view
      enable_engagement_tools: {
        repost: expandView?.enable_engagement_tools?.repost ?? false,
        spark: expandView?.enable_engagement_tools?.spark ?? false,
        comment: expandView?.enable_engagement_tools?.comment ?? false,
        share: expandView?.enable_engagement_tools?.share ?? false,
      },

      // Redirection tools mapping from expand_view
      enable_redirection_tools: {
        community: expandView?.enable_redirection_tools?.community ?? false,
        group: expandView?.enable_redirection_tools?.group ?? false,
        user: expandView?.enable_redirection_tools?.user ?? false,
      },

      // Links configuration
      links: {
        is_show_links: configureView?.show_links ?? false,
        position: 'overlay' as const, // Default as PlacementDataResponse doesn't have position
      },

      // Carousel style mapping
      carousel_style: configureView?.carousel_style ?? 'default',

      // Media play settings
      autoplay: configureView?.media_play?.enable_autoplay ?? false,

      // Display preferences
      feed_display_pref: 'default',

      // Heading and sub-heading from styles
      heading:
        data.styles?.find((style) => style._id === styleId)?.title || null,
      heading_text_color: configureView?.heading_text_color,
      sub_heading:
        data.styles?.find((style) => style._id === styleId)?.sub_title || null,
      sub_heading_text_color: configureView?.sub_heading_text_color,

      // UI element visibility
      is_carousel_icon: configureView?.is_carousel_icon ?? false,
      is_floating_view: configureView?.is_floating_view ?? false,
      is_expanded_view: configureView?.is_expanded_view ?? false,
      is_show_username:
        // configureView?.is_show_username ??
        // configureView?.show_username ??
        false,
      is_show_view_count:
        // configureView?.is_show_view_count ??
        false,
      is_show_social_interaction_data:
        // configureView?.is_show_social_interaction_data ??
        // configureView?.show_social_interaction_data ??
        false,

      // Video settings
      is_loop_video: false, // Not directly available in PlacementDataResponse
      is_popup_view: false, // Not available in PlacementDataResponse
      video_crop: false, // Not available in PlacementDataResponse

      // Engagement and redirection flags
      is_enable_engagement_tools:
        expandView?.is_enable_engagement_tools ?? false,
      is_enable_redirection: expandView?.is_enable_redirection ?? false,

      // Community and navigation settings
      show_side_panel: false, // Not available in PlacementDataResponse
      show_join_community_button:
        configureView?.show_join_community_button ?? false,
      show_community_share_button:
        configureView?.show_community_share_button ?? false,
      show_navigation: configureView?.show_navigation ?? false,

      // Additional show settings available in CustomizationType
      show_share_icon: false, // Not available in PlacementDataResponse
      show_view_loop_button: false, // Not available in PlacementDataResponse
      show_comments_section: false, // Not available in PlacementDataResponse

      // Brand and community interaction settings
      enable_brand_click: false, // Not available in PlacementDataResponse
      enable_community_click: false, // Not available in PlacementDataResponse

      // Popup settings
      is_show_popup_by_default: false, // Not available in PlacementDataResponse

      // Theme setting (not available in PlacementDataResponse)
      // theme: 'light' as const,

      // Community data
      community_ids: data.community_ids,
      community_loop_ids: data.community_loop_ids.map((id) => ({
        loop_id: id,
        community_id: id, // Assuming same ID, adjust if different structure
      })),
    },

    // Additional placement-specific data that might be useful
    // placement_id: data._id, // Store original placement ID
    // environment: 'web', // Since we're using web config

    // Styles information (first style if available)
    // style_id: data.styles?.[0]?._id,

    // New fields mapped from PlacementDataResponse
    feed_type: data.feed_type,
    created_at: data.created_at,
    updated_at: data.updated_at,
    styles: data.styles,

    // Grid layout configuration
    grid_layout: configureView?.grid_layout
      ? {
          auto_adjust: configureView.grid_layout.auto_adjust,
          column: configureView.grid_layout.column,
          row: configureView.grid_layout.row,
        }
      : undefined,
    grid_auto_advance_playback:
      configureView.media_play.auto_advance_playback ?? 3,
    grid_enable_loop_video: configureView.media_play.enable_loop_video ?? false,

    // Implementation guide settings
    implementation_guide: webConfig?.implementation_guide
      ? {
          is_on_page_context_fetch:
            webConfig.implementation_guide.is_on_page_context_fetch,
          is_real_time_context_fetch:
            webConfig.implementation_guide.is_real_time_context_fetch,
          show_brand_id: webConfig.implementation_guide.show_brand_id,
          show_community_group_id:
            webConfig.implementation_guide.show_community_group_id,
          show_custom_context:
            webConfig.implementation_guide.show_custom_context,
          show_location: webConfig.implementation_guide.show_location,
          show_pdp_url: webConfig.implementation_guide.show_pdp_url,
          show_place: webConfig.implementation_guide.show_place,
          show_posted_by_user:
            webConfig.implementation_guide.show_posted_by_user,
          show_style_id: webConfig.implementation_guide.show_style_id,
          show_time: webConfig.implementation_guide.show_time,
          show_user_interests:
            webConfig.implementation_guide.show_user_interests,
          show_user_segmentation:
            webConfig.implementation_guide.show_user_segmentation,
        }
      : undefined,

    // Report options and settings
    report_options: expandView?.report_options
      ? {
          inappropriate_content:
            expandView.report_options.inappropriate_content,
          non_professional_content:
            expandView.report_options.non_professional_content,
          other: expandView.report_options.other,
          spam: expandView.report_options.spam,
          threatening_violent: expandView.report_options.threatening_violent,
        }
      : undefined,

    enable_report: expandView?.enable_report,
    enable_style_fallback: configureView?.enable_style_fallback,
    is_show_video_thumbnail: configureView?.is_show_video_thumbnail,
    show_video_duration: configureView?.show_video_duration,
    is_show_metrics: configureView?.is_show_metrics,
  }
}

export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

// /**
//  * Generates a URL with specified parameters.
//  * @param path - The path to append to the base URL.
//  * @param params - The parameters to include in the URL.
//  * @param subdomain - The ID of the brand.
//  * @returns The generated URL.
//  */
// export function generateConfiguredUrl(
//   path: string,
//   params: Record<string, string | boolean | number | undefined>,
//   subdomain: string,
// ): string {
//   return buildQueryString(generateBrandURL(subdomain) + path, params)
// }

// /**
//  * Generates a basic URL without additional parameters.
//  * @param path - The path to append to the base URL.
//  * @param brandId - The ID of the brand.
//  * @returns The generated URL.
//  */
// export function generateBasicUrl(path: string, brandId: string): string {
//   // Construct the basic URL without additional parameters
//   const url = `${generateBrandURL(brandId)}${path}`

//   return url
// }

// /**
//  * Builds a query string by encoding and appending non-undefined parameters to the given path.
//  * @param path - The path to append the query string to.
//  * @param params - The parameters to include in the query string.
//  * @returns The path with the encoded query string.
//  */
// function buildQueryString(
//   path: string,
//   params: Record<string, string | boolean | number | undefined>,
// ): string {
//   // Filter out undefined values from the parameters
//   const filteredParams = Object.entries(params)
//     .filter(([, value]) => value !== undefined)
//     .map(
//       ([key, value]) =>
//         `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`,
//     )
//     .join('&')

//   // Check if the path already has a query string
//   const separator = path.includes('?') ? '&' : '?'

//   // Concatenate the path and the encoded query string
//   const url = `${path}${separator}${filteredParams}`

//   return url
// }

// /**
//  * Extracts paths and query parameters from a URL.
//  * @param url - The URL to extract paths and query parameters from.
//  * @returns An object containing paths and query parameters, or null if invalid.
//  */
// export function extractPathsAndParams(
//   url: string,
// ): { paths: string[]; queryParams: { key: string; value: string }[] } | null {
//   try {
//     // Use the URL constructor directly to avoid creating unnecessary objects.
//     const urlObj = new URL(url)

//     // Filter out empty path segments.
//     const paths = urlObj.pathname.split('/').filter((path) => path !== '')

//     // Check if the second last path is in the specified list.
//     const validSecondLastPaths = [
//       'community',
//       'profile',
//       'loop',
//       'video',
//       'embed',
//     ]
//     const lastTwoPaths = validSecondLastPaths.includes(paths[paths.length - 2])
//       ? paths.slice(-2)
//       : []

//     // Use the map function to simplify the creation of queryParams array.
//     const queryParams: { key: string; value: string }[] = Array.from(
//       urlObj.searchParams.entries(),
//     ).map(([key, value]) => ({ key, value }))

//     return { paths: lastTwoPaths, queryParams }
//     /* eslint-disable @typescript-eslint/no-explicit-any */
//   } catch (error: any) {
//     console.error('Invalid URL format:', error.message)
//     return null
//   }
// }

// /**
//  * Generates a path based on the provided SDK configuration and current path.
//  *
//  * Conditions are checked in the following sequence:
//  * 1. If video_id is present and not an empty string, the path is set to `/video/${video_id}`.
//  * 2. If loop_id is present and not an empty string, the path is set to `/loop/${loop_id}`.
//  * 3. If community_id is present and not an empty string, the path is set to `/community/${community_id}`.
//  * 4. If the current path is the root (`'/'`), the path is set to `'/home'`.
//  *
//  * If none of the above conditions are met, the current path remains unchanged.
//  *
//  * @param {SDKConfig} config - The SDK configuration object.
//  * @param {string} currentPath - The current path that may be modified based on the SDK configuration.
//  * @returns {string} The generated path.
//  */
// export function generatePathFromConfig(
//   config: SDKConfig,
//   currentPath: string,
// ): string {
//   // Destructure the config object for cleaner code
//   const { video, loop, community, style, embed_id } = config
//   // Use a switch statement for better readability and maintainability
//   switch (true) {
//     case video && video !== '':
//       return `/video/${video}`
//     case loop && loop !== '':
//       return `/loop/${loop}`
//     case community && community !== '':
//       if (style == 'feed') {
//         return `/community/${community}?feed=1`
//       }
//       return `/community/${community}`
//     case embed_id && embed_id !== '':
//       return `/embed/${embed_id}`
//     case currentPath === '/':
//       return '/home'
//     default:
//       return currentPath
//   }
// }

// /**
//  * Returns the SVG link for the given name.
//  * @param name - The name of the SVG.
//  * @returns The SVG link.
//  */
// export function getIconLink(name: string, type: string = 'svg') {
//   return `${MEDIA_BASE_URL}/web-sdk/v1/icons/${name}.${type}`
// }

// /**
//  * Returns the GIF link for the given name.
//  * @param name - The name of the GIF.
//  * @returns The GIF link.
//  */
// export function getGifLink(name: string) {
//   return `${MEDIA_BASE_URL}/web-sdk/v1/icons/${name}.gif`
// }

// export function formatNumber(num: number) {
//   if (!num) return '0'
//   if (num >= 1000000) {
//     return (num / 1000000).toFixed(1) + 'M'
//   } else if (num >= 1000) {
//     return (num / 1000).toFixed(1) + 'k'
//   } else {
//     return num.toString()
//   }
// }

// export function getAvatarUrl(avatarUrl: any) {
//   if (avatarUrl) {
//     return isValidHTTPS(avatarUrl)
//       ? avatarUrl
//       : `${MEDIA_BASE_URL}/webapp_assets/assets/avatar/${avatarUrl}.gif`
//   }
//   return null
// }

// export function isValidHTTPS(link: string) {
//   return link.startsWith('http') || link.startsWith('https') ? link : null
// }

// export function checkAndAppendHttps(link: string): string {
//   return link.includes('://') ? link : 'https://' + link
// }

// /**
//  * Sanitizes user input to prevent XSS attacks
//  * Only allows plain text by escaping dangerous HTML characters
//  * @param input - The user input to sanitize
//  * @returns Sanitized plain text string
//  */
// export function sanitizeInput(input: string | null | undefined): string {
//   if (typeof input !== 'string' || input.trim() === '') return ''
//   return DOMPurify.sanitize(input, {
//     USE_PROFILES: { html: false },
//   })
// }

// export function getTimeAgo(createdAt: any) {
//   const currentDate: any = new Date()
//   const createdAtDate: any = new Date(Number(createdAt))

//   const timeDifference = currentDate - createdAtDate
//   const minutes = Math.floor(timeDifference / (1000 * 60))
//   const hours = Math.floor(minutes / 60)
//   const days = Math.floor(hours / 24)
//   const weeks = Math.floor(days / 7)

//   if (weeks > 0) {
//     return weeks + 'w'
//   } else if (days > 0) {
//     return days + 'd'
//   } else if (hours > 0) {
//     return hours + 'h'
//   } else {
//     return minutes + 'm'
//   }
// }

// export function tryJsonParse(data: string) {
//   try {
//     return JSON.parse(data)
//   } catch (e) {
//     return data
//   }
// }

// export function encodeVideoSourceUrl(videoSource: string) {
//   try {
//     // Create a URL object to easily access query parameters
//     const url = new URL(videoSource)
//     // If there are no query parameters, return the original URL
//     if (!url.search) {
//       return videoSource
//     }

//     // Get query parameters from the URL
//     const params = new URLSearchParams(url.search)

//     // Encode each parameter value
//     for (const [key, value] of params.entries()) {
//       params.set(key, encodeURIComponent(value))
//     }

//     // Return the complete encoded URL
//     const paramString = params.toString()
//     return `${url.origin}${url.pathname}${paramString ? '?' + paramString : ''}`
//   } catch (error) {
//     console.error('Invalid URL:', error)
//     return videoSource
//   }
// }

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

// export function getWebpUrlForImage(url?: string | null): string {
//   if (!url) return ''
//   return url
//   // return url.includes('/uploads/')
//   //   ? url.replace(/(\/)([^/]+)\.([^/.]+)$/, '$1webp/$2.webp')
//   //   : url
// }

// export function encryptText(text: string, appendString: boolean): string {
//   const textToEncrypt = appendString ? text + ENCRYPTION_SALT : text
//   const encrypted = CryptoJS.AES.encrypt(
//     textToEncrypt,
//     CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY),
//     {
//       iv: CryptoJS.enc.Utf8.parse(ENCRYPTION_IV),
//     },
//   )
//   return encrypted.toString()
// }

// export function getSlidesPerView(
//   element: Element | undefined,
//   forFeed: boolean,
// ) {
//   if (!element) return 1 // Default to 1 if element is not found
//   const elementHeight = element.clientHeight
//   const elementWidth = element.clientWidth

//   let ratio = 1
//   // separate logic for feed and carousel
//   if (forFeed) {
//     // calculating video height based on elementWidth, because we have to control height for feed view.
//     const videoHeight = (elementWidth - 32) * (16 / 9)
//     ratio = elementHeight / videoHeight
//     // if element's height is less then video height, then we have to set ratio to 1.
//     if (elementHeight < videoHeight) ratio = 1
//     // if ratio is less than 1, then we have to set it to 1.1.
//     if (ratio < 1) ratio = 1.1
//   } else {
//     // calculating width based on height.
//     let calculatedWidth = (9 / 16) * elementHeight
//     // if calculated width is greater than element width, then we have to set it to element width.
//     if (calculatedWidth > elementWidth) {
//       calculatedWidth = elementWidth
//     }
//     // calculating ratio based on calculated width.
//     ratio = elementWidth / calculatedWidth
//   }
//   return ratio
// }

// export function getApiUrl(
//   pathName: string,
//   searchParams: URLSearchParams = new URLSearchParams(),
// ) {
//   const url = new URL(API_BASE_URL)
//   url.pathname = pathName
//   url.search = searchParams.toString()
//   return url.toString()
// }

// export const communityRoleMapping: Record<number, CommunityJoinStatusType> = {
//   1: 'leader',
//   2: 'joined',
//   3: 'requested',
// }

// export const reverseRoleMapping: Record<
//   Exclude<CommunityJoinStatusType, 'unjoined' | 'requested'>,
//   number
// > = {
//   leader: 1,
//   joined: 2,
// }
// export function mapFeedTypeToNumber(feedType: FeedType) {
//   switch (feedType) {
//     case 'HOME':
//       return 1
//     case 'LATEST':
//       return 2
//     case 'POPULAR':
//       return 3
//   }
// }

// export function getBrandUrlForLogin(subdomain?: string | null) {
//   if (!subdomain) return
//   return `https://${subdomain}.begenuin.com/home?show_login=1`
// }

// /**
//  * This will get us the updated version of number,
//  * If number is 1000 than output will 1k.
//  * @param value
//  * @returns
//  */
// export const abbreviateNumber = (value: number) => {
//   if (!value) return '0'

//   let newValue = value.toString()

//   if (value >= 1000) {
//     const suffixes = ['', 'K', 'M', 'B', 'T']
//     let suffixNum = 0

//     while (value >= 1000 && suffixNum < suffixes.length - 1) {
//       value /= 1000
//       suffixNum++
//     }

//     // Ensure proper rounding to one decimal place if necessary
//     if (value % 1 !== 0) {
//       value = Number(value.toFixed(1))
//     }

//     newValue = value + suffixes[suffixNum]
//   }

//   return newValue
// }

/**
 * This function will check if the url includes any of the protected routes.
 * @param url
 * @returns
 */
// export function checkIfUrlIncludesProtectedRoute(url: string) {
//   return PROTECTED_ROUTES.some((route) => url.includes(route))
// }

// export function getRandomAvatar() {
//   const avatars = [
//     'cow_face',
//     'alien',
//     'dog_face',
//     'sloth',
//     'frog',
//     'hear_no_evil_monkey',
//     'jack_o_lantern',
//     'owl',
//     'penguin',
//     'rabbit_face',
//     'pile_of_poo',
//     'pig_face',
//     'robot',
//     'ghost',
//     'teddy_bear',
//     'smiling_face_with_horns',
//     'smiling_face_with_sunglasses',
//     'snowman',
//   ]
//   return avatars[Math.round(Math.random() * (avatars.length - 1))]
// }

// export function getEncryptedDeviceId() {
//   try {
//     const deviceId = localStorage.getItem(UNIQUE_USER_ID_KEY) ?? ''
//     if (!deviceId) return undefined
//     return encryptText(deviceId, true)
//   } catch (e) {
//     console.log('error in encryption::', e)
//   }
// }

/**
 * Determines if redirections are enabled for specific entities (loop, profile, community) based on customization settings.
 *
 * @deprecated This function relied on the old base context and is no longer functional.
 * @returns An object containing boolean flags indicating whether redirections are enabled for each entity.
 */
// export function getRedirectionStatusForPaths(): {
//   loop?: boolean
//   profile?: boolean
//   community?: boolean
//   brand?: boolean
// } {
//   // This function is deprecated - returning default values
//   console.warn(
//     'getRedirectionStatusForPaths is deprecated - use shared components instead',
//   )

//   return {
//     loop: false,
//     profile: false,
//     community: false,
//     brand: false,
//   }
// }

/**
 * This function maps the privacy type of the community.
 * @param privacyType - Privacy type of the community.
 */
// export enum CommunityPrivacyEnum {
//   PUBLIC = 1,
//   PRIVATE = 2,
// }

/**
 * This func returns the url for the reaction.
 * @param reaction type of reaction
 * @param isReacted if user have already reacted.
 * @returns
 */
// export function getUrlForReaction(
//   reaction: string,
//   isReacted: boolean,
//   forComment: boolean = false,
//   theme: string = 'light',
// ) {
//   return `${MEDIA_BASE_URL}/webapp_assets/reactions/${reaction}/${theme === 'dark' ? 'dark/' : ''}${forComment ? 'comment_' : 'feed_'}${
//     isReacted ? 'selected' : 'unselected'
//   }.svg`
// }

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
// export function modReactionUrlForTheme(url: string, theme: string = 'light') {
//   if (theme != 'dark') return url
//   const urlParts = url.split('/')
//   const fileName = urlParts.pop()
//   return urlParts.join('/') + '/dark/' + fileName
// }

// /**
//  * This function will return titled case of the given string. Example, react => React.
//  * @param str
//  * @returns
//  * */
// export function toTitleCase(word: string) {
//   return word.charAt(0).toUpperCase() + word.slice(1)
// }

/**
 * This function returns past tense of given word(should be verb).
 * @param word
 * @returns
//  */
// export function getPastTense(word: string) {
//   if (/e$/.test(word)) {
//     // If the word already ends in 'e', just add 'd'
//     return word + 'd'
//   } else if (/[^aeiou]y$/.test(word)) {
//     // If the word ends in a consonant + 'y', replace 'y' with 'ied'
//     return word.slice(0, -1) + 'ied'
//   } else if (/([aeiou])([^aeiou])$/.test(word)) {
//     // If the word ends in vowel + consonant, double the consonant and add 'ed'
//     return word + word.slice(-1) + 'ed'
//   } else {
//     // For most cases, just add 'ed'
//     return word + 'ed'
//   }
// }

/*
 * Find the last index in the array where the path doesn't contain "/settings"
 * @param {string[]} paths - Array of path strings
 * @returns {number} - Last index where path doesn't contain "/settings", or -1 if not found
 */
// export function findLastNonSettingsIndex(paths: string[]): number {
//   // Start from the last index
//   for (let i = paths.length - 1; i >= 0; i--) {
//     // Check if the current path doesn't include "/settings"
//     if (!paths[i].includes('/settings')) {
//       return i
//     }
//   }

//   // Return -1 if all paths contain "/settings"
//   return -1
// }

// export const openGeneratedLink = (link = '') => {
//   setTimeout(() => {
//     const formattedLink = link.startsWith('http')
//       ? link
//       : `http://${link.replace('//', '/')}`
//     window.open(formattedLink, '_blank', 'noopener,noreferrer')
//   })
// }

/**
 * Detects the user's platform based on the `navigator.userAgent` string.
 *
 * @returns {string} - Returns "Android" if the user is on an Android device,
 *                     "iOS" if on an iPhone, iPad, or iPod, and "Web" otherwise.
 */
// export const getPlatform = () => {
//   if (typeof navigator !== 'undefined') {
//     const userAgent = navigator.userAgent || navigator.vendor

//     if (/android/i.test(userAgent)) {
//       return 'Android'
//     }
//     if (/iPhone|iPad|iPod/i.test(userAgent)) {
//       return 'iOS'
//     }
//   }
//   return 'Web'
// }

// export function getLoopAndCommunityShareString(shareUrl: string) {
//   const urlObj = new URL(shareUrl)
//   const loopShareString = urlObj.searchParams.get('loop')
//   const communityShareString = urlObj.searchParams.get('community')
//   return { loopShareString, communityShareString }
// }

/**
 * Validates if a file is a genuine image (JPEG or PNG) by examining both its
 * reported MIME type and its binary signature (magic numbers).
 *
 * @param file - The File object to validate, typically from file input or drag-and-drop
 * @returns A Promise that resolves to boolean - true if valid image, false otherwise
 */

// export async function validateImage(file: File): Promise<boolean> {
//   try {
//     // Check MIME type reported by the browser
//     const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png']
//     if (!validMimeTypes.includes(file.type)) {
//       return false
//     }

//     // Read the first few bytes to check for image signatures (magic numbers)
//     const buffer = await readFileAsArrayBuffer(file.slice(0, 12))
//     const arr = new Uint8Array(buffer)

//     // Check for JPEG signature (FF D8 FF)
//     if (arr[0] === 0xff && arr[1] === 0xd8 && arr[2] === 0xff) {
//       return true
//     }

//     // Check for PNG signature (89 50 4E 47 0D 0A 1A 0A)
//     if (
//       arr[0] === 0x89 &&
//       arr[1] === 0x50 &&
//       arr[2] === 0x4e &&
//       arr[3] === 0x47 &&
//       arr[4] === 0x0d &&
//       arr[5] === 0x0a &&
//       arr[6] === 0x1a &&
//       arr[7] === 0x0a
//     ) {
//       return true
//     }
//     return false
//   } catch (err) {
//     return false
//   }
// }

// function readFileAsArrayBuffer(file: Blob): Promise<ArrayBuffer> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader()
//     reader.onload = () => resolve(reader.result as ArrayBuffer)
//     reader.onerror = reject
//     reader.readAsArrayBuffer(file)
//   })
// }

// /**
//  * Determines if the provided brand ID corresponds to a "fifth video type" brand.
//  *
//  * @param params - An object containing the brand ID to check.
//  * @param params.brandId - The brand ID to evaluate. Can be a number or undefined.
//  * @returns `true` if the brand ID is either 2883 or 2922; otherwise, `false`.
//  */
// export function isCheckFifthVideoType(
//   brandId: number | string | undefined,
// ): boolean {
//   const parsedBrandId = Number(brandId)

//   if (!isNaN(parsedBrandId) && [2883, 2922, 2357].includes(parsedBrandId)) {
//     return true
//   }
//   return false
// }

// /**
//  * Resolves the appropriate video URL based on brand preferences and availability.
//  *
//  * Certain brands prefer MP4 format over M3U8. For these brands, MP4 URL is returned
//  * if available. For all other brands, M3U8 URL is preferred, with MP4 as fallback.
//  *
//  * @param params - Configuration object for video URL resolution
//  * @param params.brandId - The brand identifier (number or string)
//  * @param params.m3u8VideoUrl - The M3U8 streaming video URL
//  * @param params.mp4VideoUrl - The MP4 video URL
//  * @returns The preferred video URL based on brand configuration, or undefined if no URLs available
//  */
// export function resolveVideoUrl(
//   brandId: number | string | undefined,
//   m3u8VideoUrl: string | undefined,
//   mp4VideoUrl: string | undefined,
// ): string | undefined {
//   // Brands that prefer MP4 format over M3U8
//   const mp4PreferredBrands = [2750] // Add more brand IDs as needed

//   const parsedBrandId = Number(brandId)

//   // Check if brand prefers MP4 format
//   if (!isNaN(parsedBrandId) && mp4PreferredBrands.includes(parsedBrandId)) {
//     return mp4VideoUrl
//   }

//   // Default behavior: prefer M3U8, fallback to MP4
//   return m3u8VideoUrl || mp4VideoUrl
// }
