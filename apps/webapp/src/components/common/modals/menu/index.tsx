import { MenuProvider } from './context'
import { Component } from './component'

type MenuModalProps = {
  children: React.ReactNode
  videoSlug: string
  shareUrl: string
  contentId: string
}

/**
 * `MenuModal` is a wrapper component that provides modal functionality for menu-related interactions
 * such as reporting content or video playback speed. It uses a `MenuProvider` context to manage
 * modal state and shares contextual data like `videoSlug`, `shareUrl`, and `contentId` across its children.
 *
 * Internally, it renders the `Component` which manages modal content dynamically based on the current modal type.
 * The modal types include: `'menu'`, `'report'`, `'reportSuccess'`, and `'loginRequired'`.
 *
 * @param {React.ReactNode} props.children - The element that triggers the modal when clicked.
 * @param {string} props.videoSlug - A unique slug identifier for the video.
 * @param {string} props.shareUrl - A URL used to share the video externally.
 * @param {string} props.contentId - The unique identifier of the video content being reported.
 */

export function MenuModal({ children, ...restProps }: MenuModalProps) {
  return (
    <MenuProvider {...restProps}>
      <Component>{children}</Component>
    </MenuProvider>
  )
}
