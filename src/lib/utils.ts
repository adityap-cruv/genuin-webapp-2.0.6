import { DownloadDialogModal } from '@components/common/modals/download-app'
import axios from 'axios'
import { type ClassValue, clsx } from 'clsx'
import { createCipheriv } from 'crypto'
import { twMerge } from 'tailwind-merge'
import { useGenuinOptions } from './stores/genuin-options'
import { AuthenticationModal } from '@components/common/modals/authentication'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLoopAndCommunityShareString(shareUrl: string) {
  const urlObj = new URL(shareUrl)
  const loopShareString = urlObj.searchParams.get('loop')
  const communityShareString = urlObj.searchParams.get('community')
  console.log('communu:', communityShareString)
  return { loopShareString, communityShareString }
}

export function openModal({ title, subtitle, action }: any) {
  const embed = useGenuinOptions.getState().embed

  if (embed) {
    AuthenticationModal.open()
  } else {
    DownloadDialogModal.open({
      title,
      subtitle,
    })
  }
}

export function deleteSearchParam({
  pathName,
  searchParams,
  paramToDelete,
}: {
  pathName: string
  searchParams: string
  paramToDelete: string
}) {
  const searchParamObject = new URLSearchParams(searchParams)
  searchParamObject.delete(paramToDelete)
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
  if (!value) return 0
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
  element.target = '_blank'
  element.click()
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
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v3/dynamic_link`, finalPayload)
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
export function getCurrentShareUrl({ isEmbed, parentUrl }: { isEmbed: boolean; parentUrl: string }) {
  if (!window) return ''
  const urlObj = new URL(window.location.href)
  if (isEmbed) {
    urlObj.pathname = parentUrl
    urlObj.searchParams.append('utm_source', 'app_web_sdk')
  } else {
    urlObj.searchParams.append('utm_source', 'app_web')
  }
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
