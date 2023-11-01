import { isMobile } from 'react-device-detect'

export function useAdaptiveShare() {
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
    if (window) {
      const linkToCopy = shareLink ? shareLink : window.location.href
      if (isMobile && window.navigator.canShare()) {
        await window.navigator.share({ url: linkToCopy, title, text: description })
        return true
      }
      if (window.navigator.clipboard) {
        await window.navigator.clipboard.writeText(linkToCopy)
        if (toast) toast()
        return true
      }
    }
    return false
  }

  return { shareFn }
}
