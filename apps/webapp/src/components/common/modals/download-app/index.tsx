import { Modal } from './modal'
import { useDownloadDialogModalStore } from './store'

export const DownloadDialogModal = {
  ui: Modal,
  open: useDownloadDialogModalStore.getState().open,
  close: useDownloadDialogModalStore.getState().close,
}
