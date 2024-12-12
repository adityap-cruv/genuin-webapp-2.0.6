import { type Metadata } from 'next'
import { MainComponent } from './main-component'
import { fetchUserData } from '@lib/api/profile'
import { PATH_NAME } from '@lib/utils/constants/path'
import { fetchMetadata } from '@lib/api/meta-data'
import { redirect } from 'next/navigation'
import { headers, cookies } from 'next/headers'
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
  let profileData

  try {
    profileData = await fetchUserData(params.nickname, configs ? JSON.parse(configs) : undefined)
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

  return <MainComponent profileData={profileData} />
}

interface ProfileDataType {
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
  const data: ProfileDataType = await fetchMetadata(metadataParams)

  return {
    title: data?.title,
    // applicationName: 'Genuin',
    description: data?.description,
    openGraph: {
      title: data?.title,
      description: data?.description,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}${PATH_NAME.profile(params.nickname)}`,
      images: [
        {
          url: data?.preview_image,
        },
      ],
    },
  }
}
