import { type AuthActionType } from '@lib/api/auth'
import { type ReactNode } from 'react'
import { create } from 'zustand'

export type StepsType = 'EMAIL_INPUT'

type States = {
  isOpen: boolean
  note?: React.ReactNode
  action?: AuthActionType
  title?: React.ReactNode
  subtitle?: React.ReactNode
  open: (props: { title: ReactNode | string; subtitle: ReactNode | string }) => void
  close: () => void
}

export const useDownloadDialogModalStore = create<States>((set) => {
  return {
    isOpen: false,
    title: '',
    subtitle: '',
    open({ title, subtitle }) {
      set({ isOpen: true, title, subtitle })
    },
    close() {
      set({ isOpen: false })
    },
  }
})
