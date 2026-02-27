import {
  EmbedDataType,
  ActionType,
  ContextualParamsType,
} from '@genuin/components/context/embed/embed.types'
import { BrandDetailsConfigType } from '@genuin/components/types/brand'

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

type ErrorHandlerFn = ({
  isError,
  isNoContent,
}: {
  isError: boolean
  isNoContent: boolean
}) => void

/**
 * These are the config when user can pass while genuin.init or genuin.initialize.
 */
export type ConfigByUser = {
  live: any
  embed_id?: string
  comment_id?: string
  api_key?: string
  placement_id?: string
  style_id?: string
  token?: string
  embed_type?: string
  contextual_params?: ContextualParamsType
  /**
   * @deprecated use contextual_params instead
   */
  contextualParams?: ContextualParamsType
  start_video_slug?: string
  action?: ActionType
  params?: AuthUserParams
  /**
   * @deprecated use auth_info instead
   */
  authInfo?: AuthInfoType
  auth_info?: AuthInfoType
  /**
   * @deprecated use error_handler instead
   */
  errorHandler?: ErrorHandlerFn
  error_handler?: ErrorHandlerFn
  brand_context?: Array<{
    id: string
    type: string
    isFollowed?: boolean
    activePlayingId?: string | number | undefined
    activePlayingType?: 'episode' | 'live' | 'station'
    isPlaying?: boolean
    episodeId?: string | undefined
  }>
  theme?: 'dark' | 'light'
  website_type?: 'legacy' | 'polaris'
  video_ids?: string
  initial_video_ids?: string
  useShadowDOM?: boolean
  allow_gesture_scroll?: boolean
  /**
   * Parent SDK instance ID for nested child SDK communication.
   */
  parent_instance_id?: string
}

export type UpdateConfigByUserType = {
  token: string
  user_params: Record<string, any>
  contextual_params?: ContextualParamsType
  /**
   * @deprecated use contextual_params instead
   */
  contextualParams?: ContextualParamsType
  container_id: string
  action?: ActionType
  start_video_slug?: string
  comment_id?: string
  source_instance_id?: string
}

export type SDKElementsType = Record<
  string,
  {
    element: HTMLElement
    config: Partial<SingleEmbedDataConfig>
    status: InitializationStatus
    cleanup?: () => void
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
  commentId?: string
  live?: any
  brandContext?: Array<{
    id: string
    type: string
  }>
  theme?: 'dark' | 'light'
  websiteType?: 'legacy' | 'polaris'
  embedStyle: 'expand_only'
  expandOnLoad?: boolean
  videoIds: string[]
  initialVideoIds: string[]
  useShadowDOM?: boolean
  allowGestureScroll: boolean
  /**
   * Internal flag set by auto-detection when web-sdk is nested.
   * Auto-set by DOM traversal looking for data-web-sdk-nested attribute.
   * Prevents expand view from being loaded for nested embeds.
   */
  disableExpandView?: boolean
  /**
   * Parent SDK instance ID for nested child SDK communication.
   * Used when a child SDK is nested within a parent SDK instance.
   */
  parentInstanceId?: string
}
