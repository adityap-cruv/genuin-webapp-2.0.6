import { isMobile } from 'react-device-detect'

export function useAdaptiveShare() {
  async function shareFn({ title, text }: { title?: string; text?: string }): Promise<boolean> {
    if (window) {
      if (isMobile && window.navigator.canShare()) {
        await window.navigator.share({ url: window.location.href, title, text })
        return true
      }
      if (window.navigator.clipboard) {
        await window.navigator.clipboard.writeText(window.location.href)
        return true
      }
    }
    return false
  }

  return { shareFn }
}
