import { Modal } from './modal'
import { useAuthenticationModalStore } from './store'

export const AuthenticationModal = {
  ui: Modal,
  open: useAuthenticationModalStore.getState().openWithStep,
  close: useAuthenticationModalStore.getState().close,
  isOpen: useAuthenticationModalStore.getState().isOpen,
}
