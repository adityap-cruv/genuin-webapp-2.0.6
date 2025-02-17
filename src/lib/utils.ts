import { DownloadDialogModal } from '@components/common/modals/download-app'
import { axiosInstance } from '@/lib/api/instance'
import { type ClassValue, clsx } from 'clsx'
import { createCipheriv } from 'crypto'
import { twMerge } from 'tailwind-merge'
import { useGenuinOptions } from './stores/genuin-options'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { type ReactNode } from 'react'
import { INDUSTRY, type IndustryName, PROTECTED_ROUTES, MOBILE_DOWNLOAD_APP_LINK } from './constants'
import { type CommunityUserRoleType } from './schemas/roles'
import { getAppLink } from './get-deeplink'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLoopAndCommunityShareString(shareUrl: string) {
  const urlObj = new URL(shareUrl)
  const loopShareString = urlObj.searchParams.get('loop')
  const communityShareString = urlObj.searchParams.get('community')
  return { loopShareString, communityShareString }
}

/**
 * This function is used to open the modal for the user to download the app or if web is used in whitelabel or subdomain it will open authentication.
 * @param param0
 */
export function openModal({
  title,
  subtitle,
  deepLink,
}: {
  title?: string | ReactNode
  subtitle?: string | ReactNode
  deepLink?: string
}) {
  const { webCTA, isMobile } = useGenuinOptions.getState()

  if (webCTA !== 'app') {
    AuthenticationModal.open()
  } else {
    if (!isMobile) {
      DownloadDialogModal.open({
        title,
        subtitle,
        deepLink: deepLink ?? '',
      })
    } else {
      openGeneratedLink(deepLink)
    }
  }
}

