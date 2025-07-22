import { PATH_NAME } from '@lib/utils/constants/path'
import { fetchMetadata } from '@lib/api/meta-data'
import { type Metadata } from 'next'
import { headers } from 'next/headers'
import type { IntegrationSettingsType } from '@/lib/stores/genuin-options'
import { checkWhiteLabelEnabled } from '@/lib/utils'
import { ProfileDetails } from '@genuin/components/page/profile-details'
import { getConfig } from '@/middleware'

interface CompProps {
  params: Promise<{
    nickname: string
  }>
  searchParams: Record<string, unknown>
}

export default async function Component({ params }: CompProps) {
  const { nickname } = await params
  return <ProfileDetails userName={nickname} forBrand={false} />
}

type ProfileMetaDataType = {
  member_id: string
  title: string
  description: string
  preview_image: string
  integrations: IntegrationSettingsType
}

export async function generateMetadata({ params }: CompProps): Promise<Metadata> {
  const { nickname } = await params
  const host = (await headers()).get('host') ?? ''
  const config = getConfig(host)
  let metadataParams = { type: 1, username: nickname }
  if (config) {
    metadataParams = { type: 1, username: nickname, ...config }
  }
  const profileMetadata: ProfileMetaDataType = await fetchMetadata(metadataParams)

  const metaUrl = checkWhiteLabelEnabled(profileMetadata.integrations)
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
        : `${process.env.NEXT_PUBLIC_HOST_URL}${PATH_NAME.profile(nickname)}`,
      images: [
        {
          url: profileMetadata?.preview_image,
        },
      ],
    },
  }
}
