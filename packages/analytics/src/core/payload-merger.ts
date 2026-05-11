/**
 * Payload Merger
 * Handles intelligent merging and sanitization of event payloads
 */

import type { DefaultPayload, MergedPayload, SanitizedPayload } from "../types/payload";
import type { MergeStrategy, MergeRule, MergeConfig, SanitizationConfig } from "../types/config";
import type { EventPayload } from "../types/events";

/**
 * Critical fields that should be present in every event
 */
const CRITICAL_FIELDS = ["brand_id", "channel", "environment"] as const;

/**
 * Default sanitization configuration
 */
const DEFAULT_SANITIZATION_CONFIG: Required<SanitizationConfig> = {
  removeNull: true,
  removeUndefined: true,
  removeEmptyStrings: false,
  sensitiveKeys: ["password", "token", "secret", "apiKey", "api_key", "ssn", "credit_card"],
  trimStrings: true,
};

/**
 * PayloadMerger handles merging of default and event payloads with various strategies
 */
export class PayloadMerger {
  private defaultPayload: DefaultPayload;
  private mergeRules: Map<string, MergeRule>;
  private sanitizationConfig: Required<SanitizationConfig>;
  private defaultStrategy: MergeStrategy;

  constructor(
    defaultPayload: DefaultPayload = {},
    mergeConfig: MergeConfig = {},
    sanitizationConfig: SanitizationConfig = {}
  ) {
    this.defaultPayload = defaultPayload;
    this.mergeRules = mergeConfig.rules || new Map();
    this.defaultStrategy = mergeConfig.defaultStrategy || "deep";
    this.sanitizationConfig = {
      ...DEFAULT_SANITIZATION_CONFIG,
      ...sanitizationConfig,
    };
  }

  /**
   * Merge event payload with default payload
   */
  merge(eventPayload: EventPayload, eventName?: string): MergedPayload {
    // Get merge rule for this event if it exists
    const rule = eventName ? this.mergeRules.get(eventName) : undefined;
    const strategy = rule?.strategy || this.defaultStrategy;
    const priority = rule?.priority || "event";

    let merged: MergedPayload;

    // Apply merge strategy
    switch (strategy) {
      case "shallow":
        merged = this.shallowMerge(this.defaultPayload, eventPayload, priority);
        break;
      case "override":
        merged = this.override(this.defaultPayload, eventPayload, priority);
        break;
      case "additive":
        merged = this.additive(this.defaultPayload, eventPayload, priority);
        break;
      case "deep":
      default:
        merged = this.deepMerge(this.defaultPayload, eventPayload, priority);
        break;
    }

    // Apply transformation if rule has one
    if (rule?.transform) {
      merged = rule.transform(merged);
    }

    return merged;
  }

  /**
   * Sanitize payload by removing unwanted values
   */
  sanitize(payload: EventPayload): SanitizedPayload {
    let sanitized = { ...payload };

    // Remove null values
    if (this.sanitizationConfig.removeNull) {
      sanitized = this.removeNullish(sanitized, null);
    }

    // Remove undefined values
    if (this.sanitizationConfig.removeUndefined) {
      sanitized = this.removeNullish(sanitized, undefined);
    }

    // Remove empty strings
    if (this.sanitizationConfig.removeEmptyStrings) {
      sanitized = this.removeEmpty(sanitized);
    }

    // Remove sensitive keys
    if (this.sanitizationConfig.sensitiveKeys.length > 0) {
      sanitized = this.removeSensitive(sanitized, this.sanitizationConfig.sensitiveKeys);
    }

    // Trim strings
    if (this.sanitizationConfig.trimStrings) {
      sanitized = this.trimStrings(sanitized);
    }

    return sanitized;
  }

  /**
   * Merge and sanitize in one call
   */
  mergeAndSanitize(eventPayload: EventPayload, eventName?: string): SanitizedPayload {
    const merged = this.merge(eventPayload, eventName);
    const sanitized = this.sanitize(merged);

    // Validate critical fields after sanitization
    this.validateCriticalFields(sanitized, eventName);

    return sanitized;
  }

