'use client'
import { Body } from './body'
import { useRepostModalStore } from './state'

export const RepostModal = {
  ui: Body,
  open: useRepostModalStore.getState().open,
}
