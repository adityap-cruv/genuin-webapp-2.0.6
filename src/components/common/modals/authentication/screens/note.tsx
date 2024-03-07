import { useAuthenticationModalStore } from '../store'

export function Note() {
  return useAuthenticationModalStore().note
}
