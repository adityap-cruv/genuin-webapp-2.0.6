import { createContext, useContext, ReactNode, useState } from 'react'
import { AuthActionType } from '../authentication/api/auth'
import { useBaseContext } from '@/context/base'
import { UAParser } from 'ua-parser-js'

type DownloadDialogContextType = {
  isOpen: boolean
  note?: ReactNode
  action?: AuthActionType
  title?: ReactNode
  subtitle?: ReactNode
  deepLink?: string
  open: (props: {
    title?: ReactNode | string
    subtitle?: ReactNode | string
    deepLink?: string
  }) => void
  close: () => void
}

const DownloadDialogContext = createContext<DownloadDialogContextType | null>(
  null,
)

let openDialog: (props: {
  title?: ReactNode | string
  subtitle?: ReactNode | string
  deepLink?: string
}) => void
let closeDialog: () => void
let getMobileUrl: () => string | undefined
let getWebCta: () => string
let getDomainUrl: () => string

// Static methods for external usage
export const DownloadDialogModal = {
  open: (props: {
    title?: ReactNode | string
    subtitle?: ReactNode | string
    deepLink?: string
  }) => {
    openDialog?.(props)
  },
  close: () => {
    closeDialog?.()
  },
  getMobileAppUrl: () => getMobileUrl?.(),
  getWebCta: () => getWebCta?.(),
  getDomainUrl: () => getDomainUrl?.(),
}

export function DownloadDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState<ReactNode>('')
  const [subtitle, setSubtitle] = useState<ReactNode>('')
  const [deepLink, setDeepLink] = useState('')
  const { brandDetails } = useBaseContext()

  const open = ({
    title,
    subtitle,
    deepLink,
  }: {
    title?: ReactNode | string
    subtitle?: ReactNode | string
    deepLink?: string
  }) => {
    setIsOpen(true)
    setTitle(title || '')
    setSubtitle(subtitle || '')
    setDeepLink(deepLink || '')
  }

  const close = () => {
    setIsOpen(false)
  }

  const getCurrentWebCta = () => {
    return brandDetails?.web_cta || ''
  }

  const getCurrentDomainUrl = () => {
    return brandDetails?.white_label_url || ''
  }

  const getMobileAppUrl = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const osName = new UAParser()
      .getResult()
      .os.name?.toLowerCase()
      .replace(/\s+/g, '')
    const isIOS =
      osName === 'macos' ||
      osName === 'ios' ||
      /iphone|ipad|ipod/.test(userAgent)

    const appStoreLink = brandDetails?.integrations.sdk.ios.appstore_link
    const playStoreLink = brandDetails?.integrations.sdk.android.playstore_link

    return isIOS ? appStoreLink : playStoreLink
  }

  // Assign the functions to our module-level variables
  openDialog = open
  closeDialog = close
  getMobileUrl = getMobileAppUrl
  getWebCta = getCurrentWebCta
  getDomainUrl = getCurrentDomainUrl

  return (
    <DownloadDialogContext.Provider
      value={{
        isOpen,
        title,
        subtitle,
        deepLink,
        open,
        close,
      }}>
      {children}
    </DownloadDialogContext.Provider>
  )
}

export function useDownloadDialogContext() {
  const context = useContext(DownloadDialogContext)
  if (!context) {
    throw new Error(
      'useDownloadDialog must be used within a DownloadDialogProvider',
    )
  }
  return context
}
