import { type PeopleType, type CommunityType, type VideoType } from '../views/tabs/index'
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
    brand: item.brand
      ? {
          brand_id: item.brand.brand_id,
          name: item.brand.name,
          subdomain: item.brand.subdomain,
          logo: item.brand.logo,
          created_at: item.brand.created_at,
          brand_web_logo: item.brand.brand_web_logo,
          favicon: item.brand.favicon,
          brand_system_user_id: item.brand.brand_system_user_id,
          brand_slug: item.brand.brand_slug,
        }
      : null,
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
      brand: item.brand
        ? {
            brand_id: item.brand.brand_id,
            brand_slug: item.brand.brand_slug,
          }
        : null,
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
