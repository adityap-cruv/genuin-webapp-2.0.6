import { useGenuinOptions } from '@lib/stores/genuin-options'

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
    if (window) {
      let linkToCopy = shareLink ?? window.location.href

      // Check if share_image_id exists in the current URL but not in shareLink
      if (shareLink && window.location.href.includes('share_image_id=')) {
        const urlParams = new URLSearchParams(window.location.search)
        const shareImageId = urlParams.get('share_image_id')

        if (shareImageId && !shareLink.includes('share_image_id=')) {
          // Add share_image_id to the shareLink
          const separator = shareLink.includes('?') ? '&' : '?'
          linkToCopy = `${shareLink}${separator}share_image_id=${shareImageId}`
        }
      }
      if (isMobile) {
        if (window.location.href.includes('embed')) {
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
