import type { QueryKey } from "@tanstack/react-query";

import { baseQueryKey } from "./base";

/**
 * Generates a query key for fetching profile details by username.
 * @param userName - The username for which to get the profile details query key.
 * @returns
 */
export function getQueryKeyForProfileDetails(
  userName: string,
  forBrand: boolean
): QueryKey {
  return [...baseQueryKey, forBrand ? "brand" : "profile", "details", userName];
}

/**
 * Returns a QueryKey for fetching profile community list.
 * It works for both brand and profile.
 *
 * @param {string} id - The identifier for the community list.
 * @param {boolean} forBrand - Determines if the key is for a brand or profile.
 * @returns {QueryKey} The generated query key.
 */
export function getQueryKeyForProfileCommunities(
  id: string,
  forBrand: boolean
): QueryKey {
  return [
    ...baseQueryKey,
    forBrand ? "brand" : "profile",
    "communities",
    "list",
    id,
  ];
}

/**
 * Returns a QueryKey for fetching profile loops.
 * It works for both brand and profile.
 *
 * @param {string} communityId - The identifier for the community.
 * @param {boolean} forBrand - Determines if the key is for a brand or profile.
 * @returns {QueryKey} The generated query key.
 */
export function getQueryKeyForProfileLoops(
  communityId: string,
  forBrand: boolean
): QueryKey {
  return [
    ...baseQueryKey,
    forBrand ? "brand" : "profile",
    "communities",
    "loops",
    communityId,
  ];
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
export function getQueryKeyForProfileVideos(
  communityId: string,
  loopId: string,
  forBrand: boolean
): QueryKey {
  return [
    ...baseQueryKey,
    forBrand ? "brand" : "profile",
    "communities",
    "loops",
    "videos",
    communityId,
    loopId,
  ];
}

/**
 * Returns a QueryKey for fetching profile groups.
 * It works for both brand and profile.
 */
export function getQueryKeyForProfileFeed(
  profileId: string,
  forBrand: boolean,
  videoId: string
) {
  return [
    ...baseQueryKey,
    "profile",
    "feed",
    profileId,
    videoId,
    forBrand ? "brand" : "profile",
  ];
}
