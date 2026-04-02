/**
 * Payload types
 */

/**
 * Default analytics payload that gets merged with all events
 */
export interface DefaultPayload {
  // User & Brand
  user_id?: string
  gen_user_id?: string
  brand_id?: number

  // Channel & Environment
  channel?: string
  environment?: string

  // Page Context
  url?: string
  path?: string
  query_params?: Record<string, string | string[]>
  title?: string

  // Device
  browser_name?: string
  browser_version?: string
  device_name?: string

  // Allow any additional fields
  [key: string]: any
}

/**
 * Merged payload after combining default and event payloads
 */
export type MergedPayload = Record<string, any>

/**
 * Sanitized payload after removing unwanted values
 */
export type SanitizedPayload = Record<string, any>

/**
 * Validation result for payloads
 */
export interface ValidationResult {
  /**
   * Whether the validation passed
   */
  valid: boolean

  /**
   * List of validation errors
   */
  errors: ValidationError[]

  /**
   * List of validation warnings
   */
  warnings: ValidationWarning[]
}

/**
 * Validation error
 */
export interface ValidationError {
  /**
   * Field that failed validation
   */
  field?: string

  /**
   * Error message
   */
  message: string

  /**
   * Error code
   */
  code?: string
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  /**
   * Field that triggered the warning
   */
  field?: string

  /**
   * Warning message
   */
  message: string

  /**
   * Warning code
   */
  code?: string
}
