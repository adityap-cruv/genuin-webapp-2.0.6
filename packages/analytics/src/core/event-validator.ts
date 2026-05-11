/**
 * Event Validator
 * Validates analytics events based on whitelists, blacklists, required fields, and schemas
 */

import type { ValidationResult, ValidationError, ValidationWarning } from "../types/payload";
import type { EventPayload } from "../types/events";
import type { ValidationConfig } from "../types/config";

/**
 * Custom validator function type
 */
export type ValidatorFunction = (payload: EventPayload) => boolean | string;

/**
 * Schema definition (basic)
 */
export interface EventSchema {
  [key: string]: {
    type?: "string" | "number" | "boolean" | "object" | "array";
    required?: boolean;
    validator?: (value: any) => boolean;
  };
}

/**
 * Default validation configuration
 */
const DEFAULT_VALIDATION_CONFIG: Required<ValidationConfig> = {
  enabled: true,
  whitelist: [],
  blacklist: [],
  throwOnError: false,
  logWarnings: true,
};

/**
 * EventValidator handles validation of events and payloads
 */
export class EventValidator {
  private config: Required<ValidationConfig>;
  private whitelist: Set<string> | null;
  private blacklist: Set<string>;
  private schemas: Map<string, EventSchema>;
  private requiredFields: Map<string, Set<string>>;
  private customValidators: Map<string, ValidatorFunction>;

  constructor(config: ValidationConfig = {}) {
    this.config = { ...DEFAULT_VALIDATION_CONFIG, ...config };
    this.whitelist = this.config.whitelist.length > 0 ? new Set(this.config.whitelist) : null;
    this.blacklist = new Set(this.config.blacklist);
    this.schemas = new Map();
    this.requiredFields = new Map();
    this.customValidators = new Map();
  }

  /**
   * Validate an event name and payload
   */
  validate(eventName: string, payload: EventPayload): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Skip validation if disabled
    if (!this.config.enabled) {
      return { valid: true, errors, warnings };
    }

    // Check if event is allowed
    if (!this.isAllowed(eventName)) {
      const error: ValidationError = {
        message: `Event "${eventName}" is not allowed`,
        code: "EVENT_NOT_ALLOWED",
      };
      errors.push(error);

      if (this.config.throwOnError) {
        throw new Error(error.message);
      }

      return { valid: false, errors, warnings };
    }

    // Validate required fields
    const requiredFieldsResult = this.validateRequired(eventName, payload);
    if (!requiredFieldsResult.valid) {
      errors.push(...requiredFieldsResult.errors);
      warnings.push(...requiredFieldsResult.warnings);
    }

    // Validate schema
    const schemaResult = this.validateSchema(eventName, payload);
    if (!schemaResult.valid) {
      errors.push(...schemaResult.errors);
      warnings.push(...schemaResult.warnings);
    }

    // Run custom validator
    const customResult = this.runCustomValidator(eventName, payload);
    if (!customResult.valid) {
      errors.push(...customResult.errors);
      warnings.push(...customResult.warnings);
    }

    // Log warnings if enabled
    if (this.config.logWarnings && warnings.length > 0) {
      warnings.forEach((warning) => {
        console.warn(`[EventValidator] ${warning.message}`);
      });
    }

    // Throw error if configured
    if (this.config.throwOnError && errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map((e) => e.message).join(", ")}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if an event is allowed (whitelist/blacklist)
   */
  isAllowed(eventName: string): boolean {
    // Check blacklist first
    if (this.blacklist.has(eventName)) {
      return false;
    }

    // If whitelist exists, event must be in it
    if (this.whitelist !== null) {
      return this.whitelist.has(eventName);
    }

    // No whitelist, event is allowed
    return true;
  }

  /**
   * Validate required fields
   */
  validateRequired(eventName: string, payload: EventPayload): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const required = this.requiredFields.get(eventName);
    if (!required || required.size === 0) {
      return { valid: true, errors, warnings };
    }

