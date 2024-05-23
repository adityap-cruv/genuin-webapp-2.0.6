import { MainComponent } from './main-component'
import { fetchUserData } from '@lib/api/profile'
import { PATH_NAME } from '@lib/utils/constants/path'
import { fetchMetadata } from '@lib/api/meta-data'
import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

interface CompProps {
  params: {
    nickname: string
  }
  searchParams: Record<string, unknown>
}

export default async function Component({ params }: CompProps) {
  const profileData = await fetchUserData(params.nickname)
  if (profileData.brand) {
    redirect(PATH_NAME.brand(profileData.brand.brand_slug))
  }
  return <MainComponent profileData={profileData} />
}

type ProfileDataType = {
  member_id: string
  title: string
  description: string
  preview_image: string
}

export async function generateMetadata({ params }: CompProps): Promise<Metadata> {
  const data: ProfileDataType = await fetchMetadata({ type: 1, username: params.nickname })
  const title = data.title
  const desc = data.description

  return {
    title,
    applicationName: 'Genuin',
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}${PATH_NAME.profile(params.nickname)}`,
      images: [
        {
          url: data.preview_image,
        },
      ],
    },
  }
}
