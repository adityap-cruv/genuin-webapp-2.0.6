/**
 * HTML/CSS Skeleton Generator
 *
 * Creates lightweight HTML/CSS loading skeletons without React dependencies
 */

export interface SkeletonOptions {
  theme?: 'dark' | 'light'
  websiteType?: string | null
  isDesktop?: boolean
}

/**
 * Generate HTML skeleton for embed loading
 */
export function generateEmbedSkeletonHTML(options: SkeletonOptions = {}): string {
  const { theme = 'light', websiteType, isDesktop = false } = options

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#e5e5e5'
  const shimmerColor = theme === 'dark' ? '#2a2a2a' : '#f0f0f0'
  const isPolaris = websiteType === 'polaris'

  const skeletonItems = Array.from({ length: 6 }, (_, i) => {
    const width = !isDesktop && isPolaris ? '100%' : 'auto'
    const height = !isDesktop && isPolaris ? 'auto' : '100%'
    const aspectRatio = !isDesktop && isPolaris ? '1' : '1'

    return `
      <div class="gen-sdk-skeleton-item" style="
        aspect-ratio: ${aspectRatio};
        ${width !== 'auto' ? `width: ${width};` : ''}
        ${height !== 'auto' ? `height: ${height};` : ''}
        flex-shrink: 0;
        border-radius: 6px;
        background: ${shimmerColor};
        animation: gen-sdk-shimmer 1.5s ease-in-out infinite;
      "></div>
    `
  }).join('')

  const containerHeight = !isDesktop && isPolaris ? '100%' : 'calc(100% - 68px)'
  const flexDirection = !isDesktop && isPolaris ? 'column' : 'row'

  return `
    <div class="gen-sdk-skeleton-container" style="
      position: relative;
      height: 100%;
      width: 100%;
      border-radius: 6px;
      ${isDesktop ? `background: ${bgColor};` : ''}
    ">
      ${websiteType ? `
        <div style="
          height: ${containerHeight};
          width: 100%;
          display: flex;
          overflow: auto;
          gap: 8px;
          flex-direction: ${flexDirection};
        ">
          ${skeletonItems}
        </div>
      ` : `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border: 3px solid ${shimmerColor};
          border-top-color: ${bgColor};
          border-radius: 50%;
          animation: gen-sdk-spin 0.8s linear infinite;
        "></div>
      `}
    </div>
    <style>
      @keyframes gen-sdk-shimmer {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.6;
        }
      }
      @keyframes gen-sdk-spin {
        to {
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }
    </style>
  `
}

/**
 * Generate HTML skeleton for expand view loading
 */
export function generateExpandViewSkeletonHTML(options: SkeletonOptions = {}): string {
  const { theme = 'light' } = options
  const bgColor = theme === 'dark' ? '#1a1a1a' : '#fafafa'

  return `
    <div style="
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 50;
      background: ${bgColor};
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 40px;
        height: 40px;
        border: 3px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e5e5'};
        border-top-color: ${bgColor};
        border-radius: 50%;
        animation: gen-sdk-spin 0.8s linear infinite;
      "></div>
      <style>
        @keyframes gen-sdk-spin {
          to {
            transform: rotate(360deg);
          }
        }
      </style>
    </div>
  `
}

