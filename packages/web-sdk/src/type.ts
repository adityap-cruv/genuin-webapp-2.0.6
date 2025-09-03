import { EmbedDataType } from '@genuin/components/context/embed/embed.types'
import { BrandDetailsConfigType } from '@genuin/components/types/brand'

export type ActionType =
  | 'spark'
  | 'comment-spark'
  | 'repost'
  | 'comment'
  | 'report'
  | 'join-community'
  | 'join-group'
  | 'subscribe-group'

type AuthUserParams = {
  name?: string | null
  mobile?: string | null
  email?: string | null
  nickname?: string | null
  profileImage?: string | null
  brandUserIdentity?: string | null
}

type AuthInfoType = {
  signInUrl: string
  signUpUrl: string
}

export type InitializationStatus = 'pending' | 'loading' | 'done'

export type ContextualParamsType = {
  page_context?: string
  geo?: {
    lat?: number
    long?: number
    radius_limit?: number
  }
  url?: string
  previous_page_context?: string
  user_context?: string
  place?: {
    country?: string
    state?: string
    city?: string
    zipcode?: string | number
  }
  time?: string | number
  user_segments?: {
    age?: number
    min_age?: number
    max_age?: number
    segment?: string
    gender?: string
    race?: string
  }
  brands_ids?: number[]
  user_interests?: string[]
  posted_by_user_ids?: string[]
  community_ids?: string[]
  loop_ids?: string[]
}

/**
 * These are the config when user can pass while genuin.init or genuin.initialize.
 */
export type ConfigByUser = {
  embed_id?: string
  api_key?: string
  placement_id?: string
  style_id?: string
  token?: string
  contextualParams?: ContextualParamsType
  startVideoSlug?: string
  action?: ActionType
  params?: AuthUserParams
  authInfo: AuthInfoType
}

export type UpdateConfigByUserType = {
  token: string
  userParams: Record<string, any>
  contextualParams?: ContextualParamsType
  embedId: string
}

export type SDKElementsType = Record<
  string,
  {
    element: HTMLElement
    config: Partial<SingleEmbedDataConfig>
    status: InitializationStatus
  }
>

export type SingleEmbedDataConfig = {
  embedId: string
  apiKey: string
  placementId?: string
  styleId?: string
  /**
   * Brand id of the embed.
   */
  token?: string
  contextualParams?: ContextualParamsType
  brandIds?: number[]
  startVideoSlug?: string
  action?: ActionType
  params?: AuthUserParams
  authInfo?: AuthInfoType
  embedDetails?: EmbedDataType
  brandDetails?: BrandDetailsConfigType
}
