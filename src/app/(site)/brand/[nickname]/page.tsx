import { PATH_NAME } from '@lib/utils/constants/path'
import { fetchMetadata } from '@lib/api/meta-data'
import { type Metadata } from 'next'
import { cookies } from 'next/headers'
import EmptyView from '@/components/common/empty-view'
import { BrandPage } from './main-component'
import { fetchUserData } from '@/lib/api/profile'

interface CompProps {
  params: {
    nickname: string
  }
  searchParams: Record<string, unknown>
}

export default async function Component({ params }: CompProps) {
  const configs = cookies().get('config_params')?.value
  try {
    const brandDetails = await fetchUserData(params.nickname, configs ? JSON.parse(configs) : undefined, true)
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
}

export async function generateMetadata({ params }: CompProps): Promise<Metadata> {
  const data: ProfileDataType = await fetchMetadata({ type: 6, slug: params.nickname })
  return {
    title: data?.title,
    // applicationName: 'Genuin',
    description: data?.description,
    openGraph: {
      title: data?.title,
      description: data?.description,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}${PATH_NAME.brand(params.nickname)}`,
      images: [
        {
          url: data?.preview_image,
        },
      ],
    },
  }
}
