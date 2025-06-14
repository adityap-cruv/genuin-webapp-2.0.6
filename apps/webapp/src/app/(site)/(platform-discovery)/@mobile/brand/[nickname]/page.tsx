import { PATH_NAME } from '@lib/utils/constants/path'
import { fetchMetadata } from '@lib/api/meta-data'
import { type Metadata } from 'next'
import { cookies } from 'next/headers'
import EmptyView from '@/components/common/empty-view'
import { BrandPage } from './main-component'
import { fetchUserData } from '@/lib/api/profile'
import type { IntegrationSettingsType } from '@/lib/stores/genuin-options'
import { checkWhiteLabelEnabled } from '@/lib/utils'

interface CompProps {
  params: Promise<{
    nickname: string
  }>
  searchParams: Promise<Record<string, unknown>>
}

export default async function Component({ params }: CompProps) {
  const configs = (await cookies()).get('config_params')?.value
  const { nickname } = await params
  try {
    const brandDetails = await fetchUserData(nickname, configs ? JSON.parse(configs) : undefined, true)
    return <BrandPage brandDetails={brandDetails} />
  } catch (error: any) {
    // Check the type of error
    if (error.message === '5235') {
      return <EmptyView type="brand" />
    } else {
      throw new Error(error.message)
    }
  }
}

type ProfileDataType = {
  member_id: string
  title: string
  description: string
  preview_image: string
  integrations: IntegrationSettingsType
}

export async function generateMetadata({ params }: CompProps): Promise<Metadata> {
  const { nickname } = await params
  const data: ProfileDataType = await fetchMetadata({ type: 6, slug: nickname })

  const metaUrl = checkWhiteLabelEnabled(data.integrations)
  return {
    title: data?.title,
    // applicationName: 'Genuin',
    description: data?.description,
    openGraph: {
      title: data?.title,
      description: data?.description,
      url: metaUrl
        ? metaUrl + PATH_NAME.brand(nickname)
        : `${process.env.NEXT_PUBLIC_HOST_URL}${PATH_NAME.brand(nickname)}`,
      images: [
        {
          url: data?.preview_image,
        },
      ],
    },
  }
}
