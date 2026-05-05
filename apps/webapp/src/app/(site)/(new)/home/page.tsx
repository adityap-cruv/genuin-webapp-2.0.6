import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import { fetchMetadata } from "@lib/api/meta-data";

import { HomeClientPage } from "./client-page";

type HomeMetadata = {
  title: string;
  description: string;
  preview_image: string;
};

export async function generateMetadata(): Promise<Metadata> {
  const metadataParams = { type: 5 };
  const metadata: HomeMetadata = await fetchMetadata(metadataParams);
  return {
    title: metadata?.title,
    description: metadata?.description,
    openGraph: {
      title: metadata?.title,
      description: metadata?.description,
      images: [{ url: metadata?.preview_image }],
    },
  };
}

export default async function ComponentHomePage() {
  // You may want to keep using useBaseContext in the client page only
  // For SSR, you can fetch config/brandDetails here if needed, or just render the client page
  // If you want to SSR brandDetails, repeat the config fetch logic here as in generateMetadata
  // Otherwise, keep this minimal:
  return <HomeClientPage />;
}
