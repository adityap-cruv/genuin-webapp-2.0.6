import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CommunityType = { name: string; handle: string; profileImage: string }

type RecentCommunityType = {
  communities: CommunityType[]
  addCommunity: (community: CommunityType) => void
}

// const store =

export const useRecentCommunitiesStore = create(
  persist<RecentCommunityType>(
    (set) => {
      return {
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
    { name: '_recent_communities_' }
  )
)
