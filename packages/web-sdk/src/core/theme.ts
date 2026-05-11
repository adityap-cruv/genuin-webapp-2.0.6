export interface BrandTheme {
  colors: Record<string, string>;
  theme: "light" | "dark";
}

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: BrandTheme | null = null;

  private constructor() {}

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * Apply brand colors to container (like legacy SDK)
   */
  applyBrandColors(container: HTMLElement, brandColors?: any): void {
    if (!brandColors) return;

    try {
      const parsedColors = this.parseColors(brandColors);

      // Apply CSS custom properties to container
      Object.keys(parsedColors).forEach((key) => {
        if (parsedColors[key]) {
          container.style.setProperty(key, parsedColors[key]);
          // Apply CSS custom properties to shadow root container
          const shadowRoot = container.shadowRoot;
          if (shadowRoot) {
            const rootContainer = shadowRoot.getElementById(container.id);
            if (rootContainer) {
              rootContainer.style.setProperty(key, parsedColors[key]);
            }
          }
        }
      });

      // Store theme for later use
      this.currentTheme = {
        colors: parsedColors,
        theme: this.detectTheme(parsedColors),
      };
    } catch (error) {
      console.warn("Failed to apply brand colors:", error);
    }
  }

  parseColors(colors: any) {
    const parsedColors: Record<string, string> = {};
    const categoryColors = colors["primary"];

    if (categoryColors) {
      for (const shade in categoryColors) {
        const colorCode = categoryColors[shade];
        const parsedShade = shade.split("_")[1];
        if (parsedShade) {
          parsedColors[`--gencl-color-primary-${parsedShade}`] = colorCode;
        } else {
          parsedColors[`--gencl-color-primary`] = colorCode;
        }
      }
    }

    return parsedColors;
  }

  /**
   * Apply theme classes to container
   */
  applyTheme(container: HTMLElement, customization?: any): void {
    if (!customization) return;

    // Handle dark theme
    if (customization.theme === "dark") {
      container.classList.add("dark");
    }

    // For existing dark mode users (legacy support)
    if (container.classList.contains("gen-sdk-dark")) {
      container.classList.add("dark");
    }

    // Apply brand colors if available
    if (customization.brandColors) {
      Object.keys(customization.brandColors).forEach((key) => {
        container.style.setProperty(key, customization.brandColors[key]);
      });
    }
  }

  /**
   * Detect if theme should be light or dark based on colors
   */
  private detectTheme(colors: Record<string, string>): "light" | "dark" {
    // Simple heuristic - check if background is dark
    const bgColor = colors["--background"] || colors["--bg"] || "#ffffff";
    const brightness = this.getBrightness(bgColor);
    return brightness < 128 ? "dark" : "light";
  }

  /**
   * Calculate brightness of a color
   */
  private getBrightness(color: string): number {
    // Remove # if present
    const hex = color.replace("#", "");

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate brightness using luminance formula
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): BrandTheme | null {
    return this.currentTheme;
  }

  /**
   * Reset theme
   */
  reset(): void {
    this.currentTheme = null;
  }

  /**
   * Apply special brand customizations (like legacy SDK brand_id 1939)
   */
  applySpecialBrandCustomizations(brandId: number, customization: any): any {
    if (brandId === 1939 && customization) {
      return {
        ...customization,
        enable_brand_click: false,
        enable_community_click: false,
        show_join_community_button: false,
        show_view_loop_button: false,
        show_share_icon: false,
        show_comments_section: false,
      };
    }
    return customization;
  }
}
