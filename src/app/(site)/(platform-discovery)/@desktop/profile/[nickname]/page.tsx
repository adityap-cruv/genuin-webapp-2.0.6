import { MainComponent } from './main-component'
import { fetchUserData } from '@lib/api/profile'
import { PATH_NAME } from '@lib/utils/constants/path'
import { fetchMetadata } from '@lib/api/meta-data'
import { type Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { getConfig } from '../../../../../../middleware'
import EmptyView from '@/components/common/empty-view'
import { NOT_FOUND_ERROR_CODES } from '@/lib/constants'

interface CompProps {
  params: {
    nickname: string
  }
  searchParams: Record<string, unknown>
}

export default async function Component({ params }: CompProps) {
  const configs = cookies().get('config_params')?.value
  try {
    const profileData = await fetchUserData(params.nickname, configs ? JSON.parse(configs) : undefined)
    if (profileData.brand) {
      redirect(PATH_NAME.brand(profileData.brand.brand_slug))
    }
    return <MainComponent profileData={profileData} />
  } catch (error: any) {
    // Check the type of error
    if (error.message === NOT_FOUND_ERROR_CODES.user) {
      return <EmptyView type="user" />
    } else {
      throw new Error(error.message)
    }
  }
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
