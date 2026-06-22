import "@genuin/components/styles";
import { VideoElementProvider } from "@genuin/ui/components/video-player";
import { type Metadata, type Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies, headers } from "next/headers";
import { type Session } from "next-auth";

import { GenuinSdkLoader } from "@components/genuin-sdk-loader";
import SiteProviders from "@components/providers/site-providers";
import { getEmbedConfig } from "@lib/api/config";
import { type ConfigType } from "@lib/stores/genuin-options";
import { cn, parseBrandColors } from "@lib/utils";
import { parseSdkParams } from "@lib/utils/parse-sdk-params";

import { auth } from "../../../../auth";
import Error from "../../error";
import "../../globals.css";

// Enhanced font configuration for better performance
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Ensures text remains visible during font load
  preload: true, // Preloads font files
  fallback: ["system-ui", "sans-serif"], // Fallback fonts
  adjustFontFallback: true, // Automatically adjusts the fallback font to match
});

// Metadata API for Next.js 15
export const metadata: Metadata = {
  description: "A video community platform",
  metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL ?? "https://begenuin.com"),
};

export const viewport: Viewport = {
  height: "device-height",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // SSR logic for config/session/cookies
  const configParamsStr = (await cookies()).get("config_params")?.value || "";
  let configParams = null;
  if (configParamsStr) configParams = JSON.parse(configParamsStr);
  let userSession: Session | null = null;
  if (configParams) {
    userSession = await auth();
  }

  let config: ConfigType | undefined;
  if (configParams) {
    try {
      config = await getEmbedConfig(configParams);
    } catch (_e) {
      return (
        <html lang="en">
          <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </head>
          <body className={inter.className}>
            <Error />
          </body>
        </html>
      );
    }
  }
  // if in case brand not found render inactive page
  if (
    !config ||
    (typeof config === "object" && Object.keys(config).length === 0) ||
    config.brand_id === undefined ||
    config.brand_id === ""
  ) {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta httpEquiv="refresh" content="0; url=/inactive" />
        </head>
        <body className={inter.className}></body>
      </html>
    );
  }
  const searchParamsStr = (await headers()).get("x-search-params") ?? "";
  const sdkParams = parseSdkParams(searchParamsStr);
  const favicon = !config?.protected_content ? config?.favicon : undefined;
  const brandColors = parseBrandColors(config?.brand_colors || {});

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href={favicon ?? "/favicon.svg"} />
        <link rel="mask-icon" href={favicon ?? "/favicon.svg"} />
        <meta rel="x-brand-id" content={config?.subdomain} />
        {config?.brand_id == "2793" && <meta name="robots" content="noindex,nofollow" />}
        {/* Add any other head elements here */}
      </head>
      <body
        className={cn(inter.className, "important-fixed")}
        style={{
          ...brandColors,
          /* iOS Safari specific fixes */
          // WebkitOverflowScrolling: 'touch',
          width: "100%",
          height: "100%",
        }}>
        <SiteProviders config={config} session={userSession}>
          <VideoElementProvider>{children}</VideoElementProvider>
        </SiteProviders>
        {sdkParams && config.api_key && <GenuinSdkLoader apiKey={config.api_key} params={sdkParams} />}
      </body>
    </html>
  );
}
