/**
 * This page is used to define queryKeys for the react-query library.
 */

import type { QueryKey } from '@tanstack/react-query'

/**
 * Returns a QueryKey for fetching profile community list.
 * It works for both brand and profile.
 *
 * @param {string} id - The identifier for the community list.
 * @param {boolean} forBrand - Determines if the key is for a brand or profile.
 * @returns {QueryKey} The generated query key.
 */
export function getQueryKeyForProfileCommunities(id: string, forBrand: boolean): QueryKey {
  return [forBrand ? 'brand' : 'profile', 'communities', 'list', id]
}

/**
 * Returns a QueryKey for fetching profile loops.
 * It works for both brand and profile.
 *
 * @param {string} communityId - The identifier for the community.
 * @param {boolean} forBrand - Determines if the key is for a brand or profile.
 * @returns {QueryKey} The generated query key.
 */
export function getQueryKeyForProfileLoops(communityId: string, forBrand: boolean): QueryKey {
  return [forBrand ? 'brand' : 'profile', 'communities', 'loops', communityId]
}

/**
 * Returns a QueryKey for fetching profile videos.
 * It works for both brand and profile.
 *
 * @param {string} communityId - The identifier for the community.
 * @param {string} loopId - The identifier for the loop.
 * @param {boolean} forBrand - Determines if the key is for a brand or profile.
 * @returns {QueryKey} The generated query key.
 */
export function getQueryKeyForProfileVideos(communityId: string, loopId: string, forBrand: boolean): QueryKey {
  return [forBrand ? 'brand' : 'profile', 'communities', 'loops', 'videos', communityId, loopId]
}

/**
 * This function returns a QueryKey for fetching profile details.
 * @param id
 * @param forBrand
 * @returns
 */
export function getQueryKeyForProfileDetails(id: string, forBrand: boolean): QueryKey {
  return [forBrand ? 'brand' : 'profile', 'details', id]
}

/**
 * This function returns a QueryKey for fetching profile feed.
 * @param id
 * @param forBrand
 * @param others
 * @returns
 */
export function getQueryKeyForProfileFeed(id: string, forBrand: boolean, ...others: any[]): QueryKey {
  return [forBrand ? 'brand' : 'profile', 'feed', id, ...others]
}

/**
 * This function returns a QueryKey for fetching community details.
 * @param slug
 * @returns
 */
export function getQueryKeyForCommunityDetails(slug: string): QueryKey {
  return ['community', 'details', slug]
}

/**
 * This function returns a QueryKey for fetching community loops.
 * @param slug
 * @returns
 */
export function getQueryKeyForCommunityLoops(slug: string): QueryKey {
  return ['community', 'loops', slug]
}

/**
 * This function returns a QueryKey for fetching community members.
 * @param slug
 * @returns
 */
export function getQueryKeyForCommunityMembers(slug: string): QueryKey {
  return ['community', 'members', slug]
}

/**
 * This function returns a QueryKey for fetching community feed.
 * @param slug
 * @returns
 */
export function getQueryKeyForLoopDetails(slug: string): QueryKey {
  return ['loop', 'details', slug]
}

/**
 * This function returns a QueryKey for fetching loop posts.
 * @param slug
 * @returns
 */
export function getQueryKeyForLoopPosts(slug: string) {
  return ['loop', 'posts', slug]
}

/**
 * This func returns a QueryKey for fetching loop members.
 * @param slug
 * @returns
 */
export function getQueryKeyForLoopMembers(slug: string) {
  return ['loop', 'members', slug]
}

/**
 * This func returns a QueryKey for fetching loop feed.
 * @param slug
 * @returns
 */
export function getQueryKeyForLoopFeed(slug: string) {
  return ['loop', 'feed', slug]
}

/**
 * This func returns a QueryKey for fetching community feed.
 * @param slug
 * @returns
 */
export function getQueryKeyForCommunityFeed(slug: string) {
  return ['community', 'feed', slug]
}

/**
 *  This function returns a QueryKey for fetching featured communities.
 * @returns
 */
export function getQueryKeyForFeaturedCommunities(): QueryKey {
  return ['featured', 'communities']
}

/**
 *  This function returns a QueryKey for fetching featured loops.
 * @returns
 */
export function getQueryKeyForFeaturedLoops(): QueryKey {
  return ['featured', 'loops']
}

/**
 * This func returns a QueryKey for fetching comments in video.
 * @param videoId
 * @returns
 */
export function getQueryKeyForVideoComments(videoId: string) {
  return [videoId, 'comments']
}

/**
 * This func returns a QueryKey for fetching user details. Used in settings update user functionality.
 * @param nickname
 * @returns
 */
export function getQueryKeyForUserDetails(nickname: string) {
  return ['user', 'details', nickname]
}

/**
 * This func returns a QueryKey for fetching user settings.
 * There is not need to pass dynamic values as it is a static data and will be same for one user.
 * @returns
 */
export function getQueryKeyForUserSettings() {
  return ['user', 'settings']
}

/**
 * This func returns a QueryKey for fetching category list.
 * No need to pass dynamic values as it is a static data and will be same for one user.
 * @returns
 */
export function getQueryKeyForCategoryList() {
  return ['categories']
}
