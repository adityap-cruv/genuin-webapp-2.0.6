import { type PeopleType, type CommunityType, type VideoType, type LoopType } from '../views/tabs/index'
import {
  type PeopleResType,
  type CommunitiesResType,
  type VideosResType,
  type LoopsResType,
  type RankingResType,
} from './top-resp'

export function parseCommunities(communities: CommunitiesResType) {
  return communities?.map<CommunityType>((item) => ({
    handle: item.handle,
    id: item.community_id,
    memberCount: item.no_of_members,
    slug: item.slug,
    description: item.description,
    name: item.name,
    profileImage: item.dp,
    type: item.type,
  }))
}

export function parseLoops(loops: LoopsResType): LoopsResType {
  return loops
}

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

export function parseVideos(videos: VideosResType) {
  return videos?.map<VideoType>((item) => {
    return {
      id: item.message_id,
      slug: item.slug,
      owner: { isAvatar: item.owner.is_avatar, profileImage: item.owner.profile_image, userName: item.owner.username },
      thumbnail: item.thumbnail_url ?? '',
      // TODO: What should be description
      description: '',
    }
  })
}

export function parseRankings(rankings: RankingResType) {
  return rankings.filter((value, index, arr) => value !== 'videos')
}
