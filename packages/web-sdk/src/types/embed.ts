export enum EmbedStyle {
  FEED = "feed",
  CAROUSEL = "carousel",
  FLOATING = "floating",
  STANDARD_WALL = "standard_wall",
}

export interface EmbedConfig {
  // Required
  elementId: string;

  // Embed settings
  style: EmbedStyle;
  theme?: "light" | "dark";

  // Display options
  showHeader?: boolean;
  allowInteractions?: boolean;
  showComments?: boolean;
  showReactions?: boolean;
  showShare?: boolean;

  // Dimensions
  maxHeight?: number;
  maxWidth?: number;
  autoResize?: boolean;

  // Authentication
  authRequired?: boolean;
  authUrl?: string;

  // API settings
  baseUrl?: string;
  apiKey?: string;
  token?: string;

  // Custom branding
  brandColors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };

  // Event callbacks
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onResize?: (height: number) => void;
  onUserInteraction?: (data: any) => void;
}

export interface EmbedState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  height: number;
  width: number;
}

export interface EmbedMessage {
  type: string;
  payload?: any;
  embedId: string;
  timestamp: number;
}

// Legacy type mappings for backward compatibility
export type ViewType = EmbedStyle;
export type SDKConfig = Partial<EmbedConfig> & {
  // Legacy fields
  embed?: number;
  brand_id?: number;
  hide_navbar?: number;
  community?: string;
  loop?: string;
  video?: string;
  style?: "carousel" | "feed";
  subdomain?: string;
  embed_page?: string;
  embed_id?: string;
};

export type EmbedDetailsType = {
  name: string;
  style: string;
  type: string;
  brand_id: string;
  customization: any;
  embed_id: string;
  environment: string;
  // Add other properties as needed
};
