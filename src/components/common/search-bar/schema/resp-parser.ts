import { type PeopleType, type CommunityType } from '../store'
import { LoopsResType, type PeopleResType, type CommunitiesResType } from './top-resp'

export function parseCommunities(communities: CommunitiesResType) {
  return communities?.map<CommunityType>((item) => ({
    handle: item.handle,
    id: item.community_id,
    memberCount: item.no_of_members,
    slug: item.slug,
    description: item.description,
    name: item.name,
    profileImage: item.dp,
  }))
}

// export function parseLoops(loops: LoopsResType) {
//   return loops?.map(item => )
// }

export function parsePeople(people: PeopleResType) {
  return people?.map<PeopleType>((item) => {
    return {
      userName: item.nickname,
      id: item.user_id,
      bio: item.bio,
      name: item.name,
      profileImage: item.profile_image,
      isAvatar: item.is_avatar,
    }
  })
}
