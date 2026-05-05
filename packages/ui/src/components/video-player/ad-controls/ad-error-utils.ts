/**
 * Ad Error Handling Utilities for Google IMA SDK
 * Provides constants, types, and utilities for categorizing and handling ad errors
 */

// IMA SDK Error Code Ranges (based on Google IMA SDK documentation)
const IMA_ERROR_RANGES = {
  VAST: { min: 400, max: 499 }, // VAST errors (ad loading/parsing)
  VIDEO_PLAYBACK: { min: 900, max: 999 }, // Video playback errors
  CRITICAL: { min: 1000, max: Infinity }, // Critical system errors
} as const;

// Error category types
enum AdErrorCategory {
  INDIVIDUAL_AD_FAILURE = "INDIVIDUAL_AD_FAILURE", // Can be discarded, playback continues
  FATAL = "FATAL", // Requires destroying ads manager
  NON_FATAL = "NON_FATAL", // Log and continue
}

// TypeScript interfaces for error handling
export interface AdErrorResult {
  category: AdErrorCategory;
  shouldDiscard: boolean;
  shouldDestroy: boolean;
  isFatal: boolean;
  errorCode: number;
  errorType: string;
  message: string;
}

/**
 * Checks if an error code falls within a specific range
 */
function isInErrorRange(code: number, range: { min: number; max: number }): boolean {
  return code >= range.min && code <= range.max;
}

/**
 * Categorizes an ad error and determines the recovery strategy
 * @param error - The IMA SDK error object or error code string
 * @returns AdErrorResult with category and recovery flags
 */
export function categorizeAdError(error: any): AdErrorResult {
  // Extract error details
  const errorCode =
    typeof error?.getErrorCode === "function" ? error.getErrorCode() : typeof error === "string" ? error : null;

  const errorType = typeof error?.getType === "function" ? error.getType() : null;

  const message = typeof error?.getMessage === "function" ? error.getMessage() : "Unknown error";

  // Check for string-based error codes (from playererror events)
  if (typeof errorCode === "string") {
    const codeStr = errorCode.toString().toUpperCase();
    if (codeStr.includes("VAST") || codeStr.includes("NETWORK") || codeStr.includes("VIDEO")) {
      return {
        category: AdErrorCategory.FATAL,
        shouldDiscard: false,
        shouldDestroy: true,
        isFatal: true,
        errorCode: -1,
        errorType: errorType || "UNKNOWN",
        message,
      };
    }
  }

  // Convert to number for range checking
  const numericCode = typeof errorCode === "number" ? errorCode : parseInt(errorCode, 10);

  // If we can't parse the error code, treat as non-fatal
  if (isNaN(numericCode)) {
    return {
      category: AdErrorCategory.NON_FATAL,
      shouldDiscard: false,
      shouldDestroy: false,
      isFatal: false,
      errorCode: -1,
      errorType: errorType || "UNKNOWN",
      message,
    };
  }

  // Check error type from IMA SDK (if available)
  const googleIma = (window as any).google?.ima;
  if (googleIma && errorType) {
    // Individual ad load/play failures - discard ad break and continue
    if (errorType === googleIma.AdError.Type.AD_LOAD || errorType === googleIma.AdError.Type.AD_PLAY) {
      return {
        category: AdErrorCategory.INDIVIDUAL_AD_FAILURE,
        shouldDiscard: true,
        shouldDestroy: false,
        isFatal: false,
        errorCode: numericCode,
        errorType,
        message,
      };
    }

    // Ads manager load failures - fatal, destroy manager
    if (errorType === googleIma.AdError.Type.ADS_MANAGER_LOAD) {
      return {
        category: AdErrorCategory.FATAL,
        shouldDiscard: false,
        shouldDestroy: true,
        isFatal: true,
        errorCode: numericCode,
        errorType,
        message,
      };
    }
  }

  // Fallback to error code range checking
  if (isInErrorRange(numericCode, IMA_ERROR_RANGES.VAST)) {
    return {
      category: AdErrorCategory.INDIVIDUAL_AD_FAILURE,
      shouldDiscard: true,
      shouldDestroy: false,
      isFatal: false,
      errorCode: numericCode,
      errorType: errorType || "VAST_ERROR",
      message,
    };
  }

  if (
    isInErrorRange(numericCode, IMA_ERROR_RANGES.VIDEO_PLAYBACK) ||
    isInErrorRange(numericCode, IMA_ERROR_RANGES.CRITICAL)
  ) {
    return {
      category: AdErrorCategory.FATAL,
      shouldDiscard: false,
      shouldDestroy: true,
      isFatal: true,
      errorCode: numericCode,
      errorType: errorType || "FATAL_ERROR",
      message,
    };
  }

  // All other errors - non-fatal
  return {
    category: AdErrorCategory.NON_FATAL,
    shouldDiscard: false,
    shouldDestroy: false,
    isFatal: false,
    errorCode: numericCode,
    errorType: errorType || "UNKNOWN",
    message,
  };
}

/**
 * Handles ad error recovery based on categorization
 * @param adsManager - The IMA ads manager instance
 * @param errorResult - The categorized error result
 * @param playerStateRef - Reference to player state
 */
export function handleAdErrorRecovery(
  adsManager: any,
  errorResult: AdErrorResult,
  playerStateRef: { current: { isAdErrored?: boolean } }
): void {
  const { shouldDiscard, shouldDestroy, errorCode } = errorResult;

  if (shouldDiscard) {
    try {
      // const currentAd = adsManager.getCurrentAd?.()
      // if (currentAd) {
      // const universalAdIds = currentAd.getUniversalAdIds?.() || []
      // }
      adsManager.discardAdBreak();
    } catch (_discardError) {
      playerStateRef.current.isAdErrored = true;
    }
    return;
  }

  if (shouldDestroy) {
    playerStateRef.current.isAdErrored = true;

    try {
      adsManager.destroy();
    } catch (destroyError) {
      console.warn("Error destroying ads manager:", destroyError);
    }
    return;
  }

  console.log(`Non-fatal ad error, attempting to continue (Code: ${errorCode})`);
}
