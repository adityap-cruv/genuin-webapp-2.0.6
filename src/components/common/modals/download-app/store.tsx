import { type AuthActionType } from '@components/common/modals/authentication/api/auth'
import { type ReactNode } from 'react'
import { create } from 'zustand'

type States = {
  isOpen: boolean
  note?: React.ReactNode
  action?: AuthActionType
  title?: React.ReactNode
  subtitle?: React.ReactNode
  deepLink?: string
  open: (props: { title?: ReactNode | string; subtitle?: ReactNode | string; deepLink?: string }) => void
  close: () => void
}

export const useDownloadDialogModalStore = create<States>((set) => {
  return {
    isOpen: false,
    title: '',
    subtitle: '',
    deepLink: '',
    open({ title, subtitle, deepLink }) {
      set({ isOpen: true, title, subtitle, deepLink })
    },
    close() {
      set({ isOpen: false })
    },
  }
})
