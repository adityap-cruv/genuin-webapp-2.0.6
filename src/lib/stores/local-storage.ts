import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uuid } from 'uuidv4'

type CommunityType = { name: string; handle: string; profileImage: string; slug: string }

type LocalStorageType = {
  userId: string
  communities: CommunityType[]
  addCommunity: (community: CommunityType) => void
  isIframe: boolean
  setIsIframe: (value: boolean) => void
}

export const useLocalStorage = create(
  persist<LocalStorageType>(
    (set) => {
      return {
        userId: uuid(),
        communities: [],
        addCommunity(community: CommunityType) {
          set((state) => {
            const communities = state.communities
            const alreadyInList = communities.findIndex((item, index) => {
              return item.handle === community.handle
            })
            if (alreadyInList > -1) {
              return { communities }
            }
            if (communities.length < 3) {
              communities.push(community)
            } else {
              communities.unshift(community)
              if (communities.length > 3) {
                communities.pop()
              }
            }
            return { communities }
          })
        },
        isIframe: false,
        setIsIframe(value) {
          set({ isIframe: value })
        },
      }
    },
    { name: '_user_id_' }
  )
)
