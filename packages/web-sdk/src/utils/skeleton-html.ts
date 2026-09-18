/**
 * HTML/CSS Skeleton Generator
 *
 * Creates lightweight HTML/CSS loading skeletons without React dependencies
 */

export interface SkeletonOptions {
  theme?: "dark" | "light";
  websiteType?: string | null;
  isDesktop?: boolean;
}

/**
 * Generate HTML skeleton for embed loading
 */
export function generateEmbedSkeletonHTML(options: SkeletonOptions = {}): string {
  const { theme = "light" } = options;

  const bgColor = theme === "dark" ? "#1a1a1a" : "#e5e5e5";
  const shimmerHighlight = theme === "dark" ? "#333333" : "#ffffff";

  return `
    <div class="gen-sdk-skeleton-container" style="
      position: relative;
      height: 100%;
      width: 100%;
      border-radius: 6px;
      overflow: hidden;
      background: ${bgColor};
      background-image: linear-gradient(
        90deg,
        ${bgColor} 0%,
        ${shimmerHighlight} 50%,
        ${bgColor} 100%
      );
      background-size: 200% 100%;
      animation: gen-sdk-shimmer 1.5s ease-in-out infinite;
    ">
    </div>
    <style>
      @keyframes gen-sdk-shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
    </style>
  `;
}

/**
 * Generate HTML skeleton for expand view loading
 */
export function generateExpandViewSkeletonHTML(options: SkeletonOptions = {}): string {
  const { theme = "light" } = options;
  const bgColor = theme === "dark" ? "#1a1a1a" : "#fafafa";
  const shimmerHighlight = theme === "dark" ? "#333333" : "#ffffff";

  return `
    <div style="
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 50;
      background: ${bgColor};
      background-image: linear-gradient(
        90deg,
        ${bgColor} 0%,
        ${shimmerHighlight} 50%,
        ${bgColor} 100%
      );
      background-size: 200% 100%;
      animation: gen-sdk-shimmer 1.5s ease-in-out infinite;
    ">
      <style>
        @keyframes gen-sdk-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      </style>
    </div>
  `;
}
