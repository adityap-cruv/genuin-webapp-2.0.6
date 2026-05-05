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
  searchParams: Record<string, unknown>;
}

export default async function Component({ params }: CompProps) {
  const { nickname } = await params;
  return <ProfileDetails userName={nickname} forBrand={false} />;
}

type ProfileMetaDataType = {
  member_id: string;
  title: string;
  description: string;
  preview_image: string;
  integrations: IntegrationSettingsType;
  domain?: string;
  subdomain?: string;
};

export async function generateMetadata({ params }: CompProps): Promise<Metadata> {
  const { nickname } = await params;
  const metadataParams = { type: 1, username: nickname };
  const profileMetadata: ProfileMetaDataType = await fetchMetadata(metadataParams);

  const metaUrl = checkWhiteLabelEnabled(profileMetadata.integrations);
  return {
    title: profileMetadata?.title,
    // appleWebApp: { capable: true },
    // applicationName: 'Genuin',
    description: profileMetadata?.description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      title: profileMetadata?.title,
      description: profileMetadata?.description,
      url: metaUrl
        ? metaUrl + PATH_NAME.profile(nickname)
        : getOgUrl(PATH_NAME.profile(nickname), profileMetadata?.domain, profileMetadata?.subdomain),
      images: [
        {
          url: profileMetadata?.preview_image,
        },
      ],
    },
  };
}
