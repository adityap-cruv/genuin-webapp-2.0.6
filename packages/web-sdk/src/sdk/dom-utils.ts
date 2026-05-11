import { generateEmbedSkeletonHTML } from "../utils/skeleton-html";

// Error view function
export function loadErrorView(container: HTMLElement): void {
  container.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
      padding: 20px;
      font-family: Arial, sans-serif;
      color: #666;
      text-align: center;
    ">
      <div>
        <h3 style="margin: 0 0 10px 0; color: #333;">Unable to load content</h3>
        <p style="margin: 0; font-size: 14px;">Please check your configuration and try again.</p>
      </div>
    </div>
  `;
}

// Loading view function - uses HTML/CSS skeleton (no React)
export function renderEmbedSkeleton(container: HTMLElement, theme?: "dark" | "light"): void {
  // Use HTML/CSS skeleton instead of React for faster initial load
  const websiteType = container.getAttribute("data-website-type");
  const isDesktop = window.innerWidth >= 768; // Simple desktop detection

  container.innerHTML = generateEmbedSkeletonHTML({
    theme,
    websiteType,
    isDesktop,
  });
}
