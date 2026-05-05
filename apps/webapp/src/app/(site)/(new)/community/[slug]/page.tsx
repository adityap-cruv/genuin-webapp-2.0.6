import { type Metadata } from "next";

import { getOgUrl } from "@/lib/utils";
import { fetchMetadata } from "@lib/api/meta-data";
import { PATH_NAME } from "@lib/utils/constants/path";

import { CommunityClientPage } from "./client-page";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ feed?: string }>;
}

export default async function CommunityPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const isFeed = resolvedSearchParams.feed === "1";
  return <CommunityClientPage slug={resolvedParams.slug} isFeed={isFeed} />;
}

interface CommunityDataType {
  title: string;
  description: string;
  preview_image: string;
  domain?: string;
  subdomain?: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const communityData: CommunityDataType = await fetchMetadata({ type: 2, slug: resolvedParams.slug });
  return {
    title: communityData?.title,
    description: communityData?.description,
    openGraph: {
      title: communityData?.title,
      description: communityData?.description,
      url: getOgUrl(PATH_NAME.community(resolvedParams.slug), communityData?.domain, communityData?.subdomain),
      images: [{ url: communityData?.preview_image }],
    },
  };
}
