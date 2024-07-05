import { MainComponent } from './main-component'
import { fetchBrandData } from '@lib/api/brand-profile'
import { PATH_NAME } from '@lib/utils/constants/path'
import { fetchMetadata } from '@lib/api/meta-data'
import { type Metadata } from 'next'
import { cookies } from 'next/headers'

interface CompProps {
  params: {
    nickname: string
  }
  searchParams: Record<string, unknown>
}

export default async function Component({ params }: CompProps) {
  const configs = cookies().get('config_params')?.value
  const profileData = await fetchBrandData(params.nickname, configs ? JSON.parse(configs) : undefined)
  return <MainComponent profileData={profileData} />
}

type ProfileDataType = {
  member_id: string
  title: string
  description: string
  preview_image: string
}

export async function generateMetadata({ params }: CompProps): Promise<Metadata> {
  const data: ProfileDataType = await fetchMetadata({ type: 6, slug: params.nickname })
  return {
    title: data.title,
    // applicationName: 'Genuin',
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}${PATH_NAME.brand(params.nickname)}`,
      images: [
        {
          url: data.preview_image,
        },
      ],
    },
  }
}
