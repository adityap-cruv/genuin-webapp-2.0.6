import type {
  EmbedDataType,
  ActionType,
  ContextualParamsType,
  PlacementDataResponse,
} from "@genuin/components/context/embed/embed.types";
import type { BrandDetailsConfigType } from "@genuin/components/types/brand";

type AuthUserParams = {
  name?: string | null;
  mobile?: string | null;
  email?: string | null;
  nickname?: string | null;
  profileImage?: string | null;
  brandUserIdentity?: string | null;
};

type AuthInfoType = {
  signInUrl: string;
  signUpUrl: string;
};

export type InitializationStatus = "pending" | "loading" | "done";

type ErrorHandlerFn = ({ isError, isNoContent }: { isError: boolean; isNoContent: boolean }) => void;

/**
 * Configuration object for a live embed passed via genuin.init().
 * Spread into embed details at initialization time; additional fields
 * from EmbedDataType are accepted via the index signature until that
 * type is fully audited here.
 */
export interface LiveEmbedConfig {
  /** API key for the live embed. */
  api_key: string;
  /** Specific embed ID to target. */
  embed_id?: string;
  /** Placement ID for placement-based embeds. */
  placement_id?: string;
  /** Style ID for placement-based embeds. */
  style_id?: string;
  /** Customization data merged into the embed's customization object. */
  live_customization_data?: PlacementDataResponse;
  /** Remaining embed-detail fields accepted until the full shape is typed. */
  [key: string]: unknown;
}

/**
 * These are the config when user can pass while genuin.init or genuin.initialize.
 */
export type ConfigByUser = {
  live?: LiveEmbedConfig;
  embed_id?: string;
  comment_id?: string;
  api_key?: string;
  placement_id?: string;
  style_id?: string;
  token?: string;
  embed_type?: string;
  contextual_params?: ContextualParamsType;
  /**
   * @deprecated use contextual_params instead
   */
  contextualParams?: ContextualParamsType;
  start_video_slug?: string;
  action?: ActionType;
  params?: AuthUserParams;
  /**
   * @deprecated use auth_info instead
   */
  authInfo?: AuthInfoType;
  auth_info?: AuthInfoType;
  /**
   * @deprecated use error_handler instead
   */
  errorHandler?: ErrorHandlerFn;
  error_handler?: ErrorHandlerFn;
  brand_context?: Array<{
    id: string;
    type: string;
    isFollowed?: boolean;
    activePlayingId?: string | number | undefined;
    activePlayingType?: "episode" | "live" | "station";
    isPlaying?: boolean;
    episodeId?: string | undefined;
  }>;
  theme?: "dark" | "light";
  website_type?: "legacy" | "polaris";
  video_ids?: string;
  initial_video_ids?: string;
  useShadowDOM?: boolean;
  allow_gesture_scroll?: boolean;
  /**
   * Parent SDK instance ID for nested child SDK communication.
   */
  parent_instance_id?: string;
  /*
   * Overrides the sponsorship_id from Embed or Placement data.
   * When provided, this value takes priority over any sponsorship_id from the API.
   * An empty or zero-length array is treated as absent (no override applied).
   */
  sponsorship_id?: string[];
};

export type UpdateConfigByUserType = {
  token: string;
  user_params: Record<string, any>;
  contextual_params?: ContextualParamsType;
  /**
   * @deprecated use contextual_params instead
   */
  contextualParams?: ContextualParamsType;
  container_id: string;
  action?: ActionType;
  start_video_slug?: string;
  comment_id?: string;
  source_instance_id?: string;
};

export type SDKElementsType = Record<
  string,
  {
    element: HTMLElement;
    /** The element inside the Shadow DOM that React renders into. Available after Shadow DOM setup. */
    shadowTarget?: HTMLElement;
    config: Partial<SingleEmbedDataConfig>;
    status: InitializationStatus;
    cleanup?: () => void;
  }
>;

export type SingleEmbedDataConfig = {
  embedId: string;
  apiKey: string;
  placementId?: string;
  styleId?: string;
  /**
   * Brand id of the embed.
   */
  token?: string;
  contextualParams?: ContextualParamsType;
  brandIds?: number[];
  startVideoSlug?: string;
  action?: ActionType;
  params?: AuthUserParams;
  authInfo?: AuthInfoType;
  embedDetails?: EmbedDataType;
  brandDetails?: BrandDetailsConfigType;
  commentId?: string;
  live?: LiveEmbedConfig;
  brandContext?: Array<{
    id: string;
    type: string;
  }>;
  theme?: "dark" | "light";
  websiteType?: "legacy" | "polaris";
  embedStyle: "expand_only";
  expandOnLoad?: boolean;
  videoIds: string[];
  initialVideoIds: string[];
  useShadowDOM?: boolean;
  allowGestureScroll: boolean;
  /**
   * Internal flag set by auto-detection when web-sdk is nested.
   * Auto-set by DOM traversal looking for data-web-sdk-nested attribute.
   * Prevents expand view from being loaded for nested embeds.
   */
  disableExpandView?: boolean;
  /**
   * Parent SDK instance ID for nested child SDK communication.
   * Used when a child SDK is nested within a parent SDK instance.
   */
  parentInstanceId?: string;
  /*
   * sponsorship_id override from the init payload (ConfigByUser).
   * Takes priority over the sponsorship_id from Embed or Placement API data.
   */
  initSponsorshipId?: string[];
};
