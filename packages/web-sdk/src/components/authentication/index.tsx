import { useAuthModalContext } from '@/components/authentication/context'
import { Modal } from './modal'

let authModalInstance: ReturnType<typeof useAuthModalContext> | null = null

export const AuthenticationModal = {
  ui: Modal,
  setInstance: (instance: ReturnType<typeof useAuthModalContext>) => {
    authModalInstance = instance
  },
  open: (
    ...args: Parameters<ReturnType<typeof useAuthModalContext>['openWithStep']>
  ) => {
    if (authModalInstance) authModalInstance.openWithStep(...args)
  },
  close: () => {
    if (authModalInstance) authModalInstance.close()
  },
  isOpen: () => {
    return authModalInstance ? authModalInstance.isOpen : false
  },
}
