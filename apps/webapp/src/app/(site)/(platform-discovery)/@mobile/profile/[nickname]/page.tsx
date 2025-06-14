import { PATH_NAME } from '@lib/utils/constants/path'
import { fetchMetadata } from '@lib/api/meta-data'
import { type Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import EmptyView from '@/components/common/empty-view'
import { NOT_FOUND_ERROR_CODES } from '@/lib/constants'
import { fetchUserData } from '@/lib/api/profile'
import { ProfilePage } from './main-component'
import { getConfig } from '@/middleware'
import type { IntegrationSettingsType } from '@/lib/stores/genuin-options'
import { checkWhiteLabelEnabled } from '@/lib/utils'

interface CompProps {
  params: Promise<{
    nickname: string
  }>
  searchParams: Promise<Record<string, unknown>>
}

export default async function Component({ params }: CompProps) {
  const { nickname } = await params
  const configs = (await cookies()).get('config_params')?.value
  let profileData

  try {
    profileData = await fetchUserData(nickname, configs ? JSON.parse(configs) : undefined, false)
  } catch (error: any) {
    // Check the type of error
    if (error.message === NOT_FOUND_ERROR_CODES.user) {
      return <EmptyView type="user" />
    }
    throw new Error(error.message)
  }

  if (profileData.brand) {
    redirect(PATH_NAME.brand(profileData.brand.brand_slug))
  }

  return <ProfilePage profileDetails={profileData} />
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
