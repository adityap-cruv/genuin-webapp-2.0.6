/**
 * Octo Analytics Event Definitions
 * Events tracked by the GenAI SDK (Octo Panel)
 */

/**
 * Octo event names - matching product specification
 */
export const OctoEventNames = {
  // SDK Lifecycle Events
  SDK_LOADED: 'Octo Panel SDK Loaded',
  SDK_INITIALIZED: 'Octo Panel SDK Initialized',
  SDK_LOAD_FAILED: 'Octo SDK Load Failed',
  SDK_INIT_FAILED: 'Octo SDK Init Failed',

  // User Conversation Events
  MESSAGE_SENT: 'Octo Message Sent',
  RESPONSE_RECEIVED: 'Octo Response Received',
  MESSAGE_SEND_FAILED: 'Octo Message Send Failed',

  // Auto-Prompt Events
  AUTO_PROMPT_COUNTDOWN_STARTED: 'Octo Auto Prompt Countdown Started',
  AUTO_PROMPT_CANCELLED: 'Octo Auto Prompt Cancelled',
  AUTO_PROMPT_EXECUTED: 'Octo Auto Prompt Executed',

  // Preset Prompt Events
  PRESET_PROMPT_OPENED: 'Octo Preset Prompt Opened',
  PRESET_PROMPT_SELECTED: 'Octo Preset Prompt Selected',

  // Video Carousel Events
  CAROUSEL_RENDERED: 'Octo Carousel Rendered',
  CAROUSEL_VIDEO_CLICKED: 'Octo Carousel Video Clicked',
  VIDEO_FORWARDED_TO_PARENT: 'Octo Video Forwarded to Parent',
  VIDEO_FORWARD_FAILED: 'Octo Video Forward Failed',

  // Session Management Events
  SESSION_CREATED: 'Octo Session Created',
  SESSION_SWITCHED: 'Octo Session Switched',

  // Koah Ad Events
  KOAH_AD_PROCESSING_STARTED: 'Koah Ad Processing Started',
  KOAH_AD_SERVED: 'Koah Ad Served',
  KOAH_AD_NO_FILL: 'Koah Ad No Fill',
  KOAH_AD_PROCESSING_FAILED: 'Koah Ad Processing Failed',
  KOAH_SDK_LOAD_TIMEOUT: 'Koah SDK Load Timeout',
  KOAH_AD_CLICKED: 'Koah Ad Clicked',
} as const

/**
 * Type for Octo event names
 */
export type OctoEventName = (typeof OctoEventNames)[keyof typeof OctoEventNames]

/**
 * SDK Lifecycle Event Payloads
 */

export interface OctoSDKLoadedPayload {
  /**
   * Time taken to load SDK in milliseconds
   */
  load_time: number

  /**
   * SDK version
   */
  sdk_version?: string
}

export interface OctoSDKInitializedPayload {
  /**
   * Time taken to initialize SDK in milliseconds
   */
  init_time: number

  /**
   * View mode (page, floater, dialog, web-sdk)
   */
  view?: 'page' | 'floater' | 'dialog' | 'web-sdk'
}

export interface OctoSDKLoadFailedPayload {
  /**
   * Error message
   */
  error_message: string

  /**
   * Error code (if available)
   */
  error_code?: string

  /**
   * Stack trace (optional, for debugging)
   */
  error_stack?: string
}

export interface OctoSDKInitFailedPayload {
  /**
   * Error message
   */
  error_message: string

  /**
   * Error code (if available)
   */
  error_code?: string

  /**
   * Stack trace (optional, for debugging)
   */
  error_stack?: string
}

/**
 * Conversation Event Payloads
 */

export interface OctoMessageSentPayload {
  /**
   * Length of the message sent
   */
  message_length: number

  /**
   * Whether this is the first message in the conversation
   */
  is_first_message: boolean

  /**
   * Whether the message was auto-sent (from auto-prompt)
   */
  is_auto_sent: boolean

  /**
   * Whether the user used a suggested prompt
   */
  used_suggested_prompt: boolean

  /**
   * Session ID if available
   */
  session_id?: string

  /**
   * Agent ID if available
   */
  agent_id?: string
}

export interface OctoResponseReceivedPayload {
  /**
   * Response time in milliseconds
   */
  response_time: number

  /**
   * Character length of the agent response (optional instrumentation)
   */
  response_length?: number

  /**
   * Whether response includes video carousel
   */
  includes_video_carousel: boolean

  /**
   * Number of videos in carousel (if includes_video_carousel is true)
   */
  video_count?: number

  /**
   * Session ID
   */
  session_id?: string

  /**
   * Agent ID
   */
  agent_id?: string
}

export interface OctoMessageSendFailedPayload {
  /**
   * Error message
   */
  error_message: string

