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
