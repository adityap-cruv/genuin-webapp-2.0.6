import { Modal } from './modal'
import { useAuthenticationModalStore } from './store'

export const AuthenticationModal = {
  ui: Modal,
  open: useAuthenticationModalStore.getState().open,
  close: useAuthenticationModalStore.getState().close,
}
