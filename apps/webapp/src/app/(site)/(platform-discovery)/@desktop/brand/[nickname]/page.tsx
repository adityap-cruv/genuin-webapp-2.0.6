import { PATH_NAME } from '@lib/utils/constants/path'
import { fetchMetadata } from '@lib/api/meta-data'
import { type Metadata } from 'next'
import { cookies } from 'next/headers'
import EmptyView from '@/components/common/empty-view'
import { fetchUserData } from '@/lib/api/profile'
import type { IntegrationSettingsType } from '@/lib/stores/genuin-options'
import { checkWhiteLabelEnabled } from '@/lib/utils'
import { ProfileDetails } from '@genuin/components/page/profile-details'

interface CompProps {
  params: {
    nickname: string
  }
  searchParams: Record<string, unknown>
}

export default function Page({ params, searchParams }: CompProps) {
  return <ProfileDetails userName={params.nickname} forBrand />
}

type ProfileDataType = {
  member_id: string
  title: string
  description: string
  preview_image: string
  integrations: IntegrationSettingsType
}

export async function generateMetadata({ params }: CompProps): Promise<Metadata> {
  const data: ProfileDataType = await fetchMetadata({ type: 6, slug: params.nickname })

  const metaUrl = checkWhiteLabelEnabled(data.integrations)
  return {
    title: data?.title,
    // applicationName: 'Genuin',
    description: data?.description,
    openGraph: {
      title: data?.title,
      description: data?.description,
      url: metaUrl
        ? metaUrl + PATH_NAME.brand(params.nickname)
        : `${process.env.NEXT_PUBLIC_HOST_URL}${PATH_NAME.brand(params.nickname)}`,
      images: [
        {
          url: data?.preview_image,
        },
      ],
    },
  }
}
