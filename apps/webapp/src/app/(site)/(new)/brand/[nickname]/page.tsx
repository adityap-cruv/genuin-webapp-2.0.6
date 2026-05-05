import { ProfileDetails } from "@genuin/components/page/profile-details";
import { type Metadata } from "next";

import type { IntegrationSettingsType } from "@/lib/stores/genuin-options";
import { checkWhiteLabelEnabled, getOgUrl } from "@/lib/utils";
import { fetchMetadata } from "@lib/api/meta-data";
import { PATH_NAME } from "@lib/utils/constants/path";

interface CompProps {
  params: Promise<{
    nickname: string;
  }>;
}

export default async function Page({ params }: CompProps) {
  const { nickname } = await params;
  return <ProfileDetails userName={nickname} forBrand />;
}

type ProfileDataType = {
  member_id: string;
  title: string;
  description: string;
  preview_image: string;
  integrations: IntegrationSettingsType;
  domain?: string;
  subdomain?: string;
};

export async function generateMetadata({ params }: CompProps): Promise<Metadata> {
  const nickname = (await params).nickname;
  const data: ProfileDataType = await fetchMetadata({ type: 6, slug: nickname });

  const metaUrl = checkWhiteLabelEnabled(data.integrations);
  return {
    title: data?.title,
    // applicationName: 'Genuin',
    description: data?.description,
    openGraph: {
      title: data?.title,
      description: data?.description,
      url: metaUrl
        ? metaUrl + PATH_NAME.brand(nickname)
        : getOgUrl(PATH_NAME.brand(nickname), data?.domain, data?.subdomain),
      images: [
        {
          url: data?.preview_image,
        },
      ],
    },
  };
}
