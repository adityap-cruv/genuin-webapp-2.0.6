import { useCallback } from 'react'
import { useDeviceDetect } from './useDeviceDetect'

type ShareFnPropsType = {
  title?: string
  description?: string
  shareLink: string
  toast?: () => void
}

export function useAdaptiveShare() {
  const { isMobile } = useDeviceDetect()

  const shareFn = useCallback(
    async ({
      shareLink,
      toast = () => {},
      title,
      description,
    }: ShareFnPropsType): Promise<boolean> => {
      if (window) {
        const linkToCopy = shareLink
        if (window.navigator.share && isMobile) {
          await window.navigator.share({
            url: linkToCopy,
            title,
            text: description,
          })
          return true
        } else {
          if (window.navigator.clipboard) {
            await window.navigator.clipboard.writeText(linkToCopy)
            toast?.()
            return true
          }
        }
      }
      return false
    },
    [isMobile],
  )

  return { shareFn }
}