  /**
   * Validate that critical fields are present and have valid values
   */
  private validateCriticalFields(payload: EventPayload, eventName?: string): void {
    const missingFields: string[] = [];
    const invalidFields: string[] = [];

    CRITICAL_FIELDS.forEach((field) => {
      const value = payload[field];

      // Check if field is missing or empty
      if (value === undefined || value === null || value === "") {
        missingFields.push(field);
      }
      // Check for brand_id specifically (should be a number)
      else if (field === "brand_id" && typeof value !== "number") {
        invalidFields.push(`${field} (expected number, got ${typeof value})`);
      }
    });

    // Log warnings for missing or invalid critical fields
    if (missingFields.length > 0) {
      console.warn(
        `[PayloadMerger] Critical analytics fields missing${eventName ? ` for event "${eventName}"` : ""}: ${missingFields.join(", ")}. Events may not track correctly.`
      );
    }

    if (invalidFields.length > 0) {
      console.warn(
        `[PayloadMerger] Critical analytics fields have invalid values${eventName ? ` for event "${eventName}"` : ""}: ${invalidFields.join(", ")}`
      );
    }
  }

  /**
   * Set or update default payload
   */
  setDefaultPayload(payload: DefaultPayload): void {
    this.defaultPayload = payload;
  }

  /**
   * Update default payload with partial data
   */
  updateDefaultPayload(partial: Partial<DefaultPayload>): void {
    this.defaultPayload = this.deepMerge(this.defaultPayload, partial, "event");
  }

  /**
   * Get current default payload
   */
  getDefaultPayload(): DefaultPayload {
    return { ...this.defaultPayload };
  }

  /**
   * Add a merge rule for a specific event
   */
  addMergeRule(eventName: string, rule: MergeRule): void {
    this.mergeRules.set(eventName, rule);
  }

  /**
   * Remove a merge rule
   */
  removeMergeRule(eventName: string): void {
    this.mergeRules.delete(eventName);
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(
    target: Record<string, any>,
    source: Record<string, any>,
    priority: "default" | "event"
  ): Record<string, any> {
    const result: Record<string, any> = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];

        // If priority is 'default' and target has value, keep target
        if (priority === "default" && targetValue !== undefined) {
          continue;
        }

        // If both are plain objects, merge recursively
        if (this.isPlainObject(sourceValue) && this.isPlainObject(targetValue)) {
          result[key] = this.deepMerge(targetValue, sourceValue, priority);
        } else {
          result[key] = sourceValue;
        }
      }
    }

    return result;
  }

  /**
   * Shallow merge two objects
   */
  private shallowMerge(
    target: Record<string, any>,
    source: Record<string, any>,
    priority: "default" | "event"
  ): Record<string, any> {
    if (priority === "event") {
      return { ...target, ...source };
    } else {
      return { ...source, ...target };
    }
  }

  /**
   * Override: source completely replaces target
   */
  private override(
    target: Record<string, any>,
    source: Record<string, any>,
    priority: "default" | "event"
  ): Record<string, any> {
    if (priority === "event") {
      return { ...source };
    } else {
      return { ...target };
    }
  }

  /**
   * Additive: only add keys that don't exist
   */
  private additive(
    target: Record<string, any>,
    source: Record<string, any>,
    priority: "default" | "event"
  ): Record<string, any> {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        // Only add if key doesn't exist
        if (!(key in result)) {
          result[key] = source[key];
        } else if (priority === "event") {
          // If priority is event, allow overwriting
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  /**
   * Remove null or undefined values
   */
  private removeNullish(obj: Record<string, any>, nullishValue: null | undefined): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (value === nullishValue) {
          continue;
        }

        if (this.isPlainObject(value)) {
          result[key] = this.removeNullish(value, nullishValue);
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Remove empty strings
   */
  private removeEmpty(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (value === "") {
          continue;
        }

        if (this.isPlainObject(value)) {
          result[key] = this.removeEmpty(value);
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Remove sensitive keys
   */
  private removeSensitive(obj: Record<string, any>, sensitiveKeys: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    const lowerCaseSensitiveKeys = sensitiveKeys.map((k) => k.toLowerCase());

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Check if key is sensitive (case-insensitive)
        if (lowerCaseSensitiveKeys.includes(key.toLowerCase())) {
          continue;
        }

        const value = obj[key];

        if (this.isPlainObject(value)) {
          result[key] = this.removeSensitive(value, sensitiveKeys);
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Trim all string values
   */
  private trimStrings(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (typeof value === "string") {
          result[key] = value.trim();
        } else if (this.isPlainObject(value)) {
          result[key] = this.trimStrings(value);
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Check if value is a plain object
   */
  private isPlainObject(value: any): boolean {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      Object.prototype.toString.call(value) === "[object Object]"
    );
  }
}
