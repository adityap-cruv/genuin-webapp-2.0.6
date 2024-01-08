import axios from 'axios'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTimeAgo(createdAt: any) {
  const currentDate: any = new Date()
  const createdAtDate: any = new Date(createdAt)

  const timeDifference = currentDate - createdAtDate
  const seconds = Math.floor(timeDifference / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30.44)
  const years = Math.floor(months / 12)

  if (years > 0) {
    return years + 'y'
  } else if (months > 0) {
    return months + 'm'
  } else if (days > 0) {
    return days + 'd'
  } else if (hours > 0) {
    return hours + 'h'
  } else if (minutes > 0) {
    return minutes + 'min'
  } else {
    return seconds + 's'
  }
}

export function getAvatarUrl(avatarUrl: any) {
  if (avatarUrl) {
    return isValidHTTPS(avatarUrl) ? avatarUrl : `https://media.qa.begenuin.com/backend_assets/lottie/${avatarUrl}.png`
  }
  return null
}

/**
 * @returns {Boolean} if requesting client is mobile or not
 */
// export function checkIfMobile(): boolean {
//   return cookies().get('mobile')?.value === 'true'
// }

export function checkAndAppendHttps(link: string): string {
  return link.startsWith('http') || link.startsWith('https') ? link : 'https://' + link
}

export function isValidHTTPS(link: string): any {
  return link.startsWith('http') || link.startsWith('https') ? link : null
}

export const abbreviateNumber = (value: number) => {
  if (!value) return
  let newValue = value.toString()
  if (value >= 1000) {
    const suffixes = ['', 'k', 'm', 'b', 't']
    const suffixNum = Math.floor(('' + value).length / 3)
    let shortValue = 0
    for (let precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat((suffixNum !== 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(precision))
      const dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '')
      if (dotLessShortValue.length <= 2) {
        break
      }
    }
    if (shortValue % 1 !== 0) shortValue = Number(shortValue.toFixed(1))
    newValue = shortValue + suffixes[suffixNum]
  }
  return newValue
}

type UrlObjType = {
  pathname: string
  query: Array<{ key: string; value: string | undefined }>
}

function getUrlToChange(urlObj: UrlObjType) {
  const replaceUrlObj = new URL(window.location.href)
  const searchParams = new URLSearchParams(replaceUrlObj.search)
  urlObj.query.forEach((entry, index) => {
    if (entry.value) {
      searchParams.set(entry.key, entry.value)
    }
  })
  replaceUrlObj.pathname = urlObj.pathname ?? ''
  replaceUrlObj.search = urlObj.query.length > 0 ? searchParams.toString() : ''
  return replaceUrlObj.href
}

export function replaceUrlWithoutReload(urlObj: UrlObjType) {
  if (!window) return
  window.history.replaceState(null, '', getUrlToChange(urlObj))
}

export function pushUrlWithoutReload(urlObj: UrlObjType) {
  if (!window) return
  window.history.pushState(null, '', getUrlToChange(urlObj))
}

export const openGeneratedLink = (link = '') => {
  const element = document.createElement('a')
  element.setAttribute('href', link)
  element.target = '_self'
  element.click()
}

//  TODO This function line can be reduced and validation can be automated.
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
  loop
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
    query_params: queryParams,
    title,
    preview_url: previewImage,
    path_params: pathName,
  }
  if (description) {
    Object.assign(finalPayload, { description })
  }
  try {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v3/public/dynamic_link`, finalPayload)
    return res?.data?.data?.shortLink
  } catch (e) {
    return process.env.NEXT_PUBLIC_HOST_URL
  }
}
