'use client'
import { Modal } from './modal'
import { useRepostModalStore } from './state'

export const RepostModal = {
  ui: Modal,
  open: useRepostModalStore.getState().open,
}
