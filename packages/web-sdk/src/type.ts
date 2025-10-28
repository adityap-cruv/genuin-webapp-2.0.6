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
  }>
  theme?: 'dark' | 'light'
  website_type? : 'legacy' | 'polaris'
}

export type UpdateConfigByUserType = {
  token: string
  user_params: Record<string, any>
  contextual_params?: ContextualParamsType
  /**
   * @deprecated use contextual_params instead
   */
  contextualParams?: ContextualParamsType
  embed_id?: string
  placement_id?: string
  action?: ActionType
  start_video_slug?: string
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
  theme?: 'dark' | 'light',
  websiteType? : 'legacy' | 'polaris'
}
