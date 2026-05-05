import { type Metadata } from "next";

import { getOgUrl } from "@/lib/utils";
import { fetchMetadata } from "@lib/api/meta-data";
import { PATH_NAME } from "@lib/utils/constants/path";

import { GroupClientPage } from "./client-page";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, unknown>>;
}

export default async function GroupPage({ params }: Props) {
  const resolvedParams = await params;
  return <GroupClientPage slug={resolvedParams.slug} />;
}

interface GroupDataType {
  title: string;
  description: string;
  preview_image: string;
  domain?: string;
  subdomain?: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const groupData: GroupDataType = await fetchMetadata({ type: 3, slug: resolvedParams.slug });
  return {
    title: groupData?.title,
    description: groupData?.description,
    openGraph: {
      title: groupData?.title,
      description: groupData?.description,
      url: getOgUrl(PATH_NAME.loop(resolvedParams.slug), groupData?.domain, groupData?.subdomain),
      images: [{ url: groupData?.preview_image }],
    },
  };
}