export function deleteSearchParam({
  pathName,
  searchParams,
  paramsToDelete,
}: {
  pathName: string
  searchParams: string
  paramsToDelete: string[]
}) {
  const searchParamObject = new URLSearchParams(searchParams)

  paramsToDelete.forEach((param) => {
    searchParamObject.delete(param)
  })

  if (searchParamObject.size === 0) {
    window.history.replaceState('', '', `${pathName}`)
  } else {
    window.history.replaceState('', '', `${pathName}?${searchParamObject.toString()}`)
  }
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

export function getAvatarUrl(avatarUrl: any) {
  if (avatarUrl) {
    return isValidHTTPS(avatarUrl)
      ? avatarUrl
      : `https://media.qa.begenuin.com/webapp_assets/assets/avatar/${avatarUrl}.gif`
  }
  return null
}

export function checkAndAppendHttps(link: string): string {
  return link?.startsWith('http') || link?.startsWith('https')
    ? link
    : (process.env.NEXT_PUBLIC_CURRENT_ENV === 'local' ? 'http://' : 'https://') + link
}

export function isValidHTTPS(link: string) {
  return link.startsWith('http') || link.startsWith('https') ? link : null
}

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

// Not used anywhere rn.
// type UrlObjType = {
//   pathname: string
//   query: Array<{ key: string; value: string | undefined }>
// }

// Not used anywhere rn.
// function getUrlToChange(urlObj: UrlObjType) {
//   const replaceUrlObj = new URL(window.location.href)
//   const searchParams = new URLSearchParams(replaceUrlObj.search)
//   urlObj.query.forEach((entry, index) => {
//     if (entry.value) {
//       searchParams.set(entry.key, entry.value)
//     }
//   })
//   replaceUrlObj.pathname = urlObj.pathname ?? ''
//   replaceUrlObj.search = urlObj.query.length > 0 ? searchParams.toString() : ''
//   return replaceUrlObj.href
// }

export function replaceUrlWithoutReload(url: URL) {
  if (!window) return
  window.history.replaceState(null, '', url.href)
}

// Not used anywhere rn.
// export function pushUrlWithoutReload(urlObj: UrlObjType) {
//   if (!window) return
//   window.history.pushState(null, '', getUrlToChange(urlObj))
// }

export const openGeneratedLink = (link = '') => {
  setTimeout(() => {
    window.open(link, '_blank', 'noopener,noreferrer')
  })
}

//  TODO: This function line can be reduced and validation can be automated.
export const generateDeepLink = async ({
  utmCampaign,
  utmSource,
  utmMedium,
  action,
  // sourceId,
  contentType,
  title,
  description,
  previewImage,
  pathName,
  fromUserName,
  // parentId,
  community,
  loop,
  searchParams,
}: any) => {
  const queryParams = {}
  if (utmCampaign) {
    Object.assign(queryParams, { utm_campaign: utmCampaign })
  }
  if (utmSource) {
    Object.assign(queryParams, { utm_source: utmSource })
  }
  if (utmMedium) {
    Object.assign(queryParams, { utm_medium: utmMedium })
  }
  if (action) {
    Object.assign(queryParams, { action })
  }
  // if (sourceId) {
  //   Object.assign(queryParams, { source_id: sourceId })
  // }
  if (contentType) {
    Object.assign(queryParams, { content_type: contentType })
  }
  if (fromUserName) {
    Object.assign(queryParams, { from_username: fromUserName })
  }
  // if (parentId) {
  //   Object.assign(queryParams, { parent_id: parentId })
  // }

  if (community) {
    Object.assign(queryParams, { community })
  }
  if (loop) {
    Object.assign(queryParams, { loop })
  }
  const finalPayload = {
    query_params: { ...queryParams, ...searchParams },
    title,
    preview_url: previewImage,
    path_params: pathName,
  }
  if (description) {
    Object.assign(finalPayload, { description })
  }
  try {
    const res = await axiosInstance.post(
      `${process.env.NEXT_PUBLIC_API_URL}/goservices/links/dynamic_link`,
      finalPayload
    )
    return res?.data?.data?.shortLink
  } catch (e) {
    return process.env.NEXT_PUBLIC_HOST_URL
  }
}

// TODO: Not used anywhere rn.
export function getParentUrl(url: string): string {
  const urlObj = new URL(url)
  let path = urlObj.pathname
  path = path.startsWith('/') ? path.slice(1, path.length) : path
  path = path.endsWith('/') ? path.slice(0, path.length - 1) : path
  const arr = path.split('/')
  if (arr.length < 3) return url
  return urlObj.hostname + '/' + arr[arr.length - 3]
}

/**
 * This function will return share url from window.location.href.
 * Call this function client side only.
 * Make sure window object is there.
 */
export function getCurrentShareUrl({ url }: { url: string }) {
  const urlObj = new URL(url)
  urlObj.searchParams.append('utm_source', 'app_web')
  return urlObj.href
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

export function shortenedEmail(email?: string) {
  if (!email) return ''
  const splitArr = email.split('@')
  let name = splitArr[0]
  name = name.length > 12 ? name.slice(0, 12) + '...' : name
  return name + '@' + splitArr[1]
}

export function encryptText(text: string, appendString: boolean) {
  // Extracting common variables
  const iv = Buffer.from(process.env.NEXT_PUBLIC_AES_IV)
  const key = Buffer.from(process.env.NEXT_PUBLIC_AES_KEY)

  // Appending secret string if needed
  const textToEncrypt = appendString ? text + process.env.NEXT_PUBLIC_SECRET_STRING : text

  // Creating Cipher
  const cipher = createCipheriv('aes-256-cbc', key, iv)

  // Updating encrypted text
  let encrypted = cipher.update(Buffer.from(textToEncrypt))
  encrypted = Buffer.concat([encrypted, cipher.final()])

  // Returning base64 encoded encrypted text
  return encrypted.toString('base64')
}

export function parseColors(colors: any) {
  const parsedColors: any = {}
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

export function tryJsonParse(data: string) {
  try {
    return JSON.parse(data)
  } catch (e) {
    return data
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
  return url.includes('/uploads/') ? url.replace(/(\/)([^/]+)\.([^/.]+)$/, '$1webp/$2.webp') : url
}

/**
 * This function will check if the url includes any of the protected routes.
 * @param url
 * @returns
 */
export function checkIfUrlIncludesProtectedRoute(url: string) {
  return PROTECTED_ROUTES.some((route) => url.includes(route))
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

/*
 * This function maps the role of the user in the community.
 * @param role - Role of the user in the community.
 * @param isRequested - If the user has requested to join the community.
 */
export function mapCommunityUserRole(role?: number | null, isRequested?: boolean | null): CommunityUserRoleType {
  // If isRequested is true, return 'REQUESTED'.
  if (isRequested) return 'REQUESTED'

  switch (role) {
    case 1:
      return 'LEADER'
    case 2:
      return 'MEMBER'
    case 3:
      return 'MODERATOR'
    // If role is null or anything other than above cases than return 'UNJOINED'.
    default:
      return 'UNJOINED'
  }
}

export function getYear() {
  return new Date().getFullYear()
}

export function getIndustryName(industryType: number | undefined): IndustryName {
  let industryName: IndustryName =
    (Object.keys(INDUSTRY) as IndustryName[]).find((key) => INDUSTRY[key] === industryType) ?? 'Food'

  if (!['Food', 'Healthcare', 'Fintech'].includes(industryName)) {
    industryName = 'Food'
  }

  return industryName
}

export async function getMobileGetAppUrl() {
  await getAppLink().then((generatedLink) => {
    openGeneratedLink(generatedLink ?? MOBILE_DOWNLOAD_APP_LINK)
  })
}
