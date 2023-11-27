import { isDesktop, isMobile } from 'react-device-detect'

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
      const linkToCopy = shareLink ?? window.location.href
      if (isMobile) {
        await window.navigator.share({ url: linkToCopy + '?utm_source=app_web', title, text: description })
        return true
      }
      if (window.navigator.clipboard && isDesktop) {
        await window.navigator.clipboard.writeText(linkToCopy + '?utm_source=app_web')
        if (toast) toast()
        return true
      }
    }
    return false
  }

  return { shareFn }
}
