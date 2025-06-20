import { baseQueryKey } from "./base";

/**
 * This func returns a QueryKey for fetching community builder status.
 * No need to pass dynamic values as it is a static data and will be same for one user.
 * @returns
 */
export function getQueryKeyForksCbStatus(id : string) {
  return [...baseQueryKey ,'ksCbStatus', id]
}
