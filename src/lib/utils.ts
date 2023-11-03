import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarFallback(str: string | undefined) {
  if (!str) return 'U'
  const strArray = str?.split(' ')
  let ans = ''
  ans += strArray[0]?.charAt(0)
  if (strArray[1]) ans += strArray[1].charAt(0)
  return ans.toUpperCase()
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
