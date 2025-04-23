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

interface CompProps {
  params: {
    nickname: string
  }
  searchParams: Record<string, unknown>
}

export default async function Component({ params }: CompProps) {
  const configs = cookies().get('config_params')?.value
  let profileData

  try {
    profileData = await fetchUserData(params.nickname, configs ? JSON.parse(configs) : undefined, false)
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
}

export async function generateMetadata({ params }: CompProps): Promise<Metadata> {
  const host = headers().get('host') ?? ''
  const config = getConfig(host)
  let metadataParams = { type: 1, username: params.nickname }
  if (config) {
    metadataParams = { type: 1, username: params.nickname, ...config }
  }
  const profileMetadata: ProfileMetaDataType = await fetchMetadata(metadataParams)

  return {
    title: profileMetadata?.title,
    // appleWebApp: { capable: true },
    // applicationName: 'Genuin',
    description: profileMetadata?.description,
    openGraph: {
      title: profileMetadata?.title,
      description: profileMetadata?.description,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}${PATH_NAME.profile(params.nickname)}`,
      images: [
        {
          url: profileMetadata?.preview_image,
        },
      ],
    },
  }
}