    required.forEach((field) => {
      if (!(field in payload) || payload[field] === undefined || payload[field] === null) {
        errors.push({
          field,
          message: `Required field "${field}" is missing or null/undefined`,
          code: "REQUIRED_FIELD_MISSING",
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate payload against schema
   */
  validateSchema(eventName: string, payload: EventPayload): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const schema = this.schemas.get(eventName);
    if (!schema) {
      return { valid: true, errors, warnings };
    }

    for (const key in schema) {
      if (schema.hasOwnProperty(key)) {
        const fieldSchema = schema[key];
        if (!fieldSchema) continue; // Skip if fieldSchema is undefined

        const value = payload[key];

        // Check if required field is missing
        if (fieldSchema.required && (value === undefined || value === null)) {
          errors.push({
            field: key,
            message: `Required field "${key}" is missing`,
            code: "SCHEMA_REQUIRED_FIELD_MISSING",
          });
          continue;
        }

        // Skip if field is not present and not required
        if (value === undefined || value === null) {
          continue;
        }

        // Check type
        if (fieldSchema.type) {
          const actualType = Array.isArray(value) ? "array" : typeof value;
          if (actualType !== fieldSchema.type) {
            errors.push({
              field: key,
              message: `Field "${key}" expected type "${fieldSchema.type}" but got "${actualType}"`,
              code: "SCHEMA_TYPE_MISMATCH",
            });
          }
        }

        // Run custom field validator
        if (fieldSchema.validator && !fieldSchema.validator(value)) {
          errors.push({
            field: key,
            message: `Field "${key}" failed custom validation`,
            code: "SCHEMA_CUSTOM_VALIDATION_FAILED",
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Run custom validator for event
   */
  private runCustomValidator(eventName: string, payload: EventPayload): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const validator = this.customValidators.get(eventName);
    if (!validator) {
      return { valid: true, errors, warnings };
    }

    try {
      const result = validator(payload);

      if (result === false) {
        errors.push({
          message: `Custom validation failed for event "${eventName}"`,
          code: "CUSTOM_VALIDATION_FAILED",
        });
      } else if (typeof result === "string") {
        errors.push({
          message: result,
          code: "CUSTOM_VALIDATION_FAILED",
        });
      }
    } catch (error) {
      errors.push({
        message: `Custom validator threw error: ${error instanceof Error ? error.message : "Unknown error"}`,
        code: "CUSTOM_VALIDATOR_ERROR",
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Set whitelist of allowed events
   */
  setWhitelist(events: string[]): void {
    this.whitelist = events.length > 0 ? new Set(events) : null;
    this.config.whitelist = events;
  }

  /**
   * Set blacklist of disallowed events
   */
  setBlacklist(events: string[]): void {
    this.blacklist = new Set(events);
    this.config.blacklist = events;
  }

  /**
   * Add a schema for an event
   */
  addSchema(eventName: string, schema: EventSchema): void {
    this.schemas.set(eventName, schema);
  }

  /**
   * Remove a schema
   */
  removeSchema(eventName: string): void {
    this.schemas.delete(eventName);
  }

  /**
   * Set required fields for an event
   */
  setRequiredFields(eventName: string, fields: string[]): void {
    this.requiredFields.set(eventName, new Set(fields));
  }

  /**
   * Add required fields to an event
   */
  addRequiredFields(eventName: string, fields: string[]): void {
    const existing = this.requiredFields.get(eventName) || new Set();
    fields.forEach((field) => existing.add(field));
    this.requiredFields.set(eventName, existing);
  }

  /**
   * Remove required fields
   */
  removeRequiredFields(eventName: string): void {
    this.requiredFields.delete(eventName);
  }

  /**
   * Add a custom validator for an event
   */
  addCustomValidator(eventName: string, validator: ValidatorFunction): void {
    this.customValidators.set(eventName, validator);
  }

  /**
   * Remove a custom validator
   */
  removeCustomValidator(eventName: string): void {
    this.customValidators.delete(eventName);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...config };

    // Update whitelist/blacklist if changed
    if (config.whitelist !== undefined) {
      this.setWhitelist(config.whitelist);
    }
    if (config.blacklist !== undefined) {
      this.setBlacklist(config.blacklist);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<ValidationConfig> {
    return { ...this.config };
  }
}
