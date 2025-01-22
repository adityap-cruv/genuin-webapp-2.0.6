import { useGenuinOptions } from '@lib/stores/genuin-options'
import { usePathname } from 'next/navigation'

export function useAdaptiveShare() {
  const isMobile = useGenuinOptions().isMobile

  async function shareFn({
    title,
    description,
    shareLink,
    toast = () => {},
  }: {
    title?: string
    description?: string
    shareLink?: string
    toast?: any
  }): Promise<boolean> {
    const pathname = usePathname()
    if (window) {
      const linkToCopy = shareLink ?? window.location.href
      if (isMobile) {
        if (pathname.includes('embed')) {
          window.open(shareLink, '_blank', 'noopener,noreferrer')
        } else {
          await window.navigator.share({ url: linkToCopy, title, text: description })
        }
        return true
      } else {
        if (window.navigator.clipboard) {
          await window.navigator.clipboard.writeText(linkToCopy)
          if (toast) toast()
          return true
        }
      }
    }
    return false
  }

  return { shareFn }
}
