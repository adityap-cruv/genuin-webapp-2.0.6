import { type ClassValue, clsx } from 'clsx'
import { cookies } from 'next/headers'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * @returns {Boolean} if requesting client is mobile or not
 */
// export function checkIfMobile(): boolean {
//   return cookies().get('mobile')?.value === 'true'
// }