  /**
   * Error code
   */
  error_code?: string

  /**
   * Message that failed to send (first 100 chars)
   */
  message_preview?: string
}

/**
 * Auto-Prompt Event Payloads
 */

export interface OctoAutoPromptCountdownStartedPayload {
  /**
   * The prompt being shown
   */
  prompt: string

  /**
   * Countdown duration in seconds
   */
  countdown_duration: number
}

export interface OctoAutoPromptCancelledPayload {
  /**
   * The prompt that was cancelled
   */
  prompt: string

  /**
   * Seconds remaining when cancelled
   */
  seconds_remaining: number
}

export interface OctoAutoPromptExecutedPayload {
  /**
   * The prompt that was auto-executed
   */
  prompt: string
}

/**
 * Preset Prompt Event Payloads
 */

export interface OctoPresetPromptOpenedPayload {
  /**
   * Number of prompts available
   */
  prompt_count: number
}

export interface OctoPresetPromptSelectedPayload {
  /**
   * The prompt that was selected
   */
  prompt: string

  /**
   * Position of prompt in the list (0-indexed)
   */
  position: number

  /**
   * Total number of prompts available
   */
  total_prompts: number
}

/**
 * Video Carousel Event Payloads
 */

export interface OctoCarouselRenderedPayload {
  /**
   * Number of videos in carousel
   */
  video_count: number

  /**
   * Array of video IDs
   */
  video_ids: string[]

  /**
   * Whether carousel is nested in web-sdk
   */
  is_nested_in_web_sdk: boolean

  /**
   * Session ID
   */
  session_id?: string
}

export interface OctoCarouselVideoClickedPayload {
  /**
   * ID of video that was clicked
   */
  video_id: string

  /**
   * Position in carousel (0-indexed)
   */
  position: number

  /**
   * Total videos in carousel
   */
  total_videos: number

  /**
   * Session ID
   */
  session_id?: string
}

export interface OctoVideoForwardedToParentPayload {
  /**
   * ID of video forwarded
   */
  video_id: string

  /**
   * Source of video selection
   */
  source: 'octo_carousel' | 'octo_recommendation'
}

export interface OctoVideoForwardFailedPayload {
  /**
   * ID of video that failed to forward
   */
  video_id: string

  /**
   * Error message
   */
  error_message: string

  /**
   * Error code
   */
  error_code?: string
}

/**
 * Session Event Payloads
 */

export interface OctoSessionCreatedPayload {
  /**
   * New session ID
   */
  session_id: string

  /**
   * Video ID that triggered session
   */
  video_id?: string

  /**
   * Whether this is user's first session ever
   */
  is_first_session_ever: boolean

  /**
   * Agent ID
   */
  agent_id?: string
}

export interface OctoSessionSwitchedPayload {
  /**
   * Session ID switched from
   */
  from_session_id: string

  /**
   * Session ID switched to
   */
  to_session_id: string
}

/**
 * Koah Ad Event Payloads
 */

export interface KoahAdProcessingStartedPayload {
  /**
   * Message ID associated with the ad
   */
  message_id: string

  /**
   * User message that triggered the ad
   */
  user_message: string

  /**
   * Session ID
   */
  session_id?: string
}

export interface KoahAdServedPayload {
  /**
   * Message ID associated with the ad
   */
  message_id: string

  /**
   * User message that triggered the ad
   */
  user_message: string

  /**
   * Time taken to process ad (ms)
   */
  processing_time_ms?: number

  /**
   * Session ID
   */
  session_id?: string
}

export interface KoahAdNoFillPayload {
  /**
   * Message ID associated with the ad
   */
  message_id: string

  /**
   * User message that attempted ad
   */
  user_message: string

  /**
   * Reason for no fill (if available)
   */
  reason?: string

  /**
   * Session ID
   */
  session_id?: string
}

export interface KoahAdProcessingFailedPayload {
  /**
   * Message ID associated with the ad
   */
  message_id: string

  /**
   * Error message
   */
  error_message: string

  /**
   * Error stack trace (optional)
   */
  error_stack?: string

  /**
   * Session ID
   */
  session_id?: string
}

export interface KoahSdkLoadTimeoutPayload {
  /**
   * Message ID that was waiting for SDK
   */
  message_id: string

  /**
   * Timeout duration (ms)
   */
  timeout_ms: number

  /**
   * Session ID
   */
  session_id?: string
}

export interface KoahAdClickedPayload {
  /**
   * Message ID associated with the ad
   */
  message_id: string

  /**
   * User message associated with ad
   */
  user_message: string

  /**
   * Ad element that was clicked (if available)
   */
  ad_element?: string

  /**
   * Session ID
   */
  session_id?: string
}
