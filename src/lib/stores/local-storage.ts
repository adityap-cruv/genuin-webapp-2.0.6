import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { persist } from 'zustand/middleware'

type CommunityType = { name: string; handle: string; profileImage: string; slug: string }

type LocalStorageType = {
  userId: string
  communities: CommunityType[]
  addCommunity: (community: CommunityType) => void
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
      }
    },
    { name: '_user_id_' }
  )
)
